# 部署指南

## 文本模式已完成 ✅

使用**文件系统存储**，不需要额外的后端服务。

## 快速部署

### 方法 1：Docker Compose（推荐）

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

访问 `http://localhost:3000`

### 方法 2：Docker 单容器

```bash
# 构建镜像
docker build -t my-sub-web .

# 运行（挂载 subscriptions 目录）
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/subscriptions:/app/subscriptions \
  --name my-sub-web \
  my-sub-web

# 查看日志
docker logs -f my-sub-web

# 停止
docker stop my-sub-web
docker rm my-sub-web
```

### 方法 3：本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 重要：数据持久化

### Docker Compose

`docker-compose.yml` 已配置卷挂载：

```yaml
volumes:
  - ./subscriptions:/app/subscriptions
```

这会将容器内的 `/app/subscriptions` 映射到主机的 `./subscriptions` 目录。

### Docker 单容器

使用 `-v` 参数挂载：

```bash
-v $(pwd)/subscriptions:/app/subscriptions
```

**Windows PowerShell**：
```powershell
-v ${PWD}/subscriptions:/app/subscriptions
```

**Windows CMD**：
```cmd
-v %cd%/subscriptions:/app/subscriptions
```

## 验证部署

### 1. 检查服务状态

```bash
# Docker Compose
docker-compose ps

# Docker 单容器
docker ps | grep my-sub-web
```

### 2. 测试文本模式

```bash
# Windows
.\test-text-mode.ps1

# Linux/Mac
chmod +x test-text-mode.sh
./test-text-mode.sh
```

### 3. 手动测试

1. 访问 `http://localhost:3000`
2. 切换到"文本模式"
3. 输入标题和订阅内容
4. 点击"生成订阅链接"
5. 检查是否生成 URL 并复制到剪贴板

### 4. 检查文件

```bash
# 查看订阅文件
ls -lh subscriptions/

# 查看文件内容
cat subscriptions/*.txt
```

## 生产环境部署

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 使用 HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 数据管理

### 备份订阅

```bash
# 方法 1：复制文件夹
cp -r subscriptions subscriptions_backup_$(date +%Y%m%d)

# 方法 2：打包
tar -czf subscriptions_backup_$(date +%Y%m%d).tar.gz subscriptions/

# 方法 3：使用 rsync
rsync -av subscriptions/ /backup/subscriptions/
```

### 恢复订阅

```bash
# 从备份恢复
cp -r subscriptions_backup/* subscriptions/

# 从打包文件恢复
tar -xzf subscriptions_backup_20241127.tar.gz
```

### 清理旧订阅

```bash
# 删除所有订阅
rm subscriptions/*.txt

# 删除特定订阅
rm subscriptions/abc123.txt
```

## 环境变量

在 `.env` 或 `docker-compose.yml` 中配置：

```bash
# 短链接服务（可选）
NEXT_PUBLIC_SHORTURL=https://suo.yt/

# 后端服务（简单/进阶模式必需）
NEXT_PUBLIC_BACKENDS=http://127.0.0.1:25500/sub?
```

**注意**：文本模式不需要额外的环境变量！

## 故障排查

### 问题：文本模式无法生成订阅链接

**检查**：
1. 容器是否正常运行？
   ```bash
   docker-compose ps
   ```

2. API 是否可访问？
   ```bash
   curl http://localhost:3000/api/upload
   ```

3. 查看容器日志：
   ```bash
   docker-compose logs web
   ```

### 问题：订阅文件无法保存

**检查**：
1. 卷挂载是否正确？
   ```bash
   docker inspect my-sub-web | grep Mounts -A 10
   ```

2. 权限是否正确？
   ```bash
   ls -ld subscriptions/
   # 应该可以被容器内的 nextjs 用户写入
   ```

3. 手动创建目录：
   ```bash
   mkdir -p subscriptions
   chmod 755 subscriptions
   ```

### 问题：重启后数据丢失

**原因**：没有挂载卷

**解决**：确保 `docker-compose.yml` 或 `docker run` 命令中包含卷挂载：
```yaml
volumes:
  - ./subscriptions:/app/subscriptions
```

## 更新应用

```bash
# 停止容器
docker-compose down

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 或使用最新镜像
docker-compose pull
docker-compose up -d
```

**注意**：`subscriptions` 目录的数据不会丢失！

## 监控

### 查看日志

```bash
# 实时日志
docker-compose logs -f web

# 最近 100 行
docker-compose logs --tail=100 web
```

### 查看资源使用

```bash
docker stats my-sub-web
```

### 查看订阅数量

```bash
ls subscriptions/*.txt | wc -l
```

## 完成！

现在你有一个完整的、生产就绪的订阅管理系统：

✅ 文本模式使用文件存储  
✅ 数据持久化（卷挂载）  
✅ 易于备份和恢复  
✅ 只需要一个 Docker 容器  
✅ 适合个人使用（5 个订阅文件）  
