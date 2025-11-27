# 文本模式使用指南

## ✅ 已完成！

文本模式现在使用**文件系统存储**，超级简单，不需要任何额外的后端服务。

## 工作原理

```
订阅内容 → 保存到 subscriptions/xxx.txt → 生成访问 URL
```

- 每个订阅对应一个 `.txt` 文件
- 文件保存在 `subscriptions/` 目录
- 重启不会丢失数据
- 最多 5 个文件，完全够用

## 快速开始

### 方法 1：Docker Compose（推荐）

```bash
docker-compose up -d
```

访问 `http://localhost:3000`，文本模式就可以用了！

### 方法 2：本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`

## 测试

```bash
# Windows
.\test-text-mode.ps1

# Linux/Mac
chmod +x test-text-mode.sh
./test-text-mode.sh
```

## 使用文本模式

1. 切换到"文本模式"标签
2. 输入标题和订阅内容
3. 点击"保存"（保存到 localStorage）
4. 点击"生成订阅链接"（保存到文件并生成 URL）
5. 订阅链接已复制到剪贴板！

## 数据管理

### 查看订阅文件

```bash
ls subscriptions/
```

### 备份

```bash
# 复制整个文件夹
cp -r subscriptions subscriptions_backup

# 或打包
tar -czf subscriptions.tar.gz subscriptions/
```

### 恢复

```bash
cp -r subscriptions_backup/* subscriptions/
```

### 清理

```bash
# 删除所有订阅文件
rm subscriptions/*.txt
```

## 文件结构

```
项目/
├── subscriptions/          # 订阅文件存储（自动创建）
│   ├── abc123.txt         # 订阅 1
│   ├── def456.txt         # 订阅 2
│   └── ...
├── app/
│   ├── api/
│   │   ├── upload/        # 上传 API
│   │   └── sub/[id]/      # 获取订阅 API
│   └── ...
└── ...
```

## 部署到服务器

### Docker

```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/subscriptions:/app/subscriptions \
  --name my-sub-web \
  moefaq/yet-another-sub-web
```

### Docker Compose

```yaml
services:
  web:
    image: moefaq/yet-another-sub-web
    ports:
      - "3000:3000"
    volumes:
      - ./subscriptions:/app/subscriptions  # 重要！挂载订阅文件夹
```

## 优点

✅ 超级简单 - 不需要数据库、Redis、额外服务  
✅ 数据持久化 - 重启不丢失  
✅ 易于备份 - 直接复制文件夹  
✅ 易于查看 - 纯文本文件  
✅ 适合个人 - 5 个文件完全够用  

## 完成！

现在你有一个完整的、简单的、只需要一个 Docker 容器的订阅管理系统！
