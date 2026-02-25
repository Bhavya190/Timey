# Install dependencies
FROM node:20-bookworm-slim AS deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the application
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npm run build  # Runs "migrate && next build" automatically!

# Production runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy Prisma migrations for runtime access
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 10000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
