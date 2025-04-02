# 使用Node.js官方镜像作为基础镜像
FROM node:18-alpine

# Install build tools
RUN apk update
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache make gcc g++ python3

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN yarn install

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["yarn", "dev"]