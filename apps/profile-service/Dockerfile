FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/profile-service ./apps/profile-service

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chambitas/profile build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/apps/profile-service/node_modules

COPY --from=builder /app/apps/profile-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/profile-service/node_modules ./apps/profile-service/node_modules

EXPOSE 3002
CMD ["node", "dist/main"]
