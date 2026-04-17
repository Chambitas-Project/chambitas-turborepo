FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/auth-service ./apps/auth-service

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chambitas/auth build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/auth-service/node_modules ./apps/auth-service/node_modules

EXPOSE 3001
CMD ["node", "dist/main"]
