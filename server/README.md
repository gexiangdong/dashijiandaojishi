# server


#### 安装依赖

```bash
# 安装全局依赖
npm i pm2 nodemon -g

# 安装项目依赖
npm i
```

注释掉 server/node_modules/wafer-node-sdk/index.js 文件内第48行
line 48: if ([rootPathname, useQcloudLogin, cos, serverHost, tunnelServerUrl, tunnelSignatureKey, qcloudAppId, ...
否则本地运行部起来

#### 启动项目

```bash
# 开发环境，监听文件变化自动重启，并会输出 debug 信息
tnpm run dev

# 启动好后，通过浏览器访问
http://localhost:5757/weapp/{在routes/index.js中定义URL}

