# OpenSSL 核心功能与应用场景

## 一、核心功能

### 1. **加密与解密**
- **对称加密**：AES、SM4（文件/数据库加密）
- **非对称加密**：RSA、ECC、SM2（密钥交换/数字信封）
- **混合加密**：RSA+AES（HTTPS数据传输）

### 2. **证书管理**
- 生成密钥对（RSA/ECC/SM2）
- 签发/解析X.509证书（自签名/CA签发）
- 证书格式转换（PEM ↔ DER）

### 3. **SSL/TLS协议**
- 实现HTTPS安全通信（TLS 1.3）
- 双向认证（mTLS）
- 协议漏洞检测（Heartbleed等）

### 4. **密码学运算**
- 哈希计算（SHA-256/SM3）
- 数字签名（RSA/ECDSA/SM2）
- 随机数生成（加密级随机值）

---

## 二、典型应用场景

### 1. **Web服务器安全**
- 为Nginx/Apache部署HTTPS证书
- 配置HSTS强制加密通信
- 实现OCSP Stapling加速证书验证

### 2. **API与微服务**
- 服务间mTLS双向认证
- 加密敏感API请求数据

微服务mTLS配置示例
```bash
openssl s_server -CAfile ca.crt -cert service.pem -key service.key -Verify 1
```

### 3. **代码/文档完整性**
- 软件包签名（RPM/Debian）
- PDF数字签名验证
- Git commit签名

### 4. **物联网安全**
- 设备身份证书（轻量级ECC证书）
- 固件加密更新


---

## 三、常用命令速查

| **功能**               | **命令示例**                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| 生成RSA密钥            | `openssl genpkey -algorithm RSA -out key.pem`                              |
| AES加密文件            | `openssl enc -aes-256-cbc -salt -in data.txt -out data.enc`                |
| 查看证书信息           | `openssl x509 -in cert.pem -text -noout`                                   |
| 测试HTTPS连接          | `openssl s_client -connect example.com:443 -tlsextdebug`                   |
| 生成CSR                | `openssl req -new -key key.pem -out request.csr`                           |

---

**核心价值**：OpenSSL为网络安全提供基础密码学工具链，覆盖从数据加密到身份认证的全链路安全需求。
