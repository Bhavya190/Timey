# Use Debian slim (has OpenSSL built-in, no compat issues)
FROM node:20-slim

WORKDIR /app

# Copy package files first (cache optimization)
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema & generate (targets Debian OpenSSL)
COPY prisma ./prisma/
COPY prisma/schema.prisma ./
RUN npx prisma generate --binaryTargets=debian-openssl-1.1.x

# Copy rest of app
COPY . .

# Build if needed (for Next.js)
RUN npm run build

# Expose Render port
EXPOSE $PORT

# Healthcheck
HEALTHCHECK CMD curl --fail http://localhost:$PORT || exit 1

CMD ["npm", "start"]
