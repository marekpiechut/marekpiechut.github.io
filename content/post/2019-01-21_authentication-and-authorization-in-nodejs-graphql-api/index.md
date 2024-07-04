---
title: "Authentication and Authorization in NodeJS GraphQL API"
author: "Marek Piechut"
date: 2019-01-21T13:29:06.122Z
lastmod: 2024-06-30T12:43:43Z

description: ""

subtitle: "Most of GraphQL APIs that are developed are probably not meant for public access without any authorization. Sooner or later you’ll need to…"

image: images/1.jpeg
cover: 
  image: images/1.jpeg 
images:
 - "images/1.jpeg"
 - "images/2.png"


aliases:
    - "/authentication-and-authorization-in-nodejs-graphql-api-58528f6fce5f"

---

![image](images/1.jpeg#layoutTextWidth)

Most of GraphQL APIs that are developed are probably not meant for public access without any authorization. Sooner or later you’ll need to somehow limit access to only authenticated users or limit resources so that only allowed users are able to see them.

In this post, we’ll take a look at how you could implement GraphQL security in applications using NodeJS, Passport and Apollo Server.

### Ways to implement authentication

There are a few ways you could add access rights to your GraphQL APIs:

* If your requirements are simple, you can just allow all access to logged in users and decline it to the general public. This could be easily done in a context factory (we’ll go through that later on).
* You could check access rights in your resolvers and fine grain it based on requested data, current session and returned objects.
* Move security code into your domain logic and fail there if access should not be granted.
* Add directives to your schema and make security declarative.
* Leave all security to other services if your GraphQL is only a facade to other systems.

### Where to keep security code

I think, that security is rarely something domain specific but rather part of system infrastructure and does not belong to domain code. Moving it to domain layer would also mean you make it dependent on session data and web application concepts. That’s not what we usually want.

Keeping it in directives may look very elegant at first, but it makes things really complex if you need something more than simple role-based authorization. You might end up with a brand new [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) on top of GraphQL schema language to get something more from it.

What we have left is to keep it in GraphQL resolvers and that’s what we’ll focus on in this article. Keeping authorization code there is very elastic and does not pollute your domain logic.

### Starting Point

Technologies we’ll be using:

* [NodeJS](http://nodejs.org)
* [ExpressJS](http://expressjs.com)
* [Passport](http://www.passportjs.org)
* [Apollo Server 2.0](https://www.apollographql.com/docs/apollo-server/)
* [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/features/graphql-playground.html)

To make things simpler I assume you already have Passport configured and some basic way to authenticate in your system. If you need help with that, check out [this](https://reallifeprogramming.com/node-authentication-with-passport-postgres-ef93e2d520e7) article on [RealLifeProgramming](https://reallifeprogramming.com/node-authentication-with-passport-postgres-ef93e2d520e7) to get you up and running.

I also assume you have some knowledge about GraphQL and some GraphQL API that we’re going to secure. Make also sure you have [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/features/graphql-playground.html) or some other way to test things out.

### Know your user

To do any access right checks we first need to know who is trying to access the resources. When using Passport we already have everything in place and can retrieve the user from the session (or get nothing if the user is not authenticated).

To retrieve Passport session data we need to first make sure to setup Passport before registering Apollo middleware, so when we hit any resolver we’re already authenticated. We just need to make sure our code is in right order:

With this code in place, our GraphQL API is still publicly available. What we can do now, is pass logged in user (if available) down to all resolvers using Apollo context.

If all or nothing authorization scheme is what you need, then you can also authorize all requests here. What you can do, is simply throw `AuthenticationError` from `apollo-server-express` package whenever there"s no user, or your user is not allowed to access graph:

Although this might solve your current problems I don’t really recommend it. It’s not very elastic and is hard to extend later on. It also forbids any public APIs you might want to add in the future, so it might be better to move to the second step and add some security logic directly to graph resolvers.

### Testing things out

But first, let’s check if everything works as expected. We can use GraphQL Playground to test things out. You should see something similar when trying to query without login:

![image](images/2.png#layoutTextWidth)
GraphQL Playground — Auth Error

Just one small note before we continue: before you try to access secured resource make sure you have `request.credentials` option set to at least `same-origin` in playground options. Without it, there will be no authentication data sent to your backend when you"ll be executing your queries.

### Securing resolvers

Let’s start with moving our all or nothing code into resolvers, so we can choose on per resolver basis if we allow access or not. What we need to check is a user property in context object (3rd argument to resolver):

Ok, this solves our problem, but copying all this stuff around would be very cumbersome. Why not take advantage of that Javascript is a functional language and we can pass functions around. Let’s refactor this code to a higher order function that we can later apply on any resolver we like:

Now we only need to wrap our resolver with `requiresLogin` call:

### Role-based authentication

By changing only a few lines here, we could also get a very nice role-based authentication using this pattern:

And use it in similar manner:

### Modularized resolvers

All this can get you far, but will probably also get cumbersome after some time. When you start to divide your resolvers, you’ll end up wanting to setup access rights for whole groups in one place instead of wrapping functions one by one. Again we would end up with a lot of copied code.

Why not simply make our authorization function support whole objects and wrap all resolvers with auth code:

_*isFunction, isObject and mapValues functions come from_ [_LoDash_](http://lodash.com)

Now we can wrap our resolvers with `requiresRole` on any level and it will recursively secure everything according to the declaration:

In this example, both: `templates` and `tasks` queries will require the current user to be a "_member_" before he can access them.

P.S. If you don’t modularize your resolvers yet, check out [Modularizing your GraphQL schema code](https://blog.apollographql.com/modularizing-your-graphql-schema-code-d7f71d5ed5f2) by @dpandya.

### What next

Keeping authorization logic in resolvers is very elastic and we’ve only touched surface here. Thanks to that resolvers are asynchronous in nature and can return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) we can implement pretty complex authorization schemes with pre and post validation and even custom per-entity ACLs. But we’ll cover these in another article.
