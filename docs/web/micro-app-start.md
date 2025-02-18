# 微前端与Micro-app框架入门指南

## 什么是微前端？

**微前端（Micro Frontends）** 是一种将前端应用拆分为独立模块的架构模式，类似于后端微服务架构。它允许不同团队独立开发、测试和部署前端模块，最终组合成完整的应用程序。主要优势包括：

- 技术栈无关性（React/Vue/Angular等混用）
- 独立开发部署
- 渐进式升级
- 更好的代码隔离

## 为什么选择Micro-app？

在众多微前端框架中，**Micro-app** 凭借以下特点脱颖而出：

### 核心优势
1. **零成本接入** - 基于WebComponent实现
2. **无感使用** - 类似iframe但无性能损耗
3. **功能丰富** - 完善的路由/样式/资源隔离
4. **轻量易用** - 1kb+的运行时体积

### 对比传统方案
| 特性           | Micro-app | iframe  | Single-SPA |
|----------------|-----------|---------|------------|
| 开发成本       | 低        | 低      | 高         |
| 样式隔离       | ✔️        | ✔️      | ❌         |
| 路由同步       | ✔️        | ❌      | ✔️         |
| 通信效率       | 高        | 低      | 中         |

## 快速上手Micro-app

### 安装
```bash
# 使用npm
npm i @micro-zoe/micro-app --save

# 使用yarn
yarn add @micro-zoe/micro-app
```
### 基础使用
```javascript
// 主应用入口
import microApp from '@micro-zoe/micro-app'

// 初始化
microApp.start()

// 在React/Vue组件中使用
function MainApp() {
  return (
    <div>
      <h1>主应用</h1>
      <micro-app
        name="sub-app"
        url="http://localhost:3000/"
        baseroute="/sub-app"
      ></micro-app>
    </div>
  )
}
```
### 配置项目说明
```html
<micro-app
  name="demo"
  url="http://localhost:3001"
  baseroute="/demo-path"   // 基础路由
  disable-memory-router    // 禁用虚拟路由
  disable-scopecss         // 关闭样式隔离
  keep-alive               // 应用保活
></micro-app>
```

## 核心功能解析

### 应用通信

**主应用 => 子应用**
```javascript
// 主应用发送数据
microApp.setData('sub-app', { type: 'userinfo', data: {name: 'Alice'} })

// 子应用监听
window.microApp?.addDataListener((data) => {
  console.log('收到数据:', data)
})
```

**子应用 => 主应用**
```
// 子应用发送事件
window.microApp?.dispatch({ type: 'logout' })

// 主应用监听
document.getElementById('my-micro-app').addEventListener('datachange', (e) => {
  console.log('收到子应用数据:', e.detail.data)
})
```

## 路由控制
```javascript
// 主应用路由配置
<BrowserRouter>
  <Routes>
    <Route path="/sub-app/*" element={<MicroApp />} />
  </Routes>
</BrowserRouter>

// 子应用适配
if (window.__MICRO_APP_ENVIRONMENT__) {
  // 使用基路由
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter basename={window.__MICRO_APP_BASE_ROUTE__ || '/'}>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
  )
}
```

## 最佳实践建议

### 样式隔离
 +  开启默认的样式沙箱
 +  避免使用!important
 + 推荐CSS Modules方案
### 资源加载
```html
<!-- 预加载资源 -->
<micro-app
  prefetch
  disable-prefetch-ignore
></micro-app>
```

### 错误处理
```javascript
microApp.start({
 lifeCycles: {
   error(e) {
     console.error('应用加载失败:', e)
     // 显示错误页面
   }
 }
})
```

## QAQ
Q: 子应用静态资源404
```javascript
// 设置publicPath
if (window.__MICRO_APP_ENVIRONMENT__) {
  __webpack_public_path__ = window.__MICRO_APP_PUBLIC_PATH__
}
```
Q: Vue-Router冲突
```javascript
// 主应用：关闭路由劫持
<micro-app disable-memory-router></micro-app>

// 子应用：手动处理路由
if (window.__MICRO_APP_ENVIRONMENT__) {
  router = createWebHashHistory()
}
```