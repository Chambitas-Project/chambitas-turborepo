FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/api-gateway ./apps/api-gateway

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chambitas/gateway build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/apps/api-gateway/node_modules

COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules

EXPOSE 3000
CMD ["node", "dist/main"]
