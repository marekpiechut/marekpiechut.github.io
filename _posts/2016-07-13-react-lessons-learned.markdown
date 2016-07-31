---
layout: post
title:  "One year with React"
date:   2016-07-13 23:59:59 +0200
tags: [react, javascript]
---
It's almost a year now since I'm working with [React](https://facebook.github.io/react) and [Flux](https://facebook.github.io/flux/). After all this time I think I've learned a lot about how to build React apps, so they are easy to test, maintain and that components can be easily reused.

Here are some of my most important conclusions. I think following them will make your life really easier, especially if you're just starting with it.

# Is it worth it?

Everybody at my team is still happy with react. Our app is quite big now and, despite having some issues integrating with external libraries, it's still great experience. Of course we had to refactor our code and change working patterns quite a few times during the project. Mostly because React was pretty new when we started and proven *'best practices'* were yet to be seen. Yet it's still a nice experience to work with it.

Compared to other technologies we have used, React is really fast to start with and has very few concepts to grasp to be productive. It also works very well with immutable data and makes it easy to reuse components.

If you're still unsure if React is for you, I highly recommend you give it a try. It's really good and you can be pretty productive even after your project has grown big.

# Project structure

From the beginning we started to organise our code after domain concepts and functionalities. This is simply the best way to keep stuff around. Forget all this nonsense about `actions`, `components`, `stores` folders. After your project grows it'll make you suffer. Keeping all business related stuff together makes moving things around really easy. You can easily find things you plan to change, remove functionalities and refactor.

So how does our directory structure looks like? Here's an example:

```	
ROOT
|- src
|-- core (application core abstractions and main component)
|-- components (basic reusable components that are not domain specific, ex: confirm popup, section, date selector, etc.
|-- modules (here goes all the important stuff)
|--- advanced-search
|---- advanced-search-component.jsx
|---- advanced-search-component.test.jsx
|---- advanced-search-store.js
|---- advanced-search-store.test.js
|---- advanced-search-toolbar-component.jsx
|---- advanced-search-actions.js
|---- index.js (what we export in this module)
|--- user-profile
|---- ...
|- test
|-- pages (Page objects for e2e tests)
|-- e2e (Selenium end to end/UI tests)
```

As you can see, we keep unit tests in same directories as production code. This way we can have relative import paths and we don't have to change anything when we move whole modules around. Want to move some components to another module? No problem, just move all files.

It's also not a problem when we release. Tests are filtered out from production bundle with simple regular expression.

It's also a good idea to keep index.js file inside each module and make sure external code use only module path to import stuff. It allows you to make import names shorter and more meaningful. It's also a form of *'poor mans'* encapsulation:

```javascript
const AdvancedSearch = require('modules/advanced-search').component
```

# Components and state
This is something that took us a while to figure out. I think that you should always keep display components stateless. You can usually use React [stateless functional components](https://facebook.github.io/react/docs/reusable-components.html#stateless-functions) for this.

Of course you'll need also somehow to map store state to your UI. This should be done inside separate, stateful components. These should not mess with presentation. They should pass all their state to child components by props, eventually select which components to render based on state, nothing more. How things look is totally up to stateless components.

It'll make your components really easy to test and they'll be as reusable as possible. Without it you'll be constantly fighting with stores mocking, just to test if divs rendered properly and that data is displayed where it should. Managing state along with presentation also makes your components hard to reuse. Not to mention that components messing with state and presentation at once can get large.

Most of the time you should be able to generate these stateful wrappers or they will be very simple to write and test.

To be honest, we still have quite a few these stateful display components in our project waiting to be refactored, but it's not something I recommend to have. It's painful to make any changes in them.

# Testing

We don't use [Jest](https://facebook.github.io/jest/) for testing. In my opinion mocking everything implicitly is not a very good idea. After a while you don't know what's mocked and what's not. All our components receive dependencies via props, so standard Jasmine/Karma testing suite is totally enough. We mock things and create spies as needed using plain JS and Jasmine. Every time we needed something more meant it was rather a design issue than library limitation (components trying to do too much or too big/nested data structures).

Even stores are passed to stateful components using props. This way we can easily mock them or use real objects when needed and discard them afterwards. No ugly shared state that might not be cleaned up and break tests.

Also our stores and backend APIs use factories that get all outside dependencies from parameters:

```javascript
module.exports = {
  create: createSearchStore,
  default: createSearchStore(defaultDispatcher, backendApi.default),
  events
}
```

Mocking and cleaning up is very easy.

# Immutability
You should keep all your data immutable. You can use things like [Immutable.js](https://facebook.github.io/immutable-js/) and it will probably work pretty well (despite it's sometime awkward APIs), but just not modifying anything in place and using Object.assign or similar utils instead will make your life much easier. Especially when you need to implement _[shouldComponentUpdate](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate)_ from time to time.

The lowest level you mutate anything should be store itself. Everything below should never be touched.

Don't be worried about performance. JS VMs are pretty damn fast when creating and destroying a lot of objects.

# State changes and async calls
We keep all sate changing code inside stores. Stores mutate themselves in response to actions and action creators have no idea about internals of store. This also means that async calls are done inside store and do not call any actions. They just update internal state and fire regular store events.

It works pretty well for us despite being little controversial. Some guys recommend to do these things in actions and make your stores a dumb bag for data. This might also work well, especially when you need to intercept async calls globally and modify some other part of application state. But please decide which one you like more and stick to it. Having some of it in actions and some in stores will probably give you headache.

All business logic in stores makes our action creators dumb, so we usually generate them from simple object with events. If you go with second solution you can probably generate most of your stores.

Also it means we sometimes need to make stores listen to stores. We have few of these with no issues. It looks and works much better than *'hacky'* _[waitFor](https://facebook.github.io/flux/docs/dispatcher.html#api)_ in dispatcher API.

# Redux?
After some time it appeared to me, that some of my conclusions are quite similar to what Dan Abramov is doing in [Redux](http://redux.js.org). It's little bit more extreme with its single store and pure functions, but after testing it for some time I think it's really good. So another good idea for your next app might be to simply use Redux. It's something I'm probably going to do in mine.
