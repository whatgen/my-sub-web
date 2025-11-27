# my-sub-web 又一个订阅转换前端 （修改--添加一个自己想要的功能））

![Website](https://img.shields.io/website?url=https%3A%2F%2Fmy-sub-web.vercel.app&style=flat-square&label=DEMO) ![Vercel](https://vercelbadge.vercel.app/api/DyAxy/my-sub-web?style=flat-square) ![GitHub License](https://img.shields.io/github/license/DyAxy/my-sub-web?style=flat-square)

又一个 [sub-web](https://github.com/CareyWang/sub-web)，基于 React、Next.JS 实现前端，需要搭配 [tindy2013/subconverter](https://github.com/tindy2013/subconverter) 后端来实现订阅配置。

## 快速部署

### 使用 Vercel 服务

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDyAxy%2Fmy-sub-web&env=NEXT_PUBLIC_SHORTURL,NEXT_PUBLIC_BACKENDS&envDescription=%E5%A6%82%E6%9E%9C%E4%B8%8D%E4%BC%9A%E5%A1%AB%E7%82%B9%E5%8F%B3%E8%BE%B9%20%20Learn%20More&envLink=https%3A%2F%2Fgithub.com%2FDyAxy%2Fmy-sub-web%2Fblob%2Fmaster%2F.env&project-name=my-sub-web&repository-name=my-sub-web)

### 使用 Docker 部署

#### 方式一：Docker Run

使用 Docker Hub 上的镜像快速启动：

```bash
docker run -d \
  -p 8011:3000 \
  --name my-sub-web \
  --restart=always \
  -e TZ=Asia/Shanghai \
  -e NEXT_PUBLIC_SHORTURL=https://suo.yt/ \
  -e NEXT_PUBLIC_BACKENDS=http://127.0.0.1:25500/sub? \
  -v ./subscriptions:/app/subscriptions \
  whatgen/my-sub-web:latest
```

参数说明：
- `-p 8011:3000`：映射端口，可改为 `-p 127.0.0.1:8011:3000` 仅本地访问
- `-e TZ=Asia/Shanghai`：设置时区
- `-e NEXT_PUBLIC_SHORTURL`：短链接服务地址
- `-e NEXT_PUBLIC_BACKENDS`：后端服务地址，多个后端用 `|` 分隔
- `两个方案`：选项 1：使用 Docker 部署后端（推荐tindy2013/subconverter），选项 2：使用公共后端
- `-v ./subscriptions:/app/subscriptions`：挂载订阅文件目录（用于文本模式）
- `--restart=always`：容器自动重启

#### 方式二：Docker Compose（推荐）

1. 下载 docker-compose.yml 文件：
```bash
curl -LO https://raw.githubusercontent.com/whatgen/my-sub-web/master/docker-compose.yml
```

2. 编辑 `docker-compose.yml` 修改环境变量（可选）

3. 启动服务：
```bash
docker compose up -d
```

4. 查看日志：
```bash
docker compose logs -f
```

5. 停止服务：
```bash
docker compose down
```

#### 方式三：本地构建镜像

如果你想自己构建镜像：

```bash
# 克隆仓库
git clone https://github.com/whatgen/my-sub-web.git
cd my-sub-web

# 构建镜像
docker build -t my-sub-web:local .

# 运行容器
docker run -d -p 3000:3000 --name my-sub-web my-sub-web:local
```

### 环境变量
| NEXT_PUBLIC_SHORTURL | NEXT_PUBLIC_BACKENDS        |
| -------------------- | --------------------------- |
| 短链接服务，记得带 /   | 后端完整地址                 |
| https://suo.yt/      | http://127.0.0.1:25500/sub? |


## 常规部署

首先你需要 [Node.js](https://nodejs.org/en/download/package-manager/all) 环境

```
# Clone 库 并跳转至该文件夹
git clone https://github.com/DyAxy/my-sub-web.git
cd my-sub-web
# 当然你可以修改配置在 .env
# NEXT_PUBLIC_SHORTURL 为短链接服务
# NEXT_PUBLIC_BACKENDS 为后端，请使用|分隔
# 安装依赖环境并测试，你也可以使用yarn/pnpm/bun
npm i
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000/) 来查看是否正常运行.

当一切就绪后，你可以打包构建运行它

```
npm run build
npm run start
```

此时打开 [http://localhost:3000](http://localhost:3000/) 即可正常使用。
需要**常驻进程**，可使用：`screen`，`pm2`，`nohup`，`systemctl`

可能你还需要反代，推荐使用 `Caddy` 轻量化反代，仅需加入到 `CaddyFile` 这些即可使用：

```
你的域名.com {
  encode gzip
  reverse_proxy 127.0.0.1:3000
}
```

## 静态导出

在常规部署 `npm run dev` 之后，测试没问题的情况下，修改文件：`next.config.mjs`，添加一行：`nextConfig.output = 'export'`
则会将html及其js文件静态导出至out文件夹，使用 `Caddy`、`nginx` 之类即可使用。


## 感谢

[CareyWang/sub-web](https://github.com/CareyWang/sub-web)  
[CareyWang/MyUrls](https://github.com/CareyWang/MyUrls)  
[tindy2013/subconverter](https://github.com/tindy2013/subconverter)  
