FROM node:22-bookworm AS build

WORKDIR /build

RUN corepack enable \
  && corepack prepare pnpm@11.19.0 --activate

COPY package.json ./
COPY scripts ./scripts
RUN npm install --no-package-lock
COPY . ./
RUN npm run build:frontend && npm run build:cli
# Equivalent to pnpm run build without re-installing dependencies in the image
RUN npm prune --omit=dev

FROM node:22-bookworm AS runtime

WORKDIR /app

COPY --from=build /build/dist ./dist
COPY --from=build /build/dist-cli ./dist-cli
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/package.json ./package.json
RUN npm install --global @openai/codex@0.148.0

# 显式安装单命令代理助手；容器默认保持直连。
COPY deploy/with-proxy /usr/local/bin/with-proxy
RUN chmod 0755 /usr/local/bin/with-proxy

ENV NODE_ENV=production \
    HOME=/root \
    CODEX_HOME=/root/.codex \
    SHELL=/bin/bash

WORKDIR /workspace
EXPOSE 5900

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5900/').then((r) => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

USER root
ENTRYPOINT ["node", "/app/dist-cli/index.js"]
