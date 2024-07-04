---
title: "Investigate poor performance React components with “React Profiler”"
author: "Marek Piechut"
date: 2021-06-30T06:32:56.234Z
lastmod: 2024-06-30T12:44:09Z

description: ""

subtitle: "Sometimes your React app doesn’t perform as good as it should. Check out how we’re using React Profiler to find and fix slow components."

image: images/1.jpeg
cover: 
  image: images/1.jpeg 
images:
 - "images/1.jpeg"
 - "images/2.png"
 - "images/3.png"
 - "images/4.png"
 - "images/5.png"
 - "images/6.png"
 - "images/7.png"
 - "images/8.png"
 - "images/9.png"
 - "images/10.png"
 - "images/11.png"
 - "images/12.png"
 - "images/13.png"
 - "images/14.png"
 - "images/15.png"
 - "images/16.png"
 - "images/17.png"
 - "images/18.png"
 - "images/19.png"
 - "images/20.png"

aliases:
    - "/investigate-poor-performance-react-components-with-react-profiler-86be7d7364b3"

---

This post is a work in progress chapter from “React Performance” book i’ve started working on and haven’t touched for few months. Looks like it will never be released, so I’ll just post parts that I think might be useful as blog posts._You’re probably here, because you already know that something is wrong with a part of your application. Maybe after some change, maybe when hit with a big dataset, your component/screen started to get slow. You probably can see it when you invoke some action, that UI is no longer responsive and you’re pretty sure it’s React rendering that takes too long.

You’re already thinking about adding some `useCallback`, `useMemo`, and `React.memo` calls, but where? Sometimes it"s obvious. Component structure is simple and you have the gut feeling what might be causing the problem. But sometimes you just stare at the code and have no idea where, in this huge component tree, we"re dropping these frames. Which component to wrap with memo or which callback is responsible for component re-rendering regardless of nothing changing in it"s data.

### Quick Win

In this section we’ll try to answer exactly that — **how to find that one component (or group of components) that is causing the slowdown**.

Let’s start with quickest way we can get to the answer. React already has some nice tools that will help us out. We’ll dive into React Profiler and without much introduction just try to hunt the performance hog.

### Install React Profiler

—

🤔 Feel free to skip this section if you already have it installed.

—

React profiler is a part of totally awesome React Developer Tools package available for Chrome/Chromium and Firefox. You can download it here:

