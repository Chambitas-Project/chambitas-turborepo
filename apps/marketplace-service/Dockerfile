FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/marketplace-service ./apps/marketplace-service

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chambitas/marketplace build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/marketplace-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/marketplace-service/node_modules ./apps/marketplace-service/node_modules

EXPOSE 3004
CMD ["node", "dist/main"]
