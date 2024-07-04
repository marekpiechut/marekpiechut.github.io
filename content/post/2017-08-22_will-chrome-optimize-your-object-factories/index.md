---
title: "Will Chrome optimize your object factories"
author: "Marek Piechut"
date: 2017-08-22T09:05:57.364Z
lastmod: 2024-06-30T12:43:36Z

description: ""

subtitle: "… or does it make sense to use new or Object.create anymore?"

image: images/1.jpeg
cover: 
  image: images/1.jpeg 
images:
 - "images/1.jpeg"
 - "images/2.png"
 - "images/3.png"
 - "images/4.png"


aliases:
    - "/will-chrome-optimize-your-object-factories-76f3fc331145"

---

#### … or does it make sense to use `new` or `Object.create` anymore?

We all love and use factories and object literals in our JS code. It’s clean, readable, there’s little space for errors and (the best of all) it allows private state. (Check [**here**](https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Contributor_s_Guide/Private_Properties) if private members in Javascript is something new to you.)

But there’s something worrying about them... Check out the following code:

It looks like we’re creating new `add` , `sub` and `getVal` functions over and over again. Just so they can have a separate closure scope with separate private variables (some more about this [**here**](https://developer.mozilla.org/en/docs/Web/JavaScript/Closures#Performance_considerations)).

Hey, but maybe Chrome’s virtual machine can optimize this stuff?

### Can Chrome optimize it?

… and what is a real performance impact of using this technique? Is it really a performance problem or is it a marginal issue? Let’s check it out.

I’ve prepared a quick benchmark to test it. What I was looking for is a memory footprint differences between _good ol’_ [prototypes](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes) with [new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new), [Object.create](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/create) and closure with object literal.

Chrome has pretty nifty dev-tools with memory profiler and a quite well optimized virtual machine. So we’ll be using that. If they don’t have it optimized, then probably no other browser has.

### Using prototypes

Let’s start with benchmark code. It’s pretty simple and looks more or less like this:

_…full code_ [**_here_**](https://github.com/marekpiechut/perf-js-closure-memory)

It creates 1,000,000 objects with few fields and methods so we can get a bit more realistic results. Call to`setInterval` and method calls are there so the browser has no chance to remove it due to ‘[Dead code elimination](https://en.wikipedia.org/wiki/Dead_code_elimination)’.

Of course, all other optimizations are allowed. That’s exactly what we want to find out. If the browser has somehow optimized this stuff, so we don’t have to.

Let’s run the benchmark, take memory snapshot and looks what’s there:

![image](images/2.png#layoutTextWidth)

As you can see we have used **58MB** of memory for our dummy objects. And 10 MB of it is used by the array just to keep references to the instances. We shouldn’t really count this in. All of methods are inside shared prototype object (it has the same memory address: `__proto__ = @2121167`). This result will be our starting point. Nothing is wasted, all functions are reused (…and there’s no private state).

### Using closure and object literal

This is probably the most elegant solution. It’s very readable, allows for private state and is nicely hidden from the outside. But what’s the memory footprint?

![image](images/3.png#layoutTextWidth)

Now, the heap size is huge. We’re using **490MB** of memory for the same 1,000,000 objects.

And here are file sizes of the heap dumps:
`107M Proto-1000000.heapsnapshot  
800M Closure-1000000.heapsnapshot`

This alone shows how huge is the difference.

If you check the profiler output you’ll see, that we have a separate instance for each method with a copy of the same code. Every `add` , `getVal` , etc. has a distinct memory address. Nothing is optimized here (and I really doubt you can safely do it, to be honest).

Now, for the completeness, let’s check how [Object.create](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/create) behaves.

### Using Object.create

More modern than [new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) and less elegant than closures. We’re using common base object with all methods (almost like with new) and a small factory using customizer to add instance variables:

We’ll declare all variables as writable, just to be fair with [prototypes](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes). And here are the results:

![image](images/4.png#layoutTextWidth)

It’s **66MB**. Not bad. Almost the same as the [new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) operator. We still reuse all functions code, thanks to the same `__proto__` instance and don’t get any unneeded duplicates.

### The verdict

Giving a clear recommendation to use one technique over the other is difficult here.

There’s definitely a memory footprint penalty for using closures and object literals. But in 99% of cases you won’t be instantiating so many of them that it becomes a problem. Also [GC](https://en.wikipedia.org/wiki/Garbage_collection_%28computer_science%29) should usually clean it up, when they are no longer needed.

What you get though is nice, readable code and total privacy, unless you make something public.

On the other side. If what you really need is raw performance, maybe hiding [new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) or [Object.create](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/create) inside some factory is a way to go. But as always [“_Premature optimization is the root of all evil”_](http://wiki.c2.com/?PrematureOptimization), so maybe it’s not worth it.

There’s also a kind of a middle ground here: use [prototypes](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes) and hide all private members by declaring them inside constructor (check _Privileged_ section in Douglas Crockford’s [article](http://javascript.crockford.com/private.html)).

So here it is. As you see having `this` and `prototypes` can still be useful. At least can save us some memory so we can use it for something more important than copies of same functions.
