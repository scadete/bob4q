FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace manifests first (for layer caching)
# Build context must be repo root so the workspace lockfile is available.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Build
COPY frontend/ ./frontend/
RUN pnpm --filter frontend build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=base /app/frontend/public ./public
COPY --from=base --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
