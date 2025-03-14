# MySQL安装与配置


## 一、安装方式对比

| 方式                | 适用场景                     | 优势                          | 劣势                  |
|---------------------|----------------------------|-----------------------------|----------------------|
| 包管理器安装          | 快速部署标准版              | 自动处理依赖关系               | 版本选择受限          |
| 二进制包安装          | 定制化生产环境              | 版本灵活/隔离部署              | 需手动处理依赖        |
| 源码编译安装          | 深度定制/开发环境           | 极致性能调优                  | 耗时/需开发工具链     |

---

## 二、安装

### 2.1 包管理器安装
```bash
#CentOS/RedHat
sudo yum install -y mysql-server
sudo systemctl start mysqld

#Ubuntu/Debian
sudo apt install -y mysql-server
sudo systemctl start mysql

#自动初始化后获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log
```


### 2.2 二进制包安装
```bash
#下载解压（以8.0.32为例）
wget https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.32-linux-glibc2.12-x86_64.tar.xz
tar -xvf mysql-8.0.32-*.tar.xz -C /usr/local/
mv /usr/local/mysql-8.0.32 /usr/local/mysql

#创建系统用户
groupadd mysql
useradd -r -g mysql -s /bin/false mysql

#初始化数据库
/usr/local/mysql/bin/mysqld --initialize --user=mysql --basedir=/usr/local/mysql --datadir=/data/mysql

```

### 2.3 源码编译安装
```bash
#安装依赖
yum install -y cmake ncurses-devel openssl-devel bison

#编译配置
cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql
-DMYSQL_DATADIR=/data/mysql
-DSYSCONFDIR=/etc
-DWITH_INNOBASE_STORAGE_ENGINE=1
-DWITH_SSL=system

#编译安装
make -j$(nproc) && make install
```



## 三、核心配置项详解（my.cnf）
查看配置文件路径：
```bash
mysqld --verbose --help | grep "my.cnf" 
```
### 3.1 基础配置模块
```ini
[mysqld]

#网络设置
port=3306
bind-address=0.0.0.0 # 允许远程连接

#文件路径
datadir=/data/mysql
socket=/var/lib/mysql/mysql.sock

#字符集配置
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
```

### 3.2 内存优化模块
```ini

#缓冲池（推荐物理内存的60-80%）
innodb_buffer_pool_size=16G

#连接设置
max_connections=1000
thread_cache_size=100

#询缓存（8.0+已废弃）
#query_cache_type=0
```
### 3.3 日志管理模块
```ini
ini

错误日志
log_error=/var/log/mysql/error.log

慢查询日志
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2

二进制日志（主从复制）
server-id=1
log-bin=/var/log/mysql/mysql-bin
expire_logs_days=7
```

### 3.4 引入目录下配置
```ini
!includedir /etc/my.cnf.d
```
---

## 四、安装后安全配置

### 4.1 密码策略加固
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'StrongPassword123!';
SET GLOBAL validate_password.policy=STRONG;
```

### 4.2 远程访问控制
```sql
CREATE USER 'app_user'@'192.168.1.%' IDENTIFIED BY 'UserPass123!';
GRANT SELECT,INSERT,UPDATE ON app_db.* TO 'app_user'@'192.168.1.%';
REVOKE SUPER ON . FROM 'root'@'%';
```

### 4.3 防火墙配置
```bash
# CentOS
firewall-cmd --permanent --add-port=3306/tcp
firewall-cmd --reload

# Ubuntu
ufw allow 3306/tcp
```
### 4.4 忘记密码（8.0版本）
(1) 进入安全模式，跳过权限认证：

修改my.cnf
```ini
[mysqld]
skip-grant-tables
```
(2) 重启服务
```bash
# Ubuntu/Debian
sudo systemctl restart mysql   

