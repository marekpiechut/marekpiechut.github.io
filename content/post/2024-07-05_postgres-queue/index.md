---
date: "2024-07-05"
tags:
  - postgres
  - architecture
title: (Not so) simple Postgres queue system skeleton

cover:
  image: cover.jpg
---

Postgres is a very versatile database system. It can be used for so much more than
just storing data. In this post I'll show you how you can create a fully
functional job queue using Postgres.

**Note:** This post is loosely based on my [pgqueue](https://github.com/marekpiechut/pgqueue) library and code samples might not
work out of the bat, as they were adopted to fit the post. When something does not
work check library code, or play with it for 5 minutes to find a fix. Also **it's not a full
solution**. I've left all the "uninteresting" parts to the reader 🤭.

## Why not just **FOR UPDATE SKIP LOCKED**

Most of articles out there propose to just use a single table and `FOR UPDATE SKIP LOCKED`. While it's valid
to build your queue around that, it has few issues I'm trying to solve with my a bit more involved design. Especially:

- Workers should be able to **arbitrarily set job timeouts** (every job could have different timeout)
- Workers should be able to **extend job timeout** in the middle of work
- Workers should be able to **steal timeouted jobs**
- Failed worker transaction should **not undo changes on work items**
- It should handle **very long** running jobs - longer than tx timeout
- Long running jobs should **survive database restarts**
- **Job scheduling should be a bit smarter**, than just pick an item from the top

We'll actually use the famous `FOR UPDATE SKIP LOCKED` statement, but only in scheduling part,
not in the actual work queue.

## Database structure

There are few tables we need to create to get us started. I would propose you create them
in their own schema, separated from your regular application data. Of course you can add
more data to these tables if you need, or remove scheduling or retry stuff if you don't need it.
In [pgqueue](https://github.com/marekpiechut/pgqueue) there's a lot more stuff related to scheduling
and worker types. But we don't need that here.

```sql
CREATE TABLE QUEUES.QUEUE (
  id UUID NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 0,
  queue VARCHAR(255) NOT NULL,
  state VARCHAR(40) NOT NULL,
  tries INTEGER NOT NULL DEFAULT 0,
  delay BIGINT,
  run_after TIMESTAMP,
  payload BYTEA,
  payload_type VARCHAR(255),
  PRIMARY KEY(id)
);
CREATE INDEX IX_QUEUE_STATE_RUN_AFTER_CREATED ON QUEUES.QUEUE (state, run_after, created);

CREATE TABLE QUEUES.WORK_QUEUE (
  id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  batch_order INTEGER NOT NULL DEFAULT 0,
  started TIMESTAMP,
  lock_key VARCHAR(255),
  lock_timeout TIMESTAMP,
  PRIMARY KEY(id),
  FOREIGN KEY(id) REFERENCES QUEUES.QUEUE(id) ON DELETE CASCADE
);
CREATE INDEX IX_WORK_QUEUE_CREATED_ORDER ON QUEUES.WORK_QUEUE (created, batch_order)
```

- **QUEUE** - here we'll be pushing our work items from application.
- **WORK_QUEUE** - here our scheduler will push items that our workers should take care of.
- **INDEXES** - we create some basic indexes that will speed up processing of queue.
  You should probably add more, if you plan on showing queue items in UI, sort them and filter, etc.

## Pushing to queue

Pushing is pretty straightforward. You simply insert a new item into `queue` table and leave
rest of the work to schedulers and workers. A simple `INSERT INTO QUEUES.QUEUE` should be enough.

## Scheduling work

Scheduler process is periodically polling the `queue` and scheduling work in `work_queue`.
We need it, so we can add some more complex rules on how we want to prioritize work, ex:

- Queue fairness (so high volume queues won't starve low volume ones)
- Complex runtime priorities that could not be decided when item was pushed to queue
- Throttling rules based on amount of free workers

and all other weird ideas you might have, that would be hard to implement in
simple `SELECT * FROM QUEUE ORDER BY CREATED LIMIT 1 FOR UPDATE SKIP LOCKED` query.

So what will our scheduler do? It will run query like this every second:

```sql
SELECT *
  FROM QUEUES.QUEUE
  WHERE (state='PENDING' OR state='RETRY') AND (run_after IS NULL OR run_after <= now())
  ORDER BY created, id ASC
  LIMIT 100 FOR UPDATE SKIP LOCKED;
```

Read the rows from this query, play with them, shuffle, sort by whatever you need and then push to queue
in single batch with `batch_order` field providing ordering for workers:

```sql
INSERT INTO QUEUES.WORK_QUEUE (id, batch_order)
SELECT * FROM UNNEST(
  { 'uuid1', 'uuid2', 'uuid3' }::uuid[],
  { 1, 2, 3 }::integer[]
) ON CONFLICT DO NOTHING;
```

On conflict we skip, in case by some random circumstance some other scheduling process has already pushed
one of the items we have.

Usually scheduler shouldn't have a lot to do, so it should be enough to have only one instance. You could also
limit amount of pushed items if you see that `work_queue` is getting too large.

### Why polling ❓

There are ways to build scheduling and worker logic without polling (ex: by using `LISTEN/NOTIFY` and triggers),
but in a busy system there's plenty of work. So scheduler and workers won't probably have a lot of wait time.
If query has returned full batch (100 items), we re-run poll immediately. This way, if there's plenty of work,
we don't wait to process it. If there's not enough work, we just wait 1 second. Usually not a big deal.

## Processing work

Your worker processes can now pick items from the top, ordering by `created` and `batch_order`.
You can pull top items while also locking them in single query like this:

```sql
WITH next AS (
    SELECT *
    FROM QUEUES.WORK_QUEUE
    WHERE lock_key IS NULL OR lock_timeout < now()
    ORDER BY created, batch_order ASC
    LIMIT 10 FOR UPDATE SKIP LOCKED
)
UPDATE {{schema}}.WORK_QUEUE as updated
SET lock_key = ${nodeId},
    started = now(),
    version = updated.version + 1,
    lock_timeout = (now() + (${timeoutSeconds} || ' seconds')::INTERVAL)
FROM next
WHERE updated.id = next.id
RETURNING updated.*;
```

As you can see, I'm pulling items in batches by 10. You can switch to single item, but it
should be a bit easier on the database, to not query it so often. What's also interesting
is that I'm using a node-unique `lock_key` column value. So I always know which node 
has locked the item and is currently processing it. Using this lock key you
can also restart all items for given node in case it crashes:

```sql
UPDATE QUEUES.WORK_QUEUE
SET lock_key = NULL,
    lock_timeout = NULL,
    started = NULL
WHERE lock_key = ${nodeId}
```

In your processing code you then just:

- Pick item
- Start a new transaction
- Process item
- Rollback or commit transaction
- Delete item from `work_queue`
- Update or delete item from `queue`

## Final notes

From here you should be able to extend your queue with things like retries,
delays, priorities... You can add queue history to inspect
old jobs, etc. Or any other idea you might have.

Just remember to always use sql parameters to
secure yourself from sql injection attacks. Be safe.
