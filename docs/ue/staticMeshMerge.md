# UE静态网格体合并

### 不合并
假设我们的门和门框是一个整体，某些特定场景不需要实现开关门的动作，如果要放置到场景中需要调整，比较麻烦：

<video src="./video/staticMeshMerge-1.mp4" controls width="600"></video>

### 合并静态网格体
```
合并步骤：
选中需要合并的静态网格体，然后如下操作：
Window -> Developer Tools -> Merge Actors
```

<video src="./video/staticMeshMerge-2.mp4" controls width="600"></video>