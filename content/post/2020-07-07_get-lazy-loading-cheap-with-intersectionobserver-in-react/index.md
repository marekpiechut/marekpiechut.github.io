---
title: "Get lazy loading cheap with IntersectionObserver in React"
author: "Marek Piechut"
date: 2020-07-07T08:01:56.746Z
lastmod: 2024-06-30T12:43:51Z

description: ""

subtitle: "Getting lazy loaded web page elements based on scroll position has been a performance or maintenance nightmare. You either loosen…"

image: images/1.jpeg
cover:
  relative: true 
  image: images/1.jpeg 
images:
 - "images/1.jpeg"
 - "images/2.png"
 - "images/3.png"
 - "images/4.png"


aliases:
    - "/get-lazy-loading-cheap-with-intersectionobserver-in-react-8ca50fe1730d"

---

Getting lazy loaded web page elements based on scroll position has been a performance or maintenance nightmare. You either loosen components encapsulation and build a complex mechanism with single scroll handler notifying elements when needed, or end up with huge amount of `onScroll` handlers that will kill page performance. Thanks to [W3C working draft from 2019](https://www.w3.org/TR/performance-timeline-2/#the-performanceobserver-interface) being already implemented in all major browsers we can get rid of all this stuff. Just use `IntersectionObserver` and get fast and elegant lazy loads when needed.

So if you no longer care about IE compatibility (and please stop if you do, we need to kill that monster), then stay with me and check out how to cheaply get `onScroll` lazy loads in React. We’ll base our example on exercise library we’ve added to [CrossKeeper](http://crosskeeper.app/) - product we are working on.

![image](images/2.png#layoutTextWidth)

### The Problem

Problem with this UI is that it can get slow pretty fast if we simply loaded all exercises with images and dumped them into the page at once. It’s also worth noting, that in this example we don’t exactly know which thumbnails to show based on just exercises. We have to query media source (which can be our custom media server or YouTube API) to fetch it. The only way to do it is one by one, no batch loading. So you might already guessed, firing few hundred HTTP calls each time user opens it up might feel slow. Caching helps a bit, but first load will be slow anyway and keeping all this stuff around if someone never scrolls to the bottom is also not most elegant.

On the image below you can see how it looks like performance wise when we go with render-all-at-once solution.

![image](images/3.png#layoutTextWidth)

We have more than 7 seconds of network calls to fetch exercise media and thumbnails. Also there’s only so many connections you can initiate to each server. Depleting connection pool makes jumping to some other section of the app feel slow. We’re not allowed to fetch it’s data while waiting for media sources.

### Using IntersectionObserver

Let’s try to cheaply fix it using IntersectionObserver so we only fetch metadata and images for stuff we really need.

First we need some UI we’ll be rendering and store URL somewhere and make sure it’s rendered when ready. Div with background image and `useState` hook should fit in nicely:

We’ll keep `ExerciseItem` self contained and make itself load required data from media sources, so we add effect to fetch data and do it only on mount and when media identifier might change:

What we have now is fully functional UI component that will give us exactly performance we see in our problem description. All exercises will start fetching media metadata and images as soon as they are added to DOM. This is not what we’re expecting.

Let’s fix it by adding IntersectionObserver and connecting it to DOM element via ref:

This should work pretty nicely. The only thing that’s awkward is that images start to load when user does already see them, giving him impression that page does not keep up with his scrolling speed.

Fortunately there’s something baked into IntersectionObserver that can help us out. If you check API for it, you’ll notice we can pass some options to the constructor ([Intersection observer options](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Intersection_observer_options)) and `rootMargin` is what we need.

Let’s make sure that we start loading stuff 200px ahead of user scroll (format is like in CSS margins value). This should cover it up nicely:

For final touches we might add graceful fallback to previous solution on old browsers and here’s what we have:

### Cleanup

It doesn’t look that bad, but let’s give it a bit of refactoring, so we’re not overwhelmed with details each time we open up this component.

### Result

Well, there you have it. Fully functional and reusable hook to handle lazy loading using `IntersectionObserver`. Of course you can easily add loading and error indicator or generalize it even further to make it reusable (ex: passing root margin and loader function from the outside). But even like that it"s a huge improvement over original.

Below you can see how it looks like to open exercise library now. We’re able to show fully functional UI with all images nearby in 1 second — same machine, same server and same network.

![image](images/4.png#layoutTextWidth)

All this with just few lines of code and modern browser. Great stuff going on in the web technologies and let’s hope that, thanks to browsers auto-update, we’ll be able to use more and more of these in our day to day work.
