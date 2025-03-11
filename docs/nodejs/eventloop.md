# Node.js事件循环

---

## 一、事件循环的核心概念

### 1.1 什么是事件循环？
事件循环是Node.js实现**异步非阻塞I/O**的核心机制。它通过单线程循环处理事件队列中的任务，确保主线程不被阻塞。

### 1.2 单线程模型的优势与挑战
- **优势**：避免多线程的上下文切换开销，简化并发编程。
- **挑战**：CPU密集型任务可能阻塞主线程，需通过异步拆分解决。

---

## 二、事件循环的六阶段模型
Node.js事件循环分为六个阶段，每个阶段处理特定类型的任务：

| 阶段               | 描述                                                                 |
|--------------------|----------------------------------------------------------------------|
| **Timers**         | 执行`setTimeout`和`setInterval`的回调                              |
| **Pending I/O**    | 处理系统级回调（如TCP错误）                                        |
| **Idle/Prepare**   | Node内部使用                                                       |
| **Poll**           | 检索新的I/O事件，执行I/O回调                                       |
| **Check**          | 处理`setImmediate`回调                                             |
| **Close Callbacks**| 处理关闭事件的回调（如`socket.on('close', ...)`）                  |

### 阶段执行流程
```javascript
// 示例代码：阶段执行顺序
setTimeout(() => console.log('Timer'), 0);
setImmediate(() => console.log('Check'));
fs.readFile(__filename, () => {
console.log('Poll I/O');
setTimeout(() => console.log('Timer in Poll'), 0);
setImmediate(() => console.log('Check in Poll'));
});
// 输出顺序可能为：Poll I/O → Check in Poll → Timer in Poll
```

---

## 三、队列优先级与任务类型

### 3.1 队列类型对比
| 队列类型          | 优先级 | 示例                          |
|-------------------|--------|-------------------------------|
| **Next Tick**     | 最高   | `process.nextTick()`          |
| **Microtask**     | 次高   | `Promise.then()`              |
| **Macrotask**     | 最低   | `setTimeout`, I/O回调         |


### 3.2 `process.nextTick`的特殊性
- **执行时机**：在事件循环各阶段之间立即执行。
- **风险**：滥用可能导致I/O饥饿（Starvation）。

```javascript
// 示例：nextTick优先级
Promise.resolve().then(() => console.log('Microtask'));
process.nextTick(() => console.log('Next Tick'));
// 输出顺序：Next Tick → Microtask
```

---

## 四、libuv库的关键作用
- **跨平台抽象**：封装底层I/O操作，支持Windows IOCP和Linux epoll。
- **线程池管理**：默认4个线程处理文件I/O、DNS等阻塞操作。

---

## 五、定时器机制详解

### 5.1 `setTimeout` vs `setInterval`
- **时间精度**：受事件循环影响，非精确计时。
- **执行策略**：`setTimeout`更适合循环任务以避免堆积。

```javascript
// 示例：setTimeout模拟setInterval
function safeInterval(cb, delay) {
let timer;
const wrapper = () => {
cb();
timer = setTimeout(wrapper, delay);
};
timer = setTimeout(wrapper, delay);
return () => clearTimeout(timer);
}
```

---

## 六、Node.js与浏览器事件循环的差异

| 特性               | Node.js                      | 浏览器                |
|--------------------|------------------------------|-----------------------|
| **阶段划分**       | 6个明确阶段                 | 宏任务/微任务队列     |
| `setImmediate`     | 支持，在Check阶段执行       | 不支持               |
| **微任务执行时机** | 各阶段之间执行              | 宏任务结束后执行     |
| **I/O处理**        | 基于libuv线程池             | 依赖Web APIs         |



---

## 七、最佳实践与性能优化

### 7.1 避免阻塞事件循环
- **拆分CPU密集型任务**：使用`setImmediate`或工作线程。
- **控制队列深度**：避免无限递归`process.nextTick`。

### 7.2 合理选择定时器
```javascript
// 优先使用setImmediate而非setTimeout(fn, 0)
setImmediate(() => {
// 在Check阶段执行，更高效
});
```

---

