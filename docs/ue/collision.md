# UE静态网格体设置碰撞

### 不设置碰撞
有的静态网格体模型没有设置碰撞，角色移动会导致穿模：

<video src="./video/collision-1.mp4" controls width="600"></video>

### 设置碰撞
我们可以选中模型之后双击点开，到模型的编辑页面，找到碰撞（collision）这一栏，设置碰撞预设为`BlockAll`，设置碰撞复杂度为`Use Complex Collision As Simple`

<video src="./video/collision-2.mp4" controls width="600"></video>

还可以选择模型编辑器界面上方菜单栏，选中collision，添加一个简单碰撞。我们这里选择盒体碰撞

<video src="./video/collision-3.mp4" controls width="600"></video>