* **Chrome:** [**https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi**](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
* **Firefox:** [**https://addons.mozilla.org/en-US/firefox/addon/react-devtools/**](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

Both are being developed by core React team and built from the same codebase, so they should provide the same functionality. So it shouldn’t matter which one you use. Just select browser you’re most comfortable to work with. Unfortunately there’s no support for other tools as of now. You’ll have to use standalone edition if you need to debug/profile these (we’ll dive into that later on).

After installation you should be able to access React profiler inside your browser developer tools (we’re looking for the `Components` and `Profiler` tabs):

![image](images/2.png#layoutTextWidth)


When you have it all and running open your application in the browser, navigate to `Profiler` tab and start profiling (Press blue circle button in the top left corner). Click around your app for few seconds and stop it by pressing red circle button . If you didn"t get any errors we should be all set and ready to dive into it.

—

⚠️ _I’m getting_ **_“Profiling not supported.”_** _message, what next?_ — make sure you’re running your React app in development mode. Profiling is disabled by default on production builds. Don’t worry for now. Will handle it later. Just switch to development mode. Most of the performance issues will be visible in both — production and development builds anyways.

—

### Investigate slow page

Now that we have our profiler running we can go on and try to investigate some slowly loading page in your app. We’ll be investigating a lazy loaded list of old notifications. We expect it to be doing more work than required when each load is finished, but we encourage you to open up application you’re currently developing and check a page that you think might need some performance improvements and it’s not related to network time.

So let’s dit into it. As always we start with a clean state to make sure we’re touching only code we think we do and that nothing is going to skew our measurements, so:

✔️ Checkout to a commit you want to profile or stage your current changes

✔️ Make sure theres not much going on on your machine. CPU or memory hungry applications might skew our results.

And here’s the screen we’ll be working on:

![image](images/3.png#layoutTextWidth)

It’s currently showing the last 20 notifications, but we have many more on the backend and whenever you’re near the bottom we’ll be fetching new ones and appending to the list. Just classic lazy loading infinite (Of course it’s not infinite, we’ll run out of notifications in few screens, but it has enough to make it interesting) scroll.

What we need to do now, after initial rendering of the page is done, is to gather a profiler baseline, so we know if we’re fixing performance or making it worse. Let’s open React Profiler, start recording and scroll down until we hit the lazy load boundary few times, at least twice. Then immediately stop the profiling session. Output should be similar to what you see on the screenshot below.

![image](images/4.png#layoutTextWidth)

That’s a lot of output, but we’re not really interested in all of that. We start by investigating the commits chart at the top:

![image](images/5.png#layoutTextWidth)

What we can see here, is that we had 20 _“commits”_ — 20 times React has applied changes to the browser DOM. That’s not bad actually when we think about all the loading state changes and that we’ve executed lazy loads few times. What is more interesting though, is that this chart is constantly moving up, so it looks like we’re doing more and more work on each commit. When you hover over the bars, you’ll also see, that we get from around 90ms to almost 200ms time for single render. This is probably now what we were expecting. We are fetching 20 items in each batch and appending them to the list. Of course we’re doing some more work when going through ever-growing list of items, but we should only append new 20 nodes to the DOM tree. It looks suspicious, let’s dig into it a little bit more.

To do that, we start at the last commit and check what was rendered there.

![image](images/6.png#layoutTextWidth)

We can ignore all the grey bars — these components did not change during this render. First interesting one is the `Notifications` component. It did render, and that"s expected. We have changed its state, so this looks fine. We also see, that commit of `Notifications` component itself did not take a lot of time. It"s only 3.5ms. But take a look on all these small components at the bottom. All of them are colored, so they all have changed and their DOM changes were applied. Compare them to the previous screen. We see that in each commit there"s more and more of these, and all of them are always rendered. If you hover over them, you"ll see, that they are the individual notifications.

![image](images/7.png#layoutTextWidth)

Also, if you did not refresh the page or change page structure, React Profiler will highlight actual nodes that were rendered during the commit. Scrolling to the top of the page and hovering over one of the first nodes in the flame chart will reveal the truth. We’re re-rendering every notification on each update.

![image](images/8.png#layoutTextWidth)

This makes no sense. These components will never change. We only append new notifications at the end. There’s no way data can change and they should not trigger any DOM updates. It looks like we’ve found good place to try out `React.memo`. Let"s wrap our `NotificationItem` into it and see if it helps.

### Memoize Component

Digging into the source code it looks like we’re using just a regular functional component for a single notification item. Usually that’s totally fine and in most cases should not matter. But here we’re rendering quite a lot of them and it makes sense to give it few minutes of thought and try to memoize rendered component. Here’s how it look like right now. Actual body of the component does not matter, it’s only important that it is a functional component and that it’s not memoized yet.
`const NotificationItem = ({ notification, onMarkAsRead, session }: Props) => <div>...</div>`

Ok, let’s wrap it up with `React.memo` and see if it helps:

```typescript
const NotificationItem = React.memo<Props>(  
  ({ notification, onMmarkAsRead, session }) => <div>...</div>  
)
```

Now rebuild project, and start a new profiling session. Make sure that you have similar environment (nothing heavy is running on your computer and you gave few seconds for VM to warm up). And check if our fix has helped to mitigate the problem:

![image](images/9.png#layoutTextWidth)

Yup, looks like the problem is fixed. In the commits bar we can see a _“rake”_ pattern. Lower bar being a render of loading indicator, when no notification change, and higher bar being actual rendering of newly fetched data. Also each render takes similar time now — around 60–70ms and looking at the flame chart at the bottom we see, that previously fetched notifications are not re-rendered (they are greyed out).

### Wrap Up

Looks like we have fixed our problem and here we have our quick win. It was enough to simply wrap a component with `React.memo`. But what"s more important here is that we"ve made an informed change. There was no guesswork about where the problem is. We had hard evidence, that there was unnecessary work being done and then we have fixed it.

—

⚠️ There’s some more consideration needed when using `React.memo`. Sometimes adding it adds more overhead instead of fixing the problem. It might be the case, that it won’t help in your project.

—

### Deep dive

React Profiler is a nice tool to quickly investigate possible performance issues in rendering process. In this chapter we’ll be doing a deep dive into how it works and what actually it measures. We’ll also take a look at React APIs that are used internally by the profiler and investigate how we might use it ourselves to get more answers than React Profiler provides.

### Profiler UI

Let’s take a detailed look into information available in React Profiler and how it’s presented. To have a better image of what is going on here, we need to remember about 2 stages of React rendering process:

* First stage called **Render** or **Reconciliation** is one that calls all render functions on components, generates a Virtual DOM and compares it to the previous vDOM. This way it knows which nodes have changed and need to be applied to the browser DOM.
* Second stage — **Commit** — responsible for doing actual changes on browser DOM. This has to be done in single call to the browser APIs and will be done in _“stop the world”_ manner. If we would allow it to be done in stages or in background, user would see intermediate stages while we are updating the UI.

With that in mind we can now take a look at the commits view in the profiler. It’s this small bar chart at the top:

![image](images/10.png#layoutTextWidth)

What we see here is a list of all commits that React has flushed to DOM during our profiling session. Each bar is showing a separate commit in sequence of execution. Although it shows commits, it does count the render phase. You can test it out using this simple code:

```typescript
import { useState } from "react"

const SlowComponent = ({ noSlowdown }) => {  
  const arr = []  
  if (!noSlowdown) {  
    for (var i = 1000000 - 1; i >= 0; i--) {  
      arr.push(i)  
    }  
  }
  return <div>I"m slooooooow</div>  
}

const FastComponent = () => {  
  return <div>I"m fassssst....</div>  
}

const App = () => {  
  const [dummy, setDummy] = useState()  
  return (  
    <div className="App">  
      <SlowComponent noSlowdown={dummy % 2} />  
      <FastComponent />  
      <button onClick={() => setDummy(Date.now())}>Render!</button>  
    </div>  
  )  
}

export default App
```

Loading it and pressing `Render!` button few times shows that slow component is impacting profiling results regardless of it returning the same trivial single `div`. Commit cost of both components is exactly the same, yet profiling results are completely different: fast component renders nearly instantly while slow component takes 32ms out of 33ms total rendering time.

![image](images/11.png#layoutTextWidth)

Traveling back and fourth through the commits you can find some interesting patterns in render times that you didn’t expect. Selecting one of them will show you exact render duration and few more details about it.

As you have probably already noticed React Profiler marks commits and components with different colors and bar length. Generally the longer the bar and warmer the color (more yellow), the more time it took to render compared to other commits and components. Grey lines did not render at all during given run.

—

🤔 **Note:**

* Line length shows how long did it take for component to render with all it’s children
* Line color shows how long did component itself render compared to other components (how slow/fast it is)

—

There are two more interesting views here: **Flamegraph** and **Ranked** tab. First shows all components in your view in a tree according to your components structure. Second orders components by their rendering time ( **self render time** — how long it took to render component excluding its children time). It’s very useful to catch slowest components — a good place to start searching for problems. Hovering on the bars will highlight it on the page and selecting one of them will show you history of commits of given components and **reason why render was triggered** (ex: state change, parent render, props change, etc.). This information is sometimes enough to get you on track with figuring out what’s wrong. Very often some props change, that we didn’t expect to be any different.

—

⚠️ It’s usually good idea to have _“Record why each component rendered while profiling.”_ option enabled. It might add some overhead to profiling process, but it’s usually not a problem if your app is not super-huge. Just press the options cog ⚙️ and enable it now.

—

There’s also an option to hide commits that took below given time. It’s not super useful, as we usually are looking for anomalies, and want to see whole picture. It’s better idea to narrow use case to short problematic interaction, but you might also start with longer recording sessions and try to find issues using this filter.

### React Profiler API

DevTools profiler allows to gain a lot of knowledge about performance issues in your app. But if what you need is to profile only selected component and do it in production, there’s also a React Profiler API ([https://reactjs.org/docs/profiler.html](https://reactjs.org/docs/profiler.html)). It’s a lightweight component to gather data about it render times, thus giving an insight of performance of its children.

It will not allow us to get a deep tree of render stats like we have in Profiler view in DevTools, but allows to programmatically get timings for selected components in the app. Usage is simple, just wrap your component and provide `onRender` callback:

```typescript
<Profiler  
 id="user-profile"  
 onRender={(  
  id,  
  phase,  
  actualTime,  
  baseTime,  
  startTime,  
  commitTime,  
  interactions  
 ) => aggregatePerformance(id, phase, actualDuration, interactions)}  
>  
 <UserProfile user={user} />  
</Profiler>
```

We’ve got quite a few parameters to the callback, but except of that it looks pretty straightforward. Let’s go through all the data we have in the callback:

* **id** — this is exactly the same as what we have passed into the `Profiler` tag. React does nothing interesting with this parameter. It"s not grouping or overriding profiler tags with same Id. You can have as many as you want with exactly same value. Its role is purely informational, so you can have single callback, reuse it between profilers and still know which measures you have received.
* **phase** — component lifecycle phase. This can only be: `mount` or `update` and means exactly what you expect. Can be used find out if problem is only appearing during mount - maybe some slow `useEffect` that is firing only on mount.
* **actualTime** — measured duration of rendering. This is a real time of render during given commit. If you’re using memoization this time should go down significantly. If it does not, then you might found the problem.
* **baseTime** — estimated time of full render of component subtree. This should roughly be the same time as the _actualTime_ when component did mount if it did not do any heavy initialization. If you’re using memoization correctly, this time should be usually larger.
* **startTime** — simply a timestamp when rendering started
* **commitTime** — timestamp when rendering was finished. This time is shared between all profilers that took part in the commit. Thanks to that you can group data from separate sub-trees that were rendered due to same change in state.
* **interactions** — list of all interactions associated with this render.

Profiler API is very simple and allows to track performance of our components even on production. Just keep in mind, that it has a cost associated. There’s a small performance penalty for each `Profiler` instance in your components tree. Also make sure you"re not doing a lot of processing in your callback. It"s best to do any calculations asynchronously, or just dump your data to server and do all heavy-lifting there.

### Profiling in production builds

Due to small performance impact profiler API is disabled in production builds of React (as of May 2021). While it’s usually not a problem, as most of real performance issues will be visible in both production and development builds. Sometimes you want to dig into production bundle and gain some insights on rendering time.

The way it’s currently being disabled is through build time configuration. So if you have built your app with regular ReactDOM, you’ll have to re-build it. Here’s what to put in Webpack config to switch to profiling versions of libraries:

```typescript
module.exports = {  
  //...  
  resolve: {  
    alias: {  
      "react-dom$": "react-dom/profiling",  
      "scheduler/tracing": "scheduler/tracing-profiling",  
    }  
  }  
};
```

In case you’re using `create-react-app` script, just add `--profile` flag during build process:
```bash
# Using Yarn  
yarn build --profile  

# Using NPM 
npm run build -- --profile
```

With all this in place profiling should work just fine in production build. Regardless of that we’re not really advising to add it to your build process. It should be enough to run this build locally and connecting it to production backend. It should be trivial if you’re already serving your app from CDN or static folder using your Web server.

### Performance impact

As we have already noticed, profiler builds tend to run slower. Even if you’re not actively profiling. We’ve done a quick benchmark to actually measure it:

```typescript
const ROUNDS = 100_000  
const Benchmark = () => {  
  const [took, setTook] = useState()  
  const [round, setRound] = useState(1)  
  const start = useRef(performance.now())``useEffect(() => {  
    if (round < ROUNDS) {  
      setRound(round + 1)  
    } else {  
      setTook(performance.now() - start.current)  
    }  
  }, [round])``return (  
    <div className="App">  
      <div>{round}</div>  
      <div>Took: {took}ms</div>  
    </div>  
  )  
}
```

And results are:

Development: **13575ms**  
Production: **1478ms**  
Production Profiling: **2179ms**

So it looks like performance hit is not that bad, but it’s still there. We wouldn’t recommend to just push profiling bundles to production. Just build one when needed and profile on your development machine or build it each time and deploy alongside your production build on separate url. This way you can always switch to profiling build and do your analysis while not sacrificing your users performance.

### Interactions

—

🧨 Watch out, this is an experimental API and might change in future versions of React

—

Along with the profiler API React team has introduced an interaction tracking that can be attached to profiling data. Sometimes it’s just hard to find out which exact user action or backend call ended up with very slow render commit. What this API allows, is to attach a bit of semantic context to recorded performance traces.

Sometimes we can track the component that is slow, and tack slow sessions, but it’s not always easy to find out which exact user interaction is causing this. Especially when we are trying to gather performance data remotely, from user machine, as it’s not showing up on our environment. Thanks to the interactions API we’re able to see exactly which user actions are slow and which are fast, even if they are triggering the same component or we don’t exactly know where to look for the problem.

![image](images/12.png#layoutTextWidth)

What we can see on the screen above, is a trace of user interactions on the same component. Based on grid color we can see, that _“Enter user name”_ action is pretty fast. What we should be looking at is the _“Randomize button”_ action. Its marker color is yellow and render duration is much bigger. Also when looking from the commit perspective it can be found, that this action is problematic:

![image](images/13.png#layoutTextWidth)

And here’s how we track interaction in this example:

```typescript
import {  
  unstable_trace as trace,  
} from "scheduler/tracing"``<input  
  type="text"  
  value={name}  
  onChange={e => {  
    trace("Enter user name", performance.now(), () =>  
       onChange(e.target.value)  
    )  
  }}  
/>
```

What we do here, is on each character entered in the input we call `trace` first, passing in high resolution timestamp and a callback to handle actual logic after interaction is recorded. Don"t worry about the `performance` object. It"s a global available in every major browser now. We use it here, because `Date.now()` is not good enough to measure code performance. You can read more about it in your browser documentation, ex: [performance-mdn](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API).

There’s one more thing we’re missing here. It’s how to add interactions to **asynchronous code**. A lot of performance issues are related to data we’re fetching from backend. If we use this simple `trace` API, our async code calls will not be counted as part of the interaction. That"s simply because of the way async is handled in JS. What we need to do then is to wrap callbacks of async code with container that will bind it to current interaction. Thankfully React already has tools to support it:

```typescript
import {  
  unstable_trace as trace,  
  unstable_wrap as wrap,  
} from "scheduler/tracing"``<button  
  onClick={() =>  
    trace("Fetch data", performance.now(), () => {  
      setLoading(true)  
      fetchData()  
        .then(  
          wrap(data => {  
            setData(data)  
          })  
        )  
        .finally(wrap(() => setLoading(false)))  
    })  
  }  
>  
  Fetch data  
</button>
```

What’s most important here, is the `wrap` call that is surrounding `then` and `finally` handlers in our async call. After that we should see, that all renders related to this call are assigned to the same interaction:

![image](images/14.png#layoutTextWidth)

We can see here, that _“Fetch data”_ has exactly 3 renders associated. This totally makes sense. First one is sue to `loading` being set to `true`, second when we finish fetching the data and third when `loading` is set back to `false`. Of course all this code does not need to be inlined in the component. Interaction tracing API can as well be used inside custom hooks:

```typescript
import {  
  unstable_trace as trace,  
  unstable_wrap as wrap,  
} from "scheduler/tracing"``const useData = () => {  
  const [loading, setLoading] = useState(false)  
  const [data, setData] = useState(null)``const fetch = () => {  
    setLoading(true)  
    fetchData()  
      .then(  
        wrap(data => {  
          setData(data)  
        })  
      )  
      .finally(wrap(() => setLoading(false)))  
  }  
  return { fetch, loading, data }  
}``const Component = () => {  
const { fetch, loading, data } = useData()``return <button  
  onClick={() => trace("Fetch data", performance.now(), fetch)}  
>  
  Fetch data  
</button>  
}
```

### Details and Techniques

In this chapter we take a look at other cases (except our _“Quick Win”_) that make React Profiler worth while. We also talk about cases where it’s not very useful and what to do if we cannot get any meaningful input from it.

### Using profiler in other browsers

While Chrome is the leading browser (at least as of 2021) we sometimes also need to support clients using other agents — noticeable ones being Safari and mobile safari. For this we’ll be using standalone version of React Dev Tools and connect it remotely:

![image](images/15.png#layoutTextWidth)

To get standalone tools fetch it with yarn or npm and simply start:
`npm install -g react-devtools  
react-devtool`

What you should get is a welcome screen with information about how to connect. For browsers it should be as easy as adding a script to your page `<head>` section:
`<script src="[http://localhost:8097](http://localhost:8097)"></script>`

and reloading the page. This will open a web-socket connection from your browser to the app used for all communication between debugger/profiler and dev-tools.

![image](images/16.png#layoutTextWidth)

Unfortunately it has to run before _ReactDOM_ is loaded, so it cannot be added in dev-tools when page is already shown in your browser. Just make sure you remove it from the code before committing or maybe you already have a separate html template for development and production. Then just put it only in dev one.

After a few seconds your app should connect and you should be able to use the same tools as in Chrome extension, but within unsupported browsers.

This solution will also work just fine for iOS Simulator. For Android emulator/device you’ll need another step — connect phone using cable and proxy all requests to localhost from your device to host:
`adb reverse tcp:8097 tcp:8097`

Unfortunately there’s no easy way to use it with real iOS device. Due to security considerations React Dev Tools listen only on localhost and there’s no equivalent for `adb reverse` for iOS.

### Unexpected renders of memoized components

`React.memo` is usually treated as a holy grail and universal tool to fix all your performance problems. But sometimes it simply doesn"t seem to work. Usually it"s due to misunderstanding of how it works or what is really passed into component props. Let"s try to investigate such case using React Profiler and what to look for when we suspect memoization is not working. Here"s our suspected component:

```typescript
const SlowComponent = React.memo(({ text, onClick }) => {  
  const arr = []  
  for (var i = 1000000 - 1; i >= 0; i--) {  
    arr.push(i)  
  }  
  return (  
    <div>  
      <div>I"m slow {text}</div>  
      <button onClick={onClick}/>  
    </div>  
  )  
})
```

It looks like it’s being correctly optimized. But let’s use it in a way that simply passes an inline function as a `onChange` parameter. This will basically make out `React.memo` useless, but what we want to do is to check how will this error manifest itself in React Profiler.

```typescript
const App = () => {  
  const loadData = id => ({ id, value: "some" })  
  const [_, setDummy] = useState()``return (  
    <div className="App">  
      <button onClick={() => setDummy(Date.now())}>Render</button>  
      <SlowComponent onClick={() => loadData("dummy")} />  
    </div>  
  )  
}
```

To investigate problem like this, we need to have at least 2 renders of parent component without any changes in data passed to `SlowComponent`. In this example it"s actually easy. We"ll just press a button few times and it should re-render the `App` component. The only prop we pass in is this problematic inline function. Thanks to `React.memo` it should never re-render. The only moment this component should show up colored in the profiler is its initial mount. Let"s see how it actually behaves in the profiler:

![image](images/17.png#layoutTextWidth)

We can see here, that it has been rendered on each button press, and it has taken quite a lot of time. Thanks to the popup you also see, that it’s due to `onClick` property changing. This is not what we wanted here, let"s fix this inline function and check how will profiler output look like afterwards. Wrapping it in a simple `useCallback` should be enough here:

```typescript
const App = () => {  
  const loadData = id => ({ id, value: "some" })  
  const [_, setDummy] = useState()``return (  
    <div className="App">  
      <button onClick={() => setDummy(Date.now())} />  
      <SlowComponent  
        onClick={React.useCallback(() => loadData("dummy"), [])}  
      />  
    </div>  
  )  
}
```

And here’s how profiling results look like:

![image](images/18.png#layoutTextWidth)

`SlowComponent` did not render anywhere except of initial mount. That"s the result we have expected and it is clearly shown in the profiler data. This example might be trivial, but when investigating performance of theoretically optimized components you"ll be able to easily see them re-rendering in the profiler. Hovering on the component will also show why it has rendered. With this information it should be fairly easy to fix.

#### Using update highlights to find unneeded renders

There’s one more quick way to pinpoint components like that. It’s not really a profiler feature, but React Developer Tools have also an option to mark all rendered components with color borders. It’s especially useful to track forms re-renders. Often we’ll see some undesired renders when we were hoping that only single input was updated. Let’s enable the option now and check how it looks like.

![image](images/19.png#layoutTextWidth)


In the screen below we can see a 3 input form. We’re editing first text input with “Highlight updates when components render” option enabled:

![image](images/20.png#layoutTextWidth)

As you can see, on each character we put into the “What’s your name?” box, we have a render on all inputs and parent component. Parent re-rendering is probably fine, as it’s the place where we keep the state for the form. But all other inputs are not really related to the change, so we can optimize it.

In this particular case it might be an overkill to do it just for 2 inputs. But, especially when working with redux you might see some updates that are totally unexpected. Enabling “Highlight updates when components render” can be the only thing that you need to find performance issues then. It might be worth to enable it from time to time and play around with your app. You might be surprised how many unneeded renders are there.
