FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/notification-service ./apps/notification-service

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chambitas/notification build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/apps/notification-service/node_modules

COPY --from=builder /app/apps/notification-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/notification-service/node_modules ./apps/notification-service/node_modules

EXPOSE 3005
CMD ["node", "dist/main"]