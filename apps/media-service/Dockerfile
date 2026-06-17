FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/media-service ./apps/media-service

RUN pnpm install --frozen-lockfile
RUN npx turbo run build --filter=@chambitas/media

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/apps/media-service/node_modules

COPY --from=builder /app/apps/media-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/media-service/node_modules ./apps/media-service/node_modules

EXPOSE 3006
CMD ["node", "dist/main"]
