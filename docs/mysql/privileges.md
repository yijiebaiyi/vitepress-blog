# MySQL用户与权限(基于8.0版本)


## 一、用户管理核心命令

### 1.1 用户创建与删除
```sql
-- 创建用户（MySQL 8.0+推荐方式）
CREATE USER 'username'@'host' IDENTIFIED BY 'password';

-- 范围Ip
CREATE USER 'username'@'192.168.1.%' IDENTIFIED BY 'password';

-- 删除用户
DROP USER 'username'@'host';
```
>注意：创建用户和删除用户不指定Host,则默认为%，表示所有IP都有连接权限。
### 1.2 密码管理
```sql
-- 修改用户密码（MySQL 8.0+）
ALTER USER 'username'@'host' IDENTIFIED BY 'new_password';

-- 手动刷新权限（部分场景需执行）
FLUSH PRIVILEGES;
```

### 1.3 用户信息查询
```sql
-- 查看所有用户
SELECT user, host FROM mysql.user;

-- 查看用户权限
SHOW GRANTS FOR 'username'@'host';
```

---

## 二、权限管理核心命令

### 2.1 授权（GRANT）
```sql
-- 基础语法
GRANT privileges ON object TO 'username'@'host';

-- 示例：授予mydb.users表的SELECT权限
GRANT SELECT ON mydb.users TO 'admin'@'localhost';

-- 允许用户转授权限
GRANT SELECT ON mydb.* TO 'user1'@'%' WITH GRANT OPTION;

-- 全局权限（所有数据库）
GRANT CREATE USER ON . TO 'dba'@'10.0.0.%';
```
**关键参数说明**：
- `privileges`：`SELECT`/`INSERT`/`UPDATE`/`DELETE`/`ALL PRIVILEGES`等
- `object`：`*.*`（全局）、`dbname.*`（数据库级）、`dbname.tablename`（表级）
- `WITH GRANT OPTION`：允许权限传递 (#资料)

### 2.2 撤销权限（REVOKE）
```sql
-- 撤销特定权限
REVOKE INSERT ON mydb.* FROM 'user1'@'localhost';

-- 撤销GRANT OPTION
REVOKE GRANT OPTION ON mydb.* FROM 'user1'@'localhost';
```


---

## 三、权限层级结构

| 层级        | 作用范围                  | 存储表              | 示例命令                          |
|-------------|---------------------------|---------------------|-----------------------------------|
| 全局层级    | 所有数据库                | mysql.user          | `GRANT CREATE ON *.* TO ...`      |
| 数据库层级  | 指定数据库的所有对象      | mysql.db            | `GRANT SELECT ON mydb.* TO ...`   |
| 表层级      | 指定表的所有列            | mysql.tables_priv   | `GRANT DELETE ON mydb.users TO ...` |
| 列层级      | 表中特定列                | mysql.columns_priv  | `GRANT SELECT(id) ON mydb.users TO ...` |
| 存储过程    | 特定存储过程/函数         | mysql.procs_priv    | `GRANT EXECUTE ON PROCEDURE ...`  |

**注意**：列级权限需指定具体列名，例如`GRANT SELECT(name) ON mydb.users TO ...` (#资料)

---

## 3.1 常见错误场景及解决方案

### 错误1：Access denied (1044)
**场景**：用户尝试访问未授权的数据库  
**排查步骤**：
1. 检查权限：
```sql
SHOW GRANTS FOR 'user'@'localhost';
```
2. 授予权限：
```sql
GRANT SELECT ON target_db.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

### 错误2：SELECT command denied (1142)
**场景**：用户无权访问特定表  
**解决方案**：
```sql
GRANT SELECT ON dbname.tablename TO 'user'@'host';
```
### 错误3：Public Key Retrieval is not allowed
**场景**：用户访问未授权远程数据库
**解决方案**：
```sql
-- root用户为例
-- 1.创建root用户 % 权限
CREATE USER 'root'@'%' IDENTIFIED BY 'password';
-- 2.给新创建的root % 用户所有权限
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
-- 3.刷新权限
FLUSH PRIVILEGES;
```

### 错误4：权限不生效
**原因**：未刷新权限或用户未重连  
**解决**：
```sql
FLUSH PRIVILEGES; -- 强制刷新权限
```

---

## 3.2 角色管理

### 角色操作命令
```sql
-- 创建角色
CREATE ROLE 'role_read', 'role_write';

-- 为角色授权
GRANT SELECT ON . TO 'role_read';
GRANT INSERT, UPDATE ON mydb.* TO 'role_write';

-- 将角色分配给用户
GRANT 'role_read' TO 'user1'@'localhost';

-- 激活角色
SET DEFAULT ROLE ALL TO 'user1'@'localhost';
```

**优势**：通过角色实现权限组管理，简化多用户权限分配 (#资料)

---

## 四、权限审计方法

### 方案1：init_connect + Binlog
```sql
-- 创建审计表
CREATE TABLE audit_log (
id INT AUTO_INCREMENT PRIMARY KEY,
user_host VARCHAR(255),
login_time DATETIME
);

-- 配置my.cnf
[mysqld]
init_connect='INSERT INTO audit.accesslog VALUES (NOW(), USER(), CURRENT_USER());'
```

### 方案2：McAfee审计插件
1. 安装插件：
```ini
plugin-load=audit_log.so
audit_log_format=JSON
```
2. 审计日志路径：
```sql
SHOW VARIABLES LIKE 'audit_log_file';
```

**对比**：插件方案记录更详细但影响性能，init_connect适合轻量级审计 (#资料)

---

## 五、最佳实践

1. **最小权限原则**  
- 避免使用`GRANT ALL ON *.*`
- 按需授予列级/表级权限

2. **定期审计**  
```sql
-- 检查过时权限
SELECT * FROM mysql.user WHERE password_last_changed < NOW() - INTERVAL 90 DAY;
```

3. **密码策略强化**
```sql
ALTER USER 'user'@'host' PASSWORD EXPIRE INTERVAL 90 DAY;
```

4. **角色继承管理**  
```sql
-- 查看角色权限
SHOW GRANTS FOR 'role_read';
```

5. **网络隔离**  
- 限制远程访问IP范围：`GRANT ... TO 'user'@'192.168.1.%'`

6. **备份权限配置**  
```bash
mysqldump --no-data -u root -p mysql > mysql_schema_backup.sql
```

