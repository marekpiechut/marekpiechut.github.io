---
layout: post
title:  "One year with React"
date:   2016-07-13 23:59:59 +0200
tags: [react, javascript]
---
It's almost a year now since I've started working with Facebook React. After all this time I've learned a lot about how to build React apps, so they are easy to test, maintain and so components can be easily reused.

Here are my most important conclusions. I think following them will make your life really easier, especially if you're just starting with React.

# Is it worth it?

Generally any team member regrets we have used React. Our app is quite big now and despite having some issues integrating with external libraries, it's still great experience. Of course we had to refactor our code and change working patterns quite few times during the project, mostly because React was pretty new when we started, and proven 'best practices' were yet to be seen.

Compared to other technologies we have used React is really fast to start with and has very few concepts to learn. It also works very well with immutable data and makes it easy to reuse components.

If you're still unsure if React is for you, I highly recommend you give it a try. It's really good and you can be pretty productive even after your project has grown big.

# Project structure

From the beginning we started to organise our code after domain concepts and functionalities. This is the best way to keep stuff. Please forget all this nonsense about `actions`, `components`, `stores`, etc. After your project grows it'll make you suffer. Keeping all business related stuff together makes moving things around really easy. You can easily find things you plan to change, remove functionalities and refactor.

So how does our directory structure looks like? Here's an example:

{% highlight conf %}
ROOT
|- src
|-- core (application core abstractions and main component)
|-- modules (here goes all the important stuff)
|--- advanced-search
|---- advanced-search-component.jsx
|---- advanced-search-component.test.jsx
|---- advanced-search-store.js
|---- advanced-search-store.test.js
|---- advanced-search-toolbar-component.jsx
|---- index.js (what we export in this module)
|---- ...
|-- components (basic reusable components that are not domain specific, ex: confirm popup, section, date selector, etc.
|- test
|-- pages (Page objects for e2e tests)
|-- e2e (Selenium end to end tests)
{% endhighlight %}


As you can see, we keep unit tests in same directories as production code. This way we can have relative import paths, so we don't have to change anything when we move whole modules around.

It's also a good idea to keep index.js file inside each module and make sure external code use only this to import stuff from it. It allows you to make import names shorter and more meaningful. It's also a form of 'poor mans' encapsulation.

# Components and state
This is something that took us a while to figure out. You should keep all your display components stateless. You can usually use React stateless functional components for this. Of course you'll need also somehow to map store state to your UI. This should be done inside separate - stateful components. These should not mess with presentation. They should pass all their state to child components by props. Eventually select which components to render based on state, nothing more. How things look is totally up to stateless components. 

It'll make your components really easy to test and they'll be as reusable as possible. Without it you'll be constantly fighting with mocking stores to test if divs rendered properly and that data is displayed where it should. Managing state along with presentation also makes your components hard to reuse.

Most of the time you should be able to generate these stateful wrapers or they will be very simple to write and test.

# Testing

We don't use Jest for testing. In my opinion mocking everything implicitly is not a very good idea. You even don't know what's happening. All our components receive dependencies via props so standard Jasmine/Karma testing suite is totally enough. We mock things and create spies as needed using plain JS and Jasmine. Every time we needed something more meant it was rather design issue - components trying to do too much or too big/nested data structures.

Even stores are passed to stateful components using props. This way we can easily mock them or use real objects when needed and discard them afterwards. No ugly shared state that might not be cleaned up and break tests.

Also our stores and backend APIs use factories that get all outside dependencies from parameters:

{% highlight js linenos %}
module.exports = {
  create: createSearchStore,
  default: reateSearchStore(defaultDispatcher, backendApi.default),
  events
}
{% endhighlight %}

Again, mocking and cleaning up is very easy.

# Immutability
You should keep all your data immutable. You can use things like [Immutable.js](https://facebook.github.io/immutable-js/) and it will probably work pretty well (despite it's sometime awkward APIs), but just not modifying anything in place and using Object.assign or similar utils will make your life much easier. Especially when you need to implement _[shouldComponentUpdate](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate)_ from time to time.

The lowest level you mutate anything should be store itself. Everything below should never be touched.

Don't be worried about performance. JS VMs are pretty damn fast when creating and destroying a lot of objects.

# State changes and async calls
We keep all sate changing code inside stores. Stores mutate themselves in response to actions and action creators have no idea about internals of store. This also means that async calls are done inside store and do not call any actions. It works pretty well for us despite being little controversial. Some guys are recommending to do these things in actions and make your stores a dumb bag for data. This might also work well, but please then keep all logic inside actions and use your stores as dumb bags of data. Having some of it in actions and some in stores will probably give you headache.

All business logic in stores makes our action creators dumb, so we generate them from simple object with events.

Also it sometimes means we need to make stores listen to stores. We have few of these with no issues. It looks much better then hacky _[waitFor](https://facebook.github.io/flux/docs/dispatcher.html#api)_ in dispatcher API.

# Redux?
After some time it appeared to me, that all these conclusions are quite similar to what Dan Abramov is doing in [Redux](http://redux.js.org). It's little bit more extreme with its single store and pure functions, but after testing it for some time I think it's really good. So another conclusion from all this might be to simply use Redux in your next project :)
