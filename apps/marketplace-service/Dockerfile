# 1. ETAPA DE CONSTRUCCIÓN
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiamos archivos de configuración del monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
# Copiamos las librerías compartidas y la app específica
COPY packages ./packages
COPY apps/marketplace-service ./apps/marketplace-service

# Instalamos TODAS las dependencias para poder buildear
RUN pnpm install --frozen-lockfile

# Generamos el build de la app y de las librerías de las que dependa
RUN pnpm --filter @chambitas/marketplace build

# 2. ETAPA DE AISLAMIENTO (pnpm deploy)
# Esto extrae la app compilada, hace prune automático de devDependencies 
# y resuelve los symlinks de los workspaces, dejando una carpeta /prod limpia.
RUN pnpm deploy --filter @chambitas/marketplace --prod /prod/app

# 3. ETAPA DE EJECUCIÓN
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiamos la carpeta aislada y limpia
COPY --from=builder /prod/app ./

EXPOSE 3004

# Ejecutamos desde la raíz del WORKDIR
CMD ["node", "dist/main"]