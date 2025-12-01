# BASE_URL 环境变量调试指南

## 问题描述
Docker 模式下 BASE_URL 环境变量不生效

## 调试步骤

### 1. 检查环境变量是否正确传递

在 docker-compose.yml 中启用 BASE_URL：

```yaml
environment:
  - BASE_URL=https://xuande.ltd:28011
```

### 2. 重启 Docker 容器

```bash
# 停止并删除容器
docker compose down

# 重新构建并启动（如果修改了代码）
docker compose up -d --build

# 或者只是重启（如果只修改了环境变量）
docker compose up -d
```

### 3. 查看容器日志

```bash
# 查看实时日志
docker compose logs -f web

# 或者
docker logs -f my-sub-web
```

### 4. 进入容器检查环境变量

```bash
# 进入容器
docker exec -it my-sub-web sh

# 查看环境变量
echo $BASE_URL
env | grep BASE_URL

# 退出容器
exit
```

### 5. 测试生成订阅链接

1. 访问你的网站（例如 https://xuande.ltd:28011）
2. 切换到"文本模式"
3. 输入一些测试内容
4. 点击"生成订阅链接"
5. 查看生成的链接和容器日志

## 预期日志输出

### 如果 BASE_URL 设置成功：
```
Using BASE_URL from environment: https://xuande.ltd:28011
Generated subscription URL: https://xuande.ltd:28011/api/sub/xxx
```

### 如果 BASE_URL 未设置（自动检测）：
```
Auto-detected base URL: https://xuande.ltd:28011
Headers - x-forwarded-proto: https, x-forwarded-host: xuande.ltd:28011, host: xuande.ltd:28011
Generated subscription URL: https://xuande.ltd:28011/api/sub/xxx
```

## 常见问题

### 问题 1：环境变量没有传递到容器
**解决方案**：
- 确保 docker-compose.yml 中取消了 BASE_URL 的注释
- 重启容器：`docker compose down && docker compose up -d`

### 问题 2：使用了旧的镜像
**解决方案**：
- 如果你在使用 `whatgen/my-sub-web:latest`，需要等待新镜像发布
- 或者本地构建：
  ```bash
  docker compose down
  docker build -t my-sub-web:local .
  # 修改 docker-compose.yml 中的 image 为 my-sub-web:local
  docker compose up -d
  ```

### 问题 3：Nginx 反向代理配置问题
如果你使用了 Nginx 反向代理，确保配置了正确的头：

```nginx
location / {
    proxy_pass http://localhost:8011;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
}
```

## 本地开发测试

如果你想在本地测试：

```bash
# 设置环境变量
export BASE_URL=https://xuande.ltd:28011

# 或者在 .env 文件中
echo "BASE_URL=https://xuande.ltd:28011" >> .env

# 运行开发服务器
npm run dev
```

## 验证方法

生成订阅链接后，检查：
1. 链接是否使用了正确的域名和端口
2. 链接是否可以访问（打开链接应该能看到订阅内容）
3. 容器日志中是否有正确的输出

## 需要帮助？

如果以上步骤都无法解决问题，请提供：
1. docker-compose.yml 的完整内容
2. 容器日志输出
3. 生成的订阅链接
4. 是否使用了反向代理（Nginx/Caddy 等）
