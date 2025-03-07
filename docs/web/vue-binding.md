# Vue双向绑定

## 什么是双向绑定
**单项绑定**：通过JavaScript控制DOM的展示，就是数据（Data）到模板（DOM）的绑定就是数据的单向绑定。
```html
<p></p>
```
```js
const data = { value: 'hello' }
document.querySelector('p').innerText = data.value;
```


双向绑定是指，数据变化时，视图自动更新；视图更新，数据也会自动更新。Vue双向绑定的实现是通过 `v-model` 来实现的。

```html
<input type="text" v-model="name">
```

```js
new Vue({
    el: '#app',
    data: {
        name: '张三'
    }
})
```
## Vue框架的构成
Vue整个框架由三个部分组成：

**数据层（Model）**：应用的数据及业务逻辑，为开发者编写的业务代码；
**视图层（View）**：应用的展示效果，各类UI组件，由 template 和 css 组成的代码；
**业务逻辑层（ViewModel）**：框架封装的核心，它负责将数据与视图关联起来；

而上面的这个分层的架构方案，可以用一个专业术语进行称呼：**MVVM**。

**ViewModel的主要职责**

- 数据变化后更新视图；

- 视图变化后更新数据；

那么，就可以得出它主要由两个部分组成：

- 监听器（Observer）：观察数据，做到时刻清楚数据的任何变化，然后通知视图更新；
- 解析器（Compiler）：观察UI，做到时刻清楚视图发生的一切交互，然后更新数据；

## Vue双向绑定的原理
### Vue2
Vue2的响应式主要是通过数据劫持来实现的，即通过拦截数据的访问和修改，从而实现数据变化时自动更新视图的效果。
具体实现步骤如下：

在 Vue 实例化时，将 data 对象转换为响应式对象。Vue 通过 Object.defineProperty() 方法将 data 对象中的每个属性转换为 getter 和 setter，并在 getter 和 setter 中添加相应的依赖和观察者Watcher。当属性值发生变化时，setter 会通知相关的观察者更新视图。

当模板中使用 data 中的属性时，Vue 会在 getter 中收集依赖。依赖是一个 Watcher 对象，负责更新视图。
当 data 中的属性发生变化时，setter 会通知相关的观察者进行更新。观察者会在更新视图前先检查依赖是否发生变化，如果依赖没有发生变化，则不进行更新。

当组件被销毁时，会清除该组件的所有依赖和观察者。

通过这种方式，Vue 实现了数据和视图之间的双向绑定，使得数据的变化能够自动更新视图，而视图的变化也能够自动更新数据。这种响应式原理使得开发者能够更加关注数据的处理和业务逻辑，而不必关注视图的处理和更新，从而提高了开发效率和代码的可维护性。

### Vue3
Vue3 的响应式原理相对于 Vue2 有了较大的改变，主要是通过 Proxy 对象来实现响应式，而不再使用 Object.defineProperty()。具体实现步骤如下：

在 Vue3 实例化时，通过 reactive() 函数将 data 对象转换为响应式对象。reactive() 函数使用 Proxy 对象对 data 对象进行拦截，当访问或修改数据时会触发 Proxy 对象的 get 和 set 方法，从而实现依赖的收集和触发更新。

当模板中使用 data 中的属性时，Vue3 会在 get 方法中收集依赖。依赖是一个 reactive 对象的 WeakMap，每个 reactive 对象对应一个 Map，用于存储该对象的所有依赖。

当 data 中的属性发生变化时，Vue3 会触发 set 方法，并通过 reactive 对象的 Map 中存储的依赖来触发更新。与 Vue2 不同的是，Vue3 不再对所有的属性都设置 getter 和 setter，而是只对 reactive 对象进行拦截。

Vue3 采用了 Composition API 的形式来实现组件的逻辑复用和组合。在 setup() 函数中，可以使用 reactive()、ref() 和 computed() 等函数来创建响应式数据和计算属性。当响应式数据发生变化时，会自动触发视图的更新。
通过这种方式，Vue3 实现了更加高效和灵活的响应式原理，使得开发者能够更加自由地组合和复用组件逻辑，并且能够更加精细地控制依赖的收集和触发更新。

## 参考文献
- https://juejin.cn/post/6844903942254510087#heading-9
- https://vue3js.cn/interview/vue/bind.html
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty