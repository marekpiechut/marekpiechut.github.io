---
layout: post
title:  "Circuit breakers - You don't need to wait for failures."
date:   2016-09-16 23:33:41 +0200
tags: [architecture, javascript]
---


It gets very annoying when web app keeps hanging on server requests, only to fail with a timeout few seconds later. Or uses up all available network connections (remember, we only have handful of these) just to wait for failure. Especially if feature is non critical and it does many updates while you are interacting with the app. Wouldn't it be nicer if, after failing, app simply stopped trying for some time? Giving backend service a chance to get healthy again. Or just to stop pissing off the user.

Circuit breaker is what you need to get exactly that. What's even better you need just a single one that can wrap all asynchronous calls in your app.

# What is a circuit breaker

Circuit breakers are common in electrical engineering ([Wikipedia](https://en.wikipedia.org/wiki/Circuit_breaker)). They simply interrupt the circuit after detecting a fault in current flow, so there's no risk of fire, damage or injury. When everything is fine again you can re-enable (close) a circuit breaker and it will let the current flow. This is very similar to what we want from our backend calls - to stop calling broken backend after failure and retry when there's a chance it was fixed.

Concept of circuit breakers in software was popularised by Michael T. Nygard's in his book: *["Release It!"](https://pragprog.com/book/mnee/release-it)*. (Which is a very good read by the way. You should check it out if you haven't already).

Basically it's all about wrapping code that can fail with decorator, that is forwarding all calls and waiting for failure. Shutting down whole thing if it's failing too often.

Circuit breaker can be in one of 3 states: *CLOSED*, *OPEN* and *HALF OPEN*. When everything is fine, we just forward calls, as there would be nothing between caller and wrapped code (it's the *"CLOSED"* state). Each failure is recorded and, when certain threshold is met, we disable call forwarding and start to fail immediately (now we're in  *"OPEN"* state).

There's also this third state - *"HALF_OPEN"*. It's little bit more complicated:

While throwing errors, without even hitting backend, we do a check if grace period has passed. If it did, we try again. This time only once (now we're in this *"HALF OPEN"* state). If everything went well we go back to normal (*"CLOSED"*) state or to failure (*"OPEN"*) if failed. Only difference is that we don't check for threshold. First failure in *"HALF OPEN"* makes all go down again. No retries.

Here's a graph to illustrate all the state changes: 

![State diagram]({{ site.url }}/img/circuit-breaker-diag1.png){: .img-fluid .full-page}

# Implementing circuit breaker in JavaScript

Here's a simple implementation of circuit breaker in JavaScript working with `Promise` returning calls <span class="text-small">([code](https://github.com/marekpiechut/marekpiechut.github.io/tree/master/_posts/code/circuit_breakers/circuit-breaker.js)\|[test](https://github.com/marekpiechut/marekpiechut.github.io/tree/master/_posts/code/circuit_breakers/circuit-breaker.test.js))</span>:

```javascript
{% include_relative code/circuit_breakers/circuit-breaker.js %}
```

How to use it? Simply wrap function returning a `Promise` with circuit breaker and use it normally:

```javascript
function callBackend(url) {
  return fetch(url)
    .then(parseResponse)
}

const withCircuitBreaker = circuitBreaker(callBackend)

withCircuitBreaker('http://my.backend.com')
  .then(doSomethingWithData, handleError)
``` 

It's a quick implementation and will only work with promises, but still can probably cover most of your needs. It's because circuit breakers are so simple.

*p.s. you can use code from this post however you like, just copy it to your project if you need. No attribution or anything required.*

*I've also published it on npm as [simple-circuit-breaker](https://www.npmjs.com/package/simple-circuit-breaker), so you can simply require it.*

# To sum it up

Circuit breakers are really nice and simple pattern you can use to make your application more user and resource friendly. Especially when having some non critical functionalities that can be disabled for few seconds and nobody might even notice. Consider using it in your app integration points. It costs almost nothing and makes your user experience much more pleasant.
