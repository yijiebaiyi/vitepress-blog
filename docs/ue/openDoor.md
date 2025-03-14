# UE使用蓝图实现开关门

## 效果说明
当玩家靠近目标门的时候，门会自动打开，当玩家离开的时候，门自动关闭。

## 实现思路
首先给门添加一个**触发盒**，当玩家靠近触发盒的时候，触发TriggerBox（触发盒）的开始事件`OnActorBeginOverlap`，设置门的旋转角度为90°（打开门）；当玩家离开触发盒的时候，触发TriggerBox（触发盒）的结束事件`OnActorEndOverlap`，将门的旋转角度归零（关闭门）。

## 实现过程
### 1. 给门添加触发盒，并设置门为可移动
<video src="./video/openDoor-1.mp4" controls width="600"></video>

### 2. 选中关卡中的门，打开关卡蓝图，设置门的旋转角度
<video src="./video/openDoor-2.mp4" controls width="600"></video>

### 3. 选中触发盒，完成开门动效
<video src="./video/openDoor-3.mp4" controls width="600"></video>

### 4. 设置时间线，完成开关门
<video src="./video/openDoor-4.mp4" controls width="600"></video>

时间轴连接Play表示从当前时间播放；时间轴连接Reverse表示从当前时间逆向播放

## 说明
- 时间轴的作用是为了让开关门在一定时间有个过渡动作，使开关门的动作更平滑
- 注意一定要将有动效的静态网格体（这里是门）设置为可移动
- 时间轴开始引脚选择`Play`和`Reverse`，而不是`Play from Start` 和 `Reverse from End`， 是为了防止开门到一半的时候强制从初始位置播放开门动效。