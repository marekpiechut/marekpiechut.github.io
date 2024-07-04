---
title: "React Native — first impressions"
author: "Marek Piechut"
date: 2017-02-13T13:57:06.011Z
lastmod: 2024-06-30T12:43:33Z

description: "First thoughts about React Native after more than a month of iOS app development. Good and bad sides of building your app with React Native."

subtitle: "As You might already know we’re building one of our apps — Quotes Keeper at DayOne.pl using Facebooks’ React Native framework. After more…"

image: images/1.png
cover: 
  image: images/1.png 
images:
 - "images/1.png"


aliases:
    - "/react-native-first-impressions-de3071e8fc41"

---

_This post was previously posted on our project blog and here is a slightly updated version. Right now QuotesKeeper is already in AppStore and we’ll be posting updated thoughts about React Native soon._

Some time ago at [DayOne.pl](http://dayone.pl) we started a project to build 3 apps with 3 devs in 30 days — the [one month project](http://onemonthproject.com). One of our mobile apps was built using [React Native](https://facebook.github.io/react-native/). Here are my thoughts after more than 2 weeks of development (while the thing was still in the making).

_P.s. Ok, it took a little bit more than 30 days. We had 2 weeks delay due to sync functionality we had to do in Obj-C. But more about it in next post._

### Extremely easy to start

React Native is really easy and straightforward to start with. You can set the project up and start coding in about 5 minutes. Everything is taken care of — XCode project setup, JS environment, templates, simulator, etc. You just run built-in project generator and most of the stuff is done for you.

Second — if you have some [React](https://facebook.github.io/react/) experience you’ll feel right at home. Everything is familiar and works almost the same way. Most of the knowledge you have about components, lifecycle, state, props, mixins, etc. can be used in your React Native project. You can use Flux or Redux to manage application state and EventEmitter to notify UI about changes. Just like you would do in regular React app.

There are plenty of libraries ready to be used by your project if any native component is missing. Also calling native code is super-easy. It’s so easy, that in many cases it was faster for me to write simple Objective-C function and call it from JS instead of searching for some library that had it ready.

### Developer happiness

React Native has one absolute killer feature — code-test-code cycle. It is the best programming environment you can get when building mobile UIs. Period. You can open iPhone simulator next to your code editor and see changes constantly being applied while you edit files. It’s really a pleasure to work with. Every time I need to change native code and re-run the whole app I feel like I’m traveling back to ’90s. Even if you don’t have “hot reload” enabled and need to hit Cmd+R sometimes, it’s still freakin’ great! Yes, it really works like in this [GIF](https://media.giphy.com/media/13WZniThXy0hSE/giphy.gif) on React Native homepage.

### All the other nice things

There are more nice things about it. Performance is great when compared to “Hybrid” solutions. Building UI that’s compatible with iPad and iPhone is easy. Styling with flex is really nice and easy. Still, there are some…

### Parts we didn’t like

React Native is still young and you can see it in many places. Some properties are missing, even in core components. Documentation is lacking and you often have to dig into framework code to see how something works. Many external libraries still need much work and have nasty bugs. Of course, this is something to be expected from open source project in this early phase, but you need to take it into consideration if your project is large and critical for your company.

But the biggest issue we’ve had is with the performance. Wait! What? Didn’t I say that performance was great? Yes, I did. Don’t get me wrong. The app is very responsive and probably you won’t have any issues if you’re not displaying very long lists or processing large amounts of data. But if you do, you’re in trouble. JS performance is nowhere near Objective-C code.

We started having performance issues with around 2000 objects in the list that we needed to process end filter. Moving it to native code fixed everything. Also built-in React Native list component start scrolling very slow when you have so many elements. You really need to test things out if you plan to work on large datasets.

### Summary

To sum things up — would I use React Native in my next project? The answer is — probably yes. It’s really good and fast. Developer experience is great and what you’re building is a real app, with native look and feel. You’ll have a chance to test it yourselves in [Quotes Keeper](http://quoteskeeper.com/).
