FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/matching-service ./apps/matching-service

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chambitas/matching build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/apps/matching-service/node_modules

COPY --from=builder /app/apps/matching-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/matching-service/node_modules ./apps/matching-service/node_modules

EXPOSE 3003
CMD ["node", "dist/main"]
