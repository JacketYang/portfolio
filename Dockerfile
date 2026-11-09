# 多阶段构建。构建阶段不需要数据库（页面均为按需渲染）。
FROM node:22-alpine AS deps
WORKDIR /app
# 仓库当前没有提交 package-lock.json，所以不能写死 COPY package-lock.json，
# 否则 Docker 构建会在拉取阶段直接报 "package-lock.json: not found"。
# package*.json 能匹配到 package.json 就不会报错；有 lock 时优先 npm ci（可复现），没有则回退 npm install。
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["npm", "start"]