# CentOS/RedHat
sudo systemctl restart mysqld   
```
(3) 无密码登录
```bash
mysql -u root -p  # 直接按回车（无需输入密码）
```
(4) 清空root密码
```bash
USE mysql;
UPDATE user SET authentication_string = '' WHERE user = 'root';
FLUSH PRIVILEGES;
EXIT;
```
(5) 移除安全模式配置

删除配置项：my.cnf中的skip-grant-tables

(6) 设置新密码
```bash
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword';
FLUSH PRIVILEGES;
```
> 密码需包含大小写字母、数字和符号，否则可能因安全策略报错

---

## 五、高级配置技巧

### 5.1 存储引擎优化
```ini

# InnoDB配置
innodb_flush_log_at_trx_commit=1 # ACID保证
innodb_log_file_size=2G # 日志文件大小
innodb_file_per_table=ON # 独立表空间

# MyISAM配置（仅遗留系统需要）
key_buffer_size=512M
```

### 5.2 事务隔离级别
```sql
-- 查看当前级别
SELECT @@transaction_isolation;

-- 设置级别（建议READ-COMMITTED）
SET GLOBAL transaction_isolation='READ-COMMITTED';
```

### 5.3 性能监控配置
```ini
# 开启性能模式
performance_schema=ON

# 状态监控
userstat=1
innodb_monitor_enable=all
```

---

## 六、版本差异

| 功能点         | MySQL 5.7                  | MySQL 8.0                  |
|---------------|---------------------------|----------------------------|
| 密码策略       | validate_password插件      | 内置密码强度组件            |
| 身份认证       | mysql_native_password     | caching_sha2_password       |
| 默认字符集     | latin1                    | utf8mb4                     |
| 数据字典       | MyISAM系统表              | InnoDB事务型字典            |



---

## 七、配置样例
```ini
[client]
user = root
password = StrongPassword123_
port = 3306
socket = /home/db/mysql/mysql/run/mysql.sock

[mysql]
init_command = set names utf8mb4
port = 3306
socket = /home/db/mysql/mysql/run/mysql.sock
prompt= \\u@<本机hostname>\\R:\\m:\\s [\d]>     # hostname is the server hostname

[mysqld]
# 主从配置唯一id。
server-id = 10  # denpend on server-id rule (slave:20/30/40)

port = 3306
user = mysql
basedir = /usr
datadir = /home/db/mysql/data
tmpdir = /home/db/mysql/tmp
socket = /home/db/mysql/mysql/run/mysql.sock
character_set_server=utf8mb4
collation_server= utf8mb4_bin
lower_case_table_names=1
pid-file=/home/db/mysql/mysql/run/mysqld.pid
log_timestamps=SYSTEM

# MySQL的对外IP地址
report_host=<本机生产IP>

max_connect_errors=18446744073709551615
local_infile=ON

# 在主库中关闭而在从库中打开。防止双活写库。
# read_only=OFF
# super_read_only=OFF

#Mysqldump -T信任目录
secure_file_priv = /home/db/mysql
#-------------------------------------binlog-----------------------------------------------
log_bin=/home/db/mysql/binlog/master-bin
binlog_cache_size=2M

binlog_rows_query_log_events=1

gtid-mode=on
enforce-gtid-consistency=on
binlog_format=ROW
sync_binlog=1

#-------------------------------------replication------------------------------------------
# rpl_semi_sync_master_enabled=1
# rpl_semi_sync_master_timeout=1000     # 1second
# rpl_semi_sync_slave_enabled=1
master_info_repository=table
relay_log_info_repository=table
relay_log=/home/db/mysql/binlog/relay/master-relay-bin
relay_log_recovery=ON
gtid_mode=ON
enforce_gtid_consistency=ON
group_concat_max_len=10240

#---------------------------------InnoDB Cluster--------------------------------------------
# plugin_load_add='group_replication.so'
# loose-group_replication_single_primary_mode=ON
# loose-group_replication_group_name='9c1bb66d-8c73-4223-ab11-1dec63d1d95b'
# loose-group_replication_start_on_boot=OFF
#本地IP及集群通信端口
# loose-group_replication_local_address='192.168.22.96:33061'
# loose-group_replication_group_seeds='192.168.22.96:33061,192.168.22.97:33061,192.168.22.98:33061'
# loose-group_replication_bootstrap_group=OFF

