# MySQL慢日志定位


## 一、慢SQL定位方法

### 1.1 慢查询日志分析
在MySQL中启用慢查询日志（需重启生效）：
```sql
-- 开启慢日志记录
SET GLOBAL slow_query_log = 1;
-- 设置慢查询阈值（单位：秒）
SET GLOBAL long_query_time = 2;
-- 查看日志路径
SHOW VARIABLES LIKE 'slow_query_log_file';
```
日志内容示例：
```
Time: 2025-03-06T09:15:00.123456Z
Query_time: 3.141592 Lock_time: 0.001000 Rows_sent: 10 Rows_examined: 1000000
SELECT * FROM orders WHERE user_id = 123;
```

### 1.2 监控工具追踪
通过**SkyWalking**等APM工具可快速定位问题：
1. 在追踪模块筛选响应时间超过2秒的接口（默认阈值）
2. 查看接口调用链，定位具体SQL耗时  
3. 分析SQL执行顺序与耗时占比，找出耗时最高的查询 

---

## 二、慢SQL优化策略

### 2.1 索引优化
| 优化场景            | 操作建议                         | 示例SQL                     |
|---------------------|--------------------------------|----------------------------|
| 无索引查询           | 创建复合索引                   | `CREATE INDEX idx_user_order ON orders(user_id, status)` |
| 索引失效             | 避免列运算、避免扫全表                     | `WHERE YEAR(create_time)=2024` → `WHERE create_time BETWEEN '2024-01-01' AND '2024-12-31'` |
| 覆盖索引             | 仅查询索引列                   | `SELECT user_id FROM orders` → 使用`(user_id)`索引 |

### 2.2 查询重构
- **分页优化**：避免`LIMIT 100000,10`式深分页  
  改用延迟关联：
```sql
SELECT * FROM orders o
JOIN (SELECT id FROM orders WHERE status=1 LIMIT 100000,10) tmp
ON o.id = tmp.id
```
- **字段精简**：禁用`SELECT *`，明确字段列表
- **连接优化**：小表驱动大表，避免超过3表JOIN

### 2.3 高级技巧
| 问题类型         | 解决方案                     |
|------------------|----------------------------|
| 文件排序         | 添加`ORDER BY`字段索引       |
| 临时表           | 优化GROUP BY字段顺序        |
| 子查询           | 改写为JOIN操作              |

---

## 三、EXPLAIN执行计划

### 3.1 核心字段解读
```sql
EXPLAIN SELECT * FROM users WHERE age > 18;
```
| 字段            | 说明                                                                 | 优化关注点                  |
|-----------------|--------------------------------------------------------------------|---------------------------|
| type            | 访问类型（性能排序：system > const > ref > range > index > ALL）   | 出现ALL需立即优化          |
| key             | 实际使用索引                                                       | 未使用索引时显示NULL       |
| rows            | 预估扫描行数                                                       | 应与实际数据量相符         |
| Extra           | 附加信息                                                           | Using filesort需重点关注  |

### 3.2 type字段详解
| 类型          | 扫描方式                          | 典型场景                     |
|--------------|----------------------------------|----------------------------|
| const         | 主键/唯一索引等值查询             | `WHERE id = 1`             |
| eq_ref       | JOIN时主键匹配                    | 联表查询中的主键关联         |
| ref          | 非唯一索引等值查询                | `WHERE index_col = 'val'`  |
| range        | 索引范围扫描                      | `WHERE age BETWEEN 18-30`  |
| index        | 全索引扫描                        | 覆盖索引查询                |

### 3.3 Extra关键信息
| 标识                  | 含义                                                                 |
|----------------------|--------------------------------------------------------------------|
| Using index          | 使用覆盖索引，无需回表                                             |
| Using temporary      | 使用临时表，常见于GROUP BY/ORDER BY                               |
| Using filesort       | 文件排序，需优化索引或调整排序字段                                 |
| Using where          | 存储引擎返回行后在Server层过滤                                     |
| Using index condition | 使用索引下推，减少回表次数

---

## 四、案例

**案例背景**：订单分页查询耗时39秒  
```sql
SELECT * FROM orders
WHERE status=1
ORDER BY create_time DESC
LIMIT 1000000,10;
```

**优化步骤**：
1. `EXPLAIN`显示type=ALL，扫描行数1000万+
2. 创建`(status, create_time)`复合索引
3. 改写为延迟关联查询：
```sql
SELECT o.* FROM orders o
JOIN (
SELECT id FROM orders
WHERE status=1
ORDER BY create_time DESC
LIMIT 1000000,10
) tmp ON o.id = tmp.id
```
4. 优化后耗时降至0.2秒，`EXPLAIN`显示type=range

---

## 五、监控工具
| 工具名称         | 功能特点                                       | 适用场景               |
|------------------|----------------------------------------------|----------------------|
| SkyWalking       | 全链路追踪，SQL执行可视化                      | 微服务架构           |
| pt-query-digest | 慢日志深度分析，TOP SQL统计                   | 离线分析             |
| MySQLTuner       | 自动配置建议，索引优化推荐                    | 服务器巡检           |


