---
date: "2024-07-11"
tags:
  - postgres
  - architecture
title: Postgres as document store, or "you don't need ORM in Node.js"

cover:
  relative: true
  image: cover.jpg
---

For quite few years now I've been betting on Postgres. After seeing what it's capable
with PostGIS, FTS and other non-standard SQL workloads, I also started using it as my
NoSQL database. In this post I want to share with you how I'm using Postgres as my document
store for OLTP workloads.

I started using it that way few years ago, when building [CrossKeeper](https://crosskeeper.app)
(now decommissioned),
after getting a "query rewrite fatigue" due to constantly changing requirements. This was causing many changes
to data models and table schema. We already had a lot of data in Postgres and didn't want to migrate
away from it. We also planned to move back parts of the data to relational model once requirements
stabilize a bit. In the end it's more performant and helps with data consistency.

We ended up staying with document-like store till the very end of the product. It worked
very well for us, even when we stopped moving things around so much. It also worked well for
me through the years.

## Database Schema

We wanted things to be simple, so after some time most of our postgres tables looked like this:

```sql
 Column  |            Type             | Nullable | Default 
---------+-----------------------------+----------+---------
 id      | uuid                        | not null | 
 created | timestamp without time zone | not null | now()
 updated | timestamp without time zone |          | 
 data    | jsonb                       | not null | 
```

You could event limit that to only `id` and `data` columns (heck even only `data` if you're brave enough),
but storing *created* and *updated* stamps outside the main data allows us to do some fancy things like
optimistic locking and makes manual querying for suspicious data easier.
Just remember that, **application can only mess with `data` column** rest is for
infrastructure.

Whenever you need a new *aggregate*, you create a new table in database with structure like this.
The only thing that changes in schema later on are the **indexes**. Of course you need to manage them
to match your querying patterns if you start doing something more than CRUD by `id`.

## Repositories - you don't need ORM

ORMs are very useful tools, especially outside of JavaScript, where JSON is a native
data structure. Manually mapping all fields from classes/objects into JSON
is tedious and boring job. Nobody wants to do that. But ORMs have a tendency to leak
into your domain and application logic. After some time you start seeing
queries inside a controller. You start to notice persistence/ORM related
annotations in your entities and aggregates. And after a while there's no way
you're going to migrate to some other storage or change database layout in any
meaningful way. What I'm proposing here, is to follow `Repository` pattern from DDD
and keep all your database related logic contained in one place for each aggregate.
Even if you don't strictly follow DDD.

This way you'll be able not only to easily localize all queries and serialization logic,
but also swap database layout without changing any code outside of single file.

There's also one more benefit of designing your application layer like this - most
of repository code can be reused. And thanks to dynamic structure of JavaScript and
JSON being it's native data type, you can just pass objects as is to and from database.
No need for complex field mapping.

### Base Repository

Let's start with base repository. This one does not handle any JSON mapping yet. It's just a base logic
to handle things like transaction and pooling of DB connections:

```typescript
export abstract class Repository {
  protected pgPool: pg.Pool
  protected tx?: pg.ClientBase

  constructor(pgPool: pg.Pool) {
    this.pgPool = pgPool
  }

  //Subclasses need to override this
  protected abstract clone(): this

  //Returns new instance bound to transaction
  public withTx(tx: pg.ClientBase): this {
    const repo = this.clone()
    repo.tx = tx
    return repo as this
  }

  //Method overloads left out for brevity
  protected async execute<T>(
    fnOrQuery: ((client: pg.ClientBase) => Promise<T>) | string | pg.QueryConfig,
    ...args: unknown[]
  ): Promise<T> {
    const releaseClient = !this.tx
    const client = this.tx || (await this.pgPool.connect())

    try {

      if (typeof fnOrQuery === 'string') {
        return (await client.query(fnOrQuery, args)) as T
      } else if (typeof fnOrQuery === 'object') {
        return (await client.query(fnOrQuery)) as T
      } else {
        return await fnOrQuery(client)
      }
    } finally {
      if (releaseClient) {
        await (client as pg.PoolClient).release()
      }
    }
  }
}
```

### JSON Repository

Now let's get to the meat. We'll create a base class for all the JSON repositories in system.
All aggregate repositories will extend it, adding just domain specific queries.

First we need few basic types to make our repository type-safe:

```typescript
export type Entity = {
  id: Id
}
export type SavedEntity<T extends Entity> = T & {
  created: Date
  updated: Date
  //This hidden field we'll use to decide if we should insert or update row in DB
  //There are many ways you can solve it, but this one is simple and effective
  __managed: boolean
}
export type JsonData<R extends Entity> = Exclude<R, Entity>
export type JsonRow<D> = {
  id: Id
  created: Date
  updated: Date
  data: D
}
```

And a helper function to generate base queries for given table, so we don't need to create
them each time we query something:

```typescript
const buildQueries = (table: string) =>
({
  __table: table,
  fetchById: `SELECT * FROM ${table} WHERE id=$1`,
  deleteById: `DELETE FROM ${table} WHERE id=$1`,
  insert: `INSERT INTO ${table} (id, tenant_id, data) VALUES ($1, $2, $3) RETURNING *`,
  update: `UPDATE ${table} SET updated=NOW(), data=$2 WHERE id=$1 RETURNING *`,
  _upsert: `INSERT INTO ${table}
  (id, created, updated, tenant_id, data) VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (uuid) DO UPDATE SET updated=$3, data=$4
  RETURNING *
`,
}) as const
type Queries = ReturnType<typeof buildQueries>
```

And here's base for your repository:

```typescript
export abstract class JsonRepository<
  T extends Entity,
  R = JsonData<T>,
> extends Repository {
  private query: Queries

  constructor(tableNameOrQueries: string | Queries, pool: pg.Pool) {
    super(pool)
    if (typeof tableNameOrQueries === 'string') {
      this.query = buildQueries(tableNameOrQueries)
    } else {
      this.query = tableNameOrQueries
    }
  }

  protected deserialize(row: JsonRow<R>): SavedEntity<T> {
    return {
      ...row.data,
      __managed: true,
      id: row.id,
      created: row.created,
      updated: row.updated,
    } as unknown as SavedEntity<T>
  }

  protected serialize(data: T): R {
    return omit(data, '__managed') as unknown as R
  }

  async fetch(id: Id): Promise<T | undefined> {
    const { rows } = await this.execute(client =>
      client.query(this.query.fetchById, [id])
    )
    const entity = rows.map(this.deserialize)[0]
    if(entity) entity.__managed = true
    return entity
  }

  async save(entity: T | SavedEntity<T>): Promise<SavedEntity<T>> {
    if ((entity as SavedEntity<T>).__managed) {
      return this.update(entity as SavedEntity<T>)
    } else {
      return this.insert(entity)
    }
  }

  async insert(entity: T): Promise<SavedEntity<T>> {
    const serialized = this.serialize(entity)
    const res = await this.execute(client =>
      client.query(this.query.insert, [entity.id, this.tenantId, serialized])
    )
    if (res.rowCount !== 1) {
      throw new Error('Insert failed')
    }
    return this.deserialize(res.rows[0])
  }

  async update(entity: SavedEntity<T>): Promise<SavedEntity<T>> {
    const serialized = this.serialize(entity)
    const res = await this.execute(client =>
      client.query(this.query.update, [entity.id, serialized])
    )

    if (res.rowCount !== 1) {
      throw new Error('Insert failed')
    }
    return this.deserialize(res.rows[0])
  }

  async delete(entity: SavedEntity<T>): Promise<T>
  async delete(id: Id): Promise<number>
  async delete(idOrEntity: Id | SavedEntity<T>): Promise<number | T> {
    if (typeof idOrEntity === 'string') {
      return this.deleteById(idOrEntity)
    } else {
      const res = await this.execute(client =>
        client.query(this.query.deleteById, [idOrEntity.id])
      )
      if ((res.rowCount = 0)) {
        throw new Error(
          `Entity with id ${idOrEntity.id} not found in ${this.query.__table}`
        )
      } else if (res.rowCount > 1) {
        throw new Error(
          `More than one entity with id ${idOrEntity.id} found in ${this.query.__table}`
        )
      } else {
        const copy = { ...idOrEntity }
        copy.__managed = false
        return copy
      }
    }
  }
}
```

...Phew 😮‍💨 that was a lot of code. But it will handle all CRUD operations on all aggregates in your
system. There's only one more thing to add and we can start using it. We need a way to create new transactions
and bind our repositories to it. I know it somewhat diverges from what DDD preaches. You should
make your aggregate a transaction boundary, but that makes a lot of things complicated. Using
cross-repository transactions is much easier. And doesn't create so much headaches in small-ish systems.
So here it goes:

```typescript
export const withTx = async <T>(
  client: pg.Pool | pg.ClientBase,
  fn: (client: pg.ClientBase) => Promise<T>
): Promise<T> => {
  let release = false
  if (client instanceof pg.Pool) {
    client = await client.connect()
    release = true
  }

  await client.query('BEGIN')
  try {
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    if (release) {
      ;(client as pg.PoolClient).release()
    }
  }
}
```

## Aggregate repositories

So how do you use something like this? Here's a simple repository:

```typescript
export class CarRepository extends JsonRepository<Car> {
  constructor(pool: pg.Pool) {
    super('cars', pool)
  }

  protected clone(): this {
    return new CarRepository(this.pgPool) as this
  }

  public async fetchBeforeYear(year: number): Promise<Car[]> {
    const { rows } = await this.execute(client =>
      client.query(`SELECT * FROM cars WHERE (data->'year')::int < $1`, [year])
    )
    return rows.map(this.deserialize)
  }
}
```

And here's how you can use these repositories in your use cases. With shared
transaction:

```typescript
const changeOwnerUseCase =
  (pool: pg.Pool, cars: CarRepository, users: UserRepository) =>
  async (regNo: CarRegNo, user: Email): Promise<Car> => {
    return withTx(pool, async tx => {
      const owner = await users.withTx(tx).fetchByEmail(user)
      const car = await cars.withTx(tx).fetchByRegNo(regNo)

      const updatedCar = await updateOwnerInDomainLayer(car, owner)
      return cars.withTx(tx).save(updatedCar)
    })
  }
```

You can also use them without transaction by simply calling `users.fetchByEmail(user)`.
This will lease connection from `pg.Pool`, execute query and return connection to pool.
It makes your code super concise if you don't care about transactions.

## Final Notes

I find this way of organizing my database access code really flexible. I can easily
add more queries and more aggregates. Whenever I need to customize serialization
or deserialization logic, I simply overwrite `serialize` and `deserialize` methods.
If I need to do it only for specific query, I simply use different serialization function
in that particular function. This covers 99% of my needs for ORM in Node.js while
giving me a nice way to not use classes (which I'm not a big fan of) in my model.

### So why are classes here

I usually try to build my data model around simple data structures, multiple types protecting invariants
and stateless functions that operate on these structures. But here, for repositories I have
used classes. The reason for that is simply to improve performance when binding them to transactions
 while keeping nice ergonomics of just doing `withTx(tx).query(...)`.
Without classes or prototypes I would have to copy all repository functions whenever I do that, and as I have tested in
"[Will Chrome optimize your object factories]({{< ref "/post/2017-08-22_will-chrome-optimize-your-object-factories" >}})"
all this copying doesn't seem to be optimized away by the V8 VM.