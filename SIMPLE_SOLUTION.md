# 文本模式 - 简单文件存储方案

## 方案说明

使用**文件系统存储**订阅内容，完全不需要额外的后端服务或数据库。

### 工作原理

```
用户输入订阅内容
    ↓
点击"生成订阅链接"
    ↓
调用 /api/upload
    ↓
生成唯一 ID（如：abc123）
    ↓
保存到文件：subscriptions/abc123.txt
    ↓
返回 URL：http://your-domain.com/api/sub/abc123
    ↓
客户端访问 URL → 读取文件 → 返回订阅内容
```

### 文件结构

```
项目根目录/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts          # 上传 API
│   │   └── sub/
│   │       └── [id]/
│   │           └── route.ts      # 获取订阅内容 API
│   └── ...
├── subscriptions/                # 订阅文件存储目录
│   ├── abc123.txt               # 订阅 1
│   ├── def456.txt               # 订阅 2
│   └── ...                      # 最多 5 个文件
└── ...
```

## 优点

✅ **超级简单**：不需要数据库、Redis、额外服务  
✅ **数据持久化**：重启不会丢失数据  
✅ **易于备份**：直接复制 `subscriptions` 文件夹  
✅ **易于查看**：文件是纯文本，可以直接打开查看  
✅ **适合个人使用**：5 个文件完全够用  

## 部署

### 使用 Docker

```bash
# 构建镜像
docker build -t my-sub-web .

# 运行容器（挂载 subscriptions 目录以持久化数据）
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/subscriptions:/app/subscriptions \
  --name my-sub-web \
  my-sub-web
```

### 使用 Docker Compose

更新 `docker-compose.yml`：

```yaml
services:
  web:
    image: moefaq/yet-another-sub-web
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./subscriptions:/app/subscriptions  # 挂载订阅文件夹
    environment:
      TZ: Asia/Shanghai
      NEXT_PUBLIC_SHORTURL: https://suo.yt/
      NEXT_PUBLIC_BACKENDS: http://127.0.0.1:25500/sub?
```

然后：
```bash
docker-compose up -d
```

### 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`，文本模式就可以正常工作了！

## 数据管理

### 查看所有订阅

```bash
ls subscriptions/
# 输出：abc123.txt  def456.txt  ...
```

### 查看订阅内容

```bash
cat subscriptions/abc123.txt
```

### 备份订阅

```bash
# 备份
cp -r subscriptions subscriptions_backup

# 或打包
tar -czf subscriptions_backup.tar.gz subscriptions/
```

### 恢复订阅

```bash
# 从备份恢复
cp -r subscriptions_backup/* subscriptions/
```

### 删除订阅

```bash
# 删除单个订阅
rm subscriptions/abc123.txt

# 清空所有订阅
rm subscriptions/*.txt
```

## 注意事项

1. **文件权限**：确保 Docker 容器有权限写入 `subscriptions` 目录
2. **备份**：定期备份 `subscriptions` 文件夹
3. **清理**：如果不再需要某个订阅，可以手动删除对应的 `.txt` 文件

## 完成！

现在你有一个：
- ✅ 完全不需要额外后端服务
- ✅ 数据持久化（文件存储）
- ✅ 超级简单的文本模式实现

只需要一个 Docker 容器就能运行！
