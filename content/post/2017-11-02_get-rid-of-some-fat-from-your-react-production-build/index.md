---
title: "Get rid of some fat from your React production build"
author: "Marek Piechut"
date: 2017-11-02T10:40:08.179Z
lastmod: 2024-06-30T12:43:39Z

description: "If you’re using Webpack with React you can get some nice size and load time optimizations with just a few small configuration changes. Almost for free, without messing with your code."

subtitle: "Get some nice size and load time optimizations for React app with just a few small configuration changes in Webpack."

image: images/1.jpeg
cover: 
  image: images/1.jpeg 
images:
 - "images/1.jpeg"
 - "images/2.png"


aliases:
    - "/get-rid-of-some-fat-from-your-react-production-build-3a5bb4970305"

---

Who wouldn’t want to get something for free? If you’re using [Webpack](http://webpack.github.io/) with [React](https://facebook.github.io/react/) you can get size and load time optimizations with just a few small configuration changes. Almost for free, without messing with your code.

Here I’m showing few of these. They are really easy to do and can give you nice results regarding application size and startup time.

### Switch Node to production

When switched to production, Webpack will add optimizations not executed otherwise. What’s even more important — [UglifyJS](https://github.com/mishoo/UglifyJS) will remove all React debugging and introspection code. As it becomes effectively a [dead code](https://en.wikipedia.org/wiki/Dead_code_elimination). It was helping you to find errors in development, but only causes slowdown and bundle bloat in production. Stuff like invariants checking, `props` validation, etc. There’s a lot of code like this in React:

and it will be completely removed in production mode. Thanks to our little environment flag.

Add this code to production plugins in `webpack.conf.js` to enable it:

and remember to launch webpack with `-p` and `--env.production` options:
``webpack --env.production -p``

### Strip all unneeded stuff with UglifyJS

Your production build probably includes a lot of stuff that’s not really required during execution. With some more aggressive UglifyJS configuration you can also get rid of these:

It will wipe a lot of stuff you don’t really need. Some of it might be useful during development but is only a waste when you release. I personally like `screw_ie8` the most. It’s just something we all should have done quite some time ago. This option should be enabled by default.

### Load only required Lo-Dash modules

If you’re building a larger application, chances are, you’re already using [Lo-Dash](https://lodash.com). You can get some bundle size reduction by using [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) to enable [tree shaking](https://webpack.js.org/guides/tree-shaking/) for Lo-Dash imports. It analyzes your code, to check which functions are imported and which can be skipped. What it means, is that you’ll only include stuff you are really using (and it’s dependencies), not everything that’s in the package. And it doesn’t matter if you’re using `import map from "lodash/map"` or `import {map} from "lodash"` notation. It’s smart enough to figure it out.

### Get rid of unused moment locales

[Moment](https://momentjs.com) is a great library, that has a huge set of locale-specific settings, that you might actually never use.

It might be useful to get rid of ones you don’t use. If you have support for only subset of languages or are building an internal app and you need no internalization at all, there’s no point in keeping them around.

Here’s the difference it can make (file sizes before minification, so final results might vary):

* With **all** locales: `moment: 455.55 KB (35.9%)`
* With only **en** locale: `moment: 125.92 KB (13.4%)`
* With **en** and **pl** locales: `moment: 129.59 KB (13.8%)`

As you can see, leaving only a handful of these can save a bit of space. Here’s how you set it up:

* First, filter out all locales using `webpack-ignore-plugin` (it’s built-in, so nothing to install):``new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),``

* Then, in case you need something more than plain `en`, require it explicitly. You can do it by adding something like this somewhere in your code (probably near app initialization, where you setup moment stuff):``import "moment/locale/pl"``

Webpack will make sure it’s included in the output, even if it was ignored before.

### Split bundle to vendor and app code

If you have more than one entry-point and there are parts of it that some users won’t ever access (like admin panel). Or you have more than one app in a single codebase (like variants of the app for different departments). Then it might be useful to split distribution package to separate bundles and keep external dependencies apart. This way users that don’t need admin module won’t download and parse its code. And your dependencies will be in a separate file, that browser can cache and reuse when switching between apps.




You should probably also have your entry-points declared somewhere in configuration object:




Just make sure you include vendor script before your application in entrypoint `html` file.

There’s also a chance, that after some time, your dependencies stop changing so often and you might release updates without even changing vendor bundle. This way clients won’t need to fetch it again.

Of course you can experiment with `CommonsChunkPlugin` to get even better results. Maybe you’ll want to keep separate bundle with dependencies used in each variant of the app or extract only stuff that’s really shared between entry-points. Check out docs here: [commons-chunk-plugin](https://webpack.js.org/plugins/commons-chunk-plugin/) to see what else you can get from it.

### Bonus — how to analyze bundle size

So now you have set up some optimizations that should lower your bundle size and decrease startup time. But what more can you do to make it smaller and faster? Get rid of stuff that’s taking a lot of space and doesn’t give much value. Sometimes you include library and use only a tiny fraction of it just to find out that it’s a half of your application size.

To know which libraries consume most space, we need to look into Webpack bundle and analyze what’s there. There are two nice tools to get some insight:

* [Webpack bundle analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

and

* [Webpack bundle size analyzer](https://github.com/robertknight/webpack-bundle-size-analyzer)

First of them gives you nice visual map to click through and check what takes up most of the space and what it depends on.

![Bundle size browser](images/2.png#layoutTextWidth)

It’s very good if what you’re doing is a hunt for space hogs. I highly recommend you run it at least once on your project. You might be surprised. It’s not always obvious what is the biggest part of your app.

On the other hand, if you only want to check what’s the impact of stuff you just added or quickly get some insight [Webpack bundle size analyzer](https://github.com/robertknight/webpack-bundle-size-analyzer) might be the way to go. You just pipe Webpack JSON output to it and you’re done:
``webpack -p --json | webpack-bundle-size-analyzer | less``

and here’s the output:

### Set the options, but what are the results?

Just to sum things up. Here are bundle sizes for [DOS](http://github.com/dayonepl/dos-react) React starter kit with:

```text
Version: webpack 3.6.0  
Time: 13194ms  
     Asset       Size  Chunks                    Chunk Names  
   main.js    7.29 kB       0  [emitted]         main  
 vendor.js     390 kB       1  [emitted]  [big]  vendor  
styles.css    2.25 kB    0, 1  [emitted]         main, vendor  
index.html  463 bytes          [emitted]
```

and without configuration changes applied:

```text
Version: webpack 3.6.0  
Time: 10899ms  
     Asset       Size  Chunks                    Chunk Names  
   main.js     571 kB       0  [emitted]  [big]  main  
styles.css    5.57 kB       0  [emitted]         main  
index.html  463 bytes          [emitted]
```

As you can see, we have stripped almost 200kB from final size without any changes in source code or removing any libraries. It was probably worth these few minutes to put it in the config files.

By the way, if you want a React boilerplate to speed up your next project ramp-up, give [DOS](http://github.com/dayonepl/dos-react) a try. It has all these optimizations already configured and ready to be used.

**And here is a full webpack config file for reference:** [**webpack.config.js**](https://github.com/DayOnePl/dos-react/blob/master/webpack.config.js)