[mysqld-8.0.27]
log_replica_updates=ON
replica_parallel_type=LOGICAL_CLOCK
replica_preserve_commit_order=1
replica_parallel_workers=32
replica_pending_jobs_size_max=128M

[mysqld-8.0.23]
log_slave_updates=ON
slave_parallel_type=LOGICAL_CLOCK
slave_preserve_commit_order=1
slave_parallel_workers=32
slave_pending_jobs_size_max=128M


[mysqld-5.7.33]
log_slave_updates=ON
slave_parallel_type=LOGICAL_CLOCK
slave_preserve_commit_order=1
slave_parallel_workers=32
slave_pending_jobs_size_max=128M


[mysqld]
#-------------------------------------slow log---------------------------------------------
slow_query_log=ON
slow_query_log_file = /home/db/mysql/log/mysql_slow.log
long_query_time = 10

#-------------------------------------error log--------------------------------------------
log_error =/home/db/mysql/log/mysql_error.log

#-------------------------------------thread-----------------------------------------------
max_connections = 10000         # dependent on machine parameter
key_buffer_size = 256M
max_allowed_packet = 128M
table_open_cache = 6000
table_open_cache_instances = 4                  # CPU COUNT and <64
sort_buffer_size = 8M
read_rnd_buffer_size=16M
join_buffer_size = 2M
tmp_table_size = 64M
max_heap_table_size = 64M
group_concat_max_len=10240

#-------------------------------------innodb-----------------------------------------------
innodb_data_file_path=ibdata1:1024M:autoextend
innodb_buffer_pool_size = 4G                    # physical memory’s 50%
innodb_buffer_pool_instances = 4        # CPU COUNT and <64
innodb_log_file_size = 1G
innodb_log_files_in_group = 4
innodb_log_buffer_size = 32M
innodb_lock_wait_timeout = 600
innodb_print_all_deadlocks=ON

innodb_thread_concurrency = 4                   # CPU COUNT and <64
innodb_flush_method=O_DIRECT
innodb_read_io_threads =32
innodb_write_io_threads =32
innodb_io_capacity = 20000              # HDD 800 SSD 4000--
innodb_temp_data_file_path=ibtmp1:512M:autoextend:max:32G
innodb_flush_log_at_timeout=2
log_bin_trust_function_creators=ON
transaction_isolation=READ-COMMITTED
innodb_undo_directory=/home/db/mysql/data
innodb_undo_log_truncate=ON
innodb_max_undo_log_size=2G
innodb_purge_rseg_truncate_frequency=16
innodb_page_cleaners = 4                                # CPU COUNT and <64
innodb_numa_interleave=ON
innodb_online_alter_log_max_size=2G

#-------------------------------------other------------------------------------------------
init_file=/home/db/mysql/scripts/performance_collection
default-time-zone='+08:00'
skip-name-resolve

[mysqld-5.7]
# binlog日志的自动清理时间，默认是99天，最大值就是99天。
expire_logs_days=30
default_authentication_plugin=mysql_native_password

# 8.0版本数据库专用参数
[mysqld-8.0]
# 8.0数据库使用，5.7中系统表依然使用MyISAM，使用该选项会导致数据全量导入失败
disabled_storage_engines='MyISAM,BLACKHOLE,FEDERATED,ARCHIVE,MEMORY'
innodb_print_ddl_logs=ON
default_authentication_plugin=mysql_native_password
binlog_transaction_dependency_tracking = WRITESET
slave_parallel_type = LOGICAL_CLOCK
slave_preserve_commit_order = ON

# binlog日志的自动清理时间，默认是99天，最大值就是99天。
binlog_expire_logs_seconds=2592000

[mysqld_safe]
malloc-lib=/usr/lib64/libtcmalloc.so
```

