FROM node:20-slim

WORKDIR /app

# Install ALL deps (including typescript for next.config.ts)
COPY package*.json ./
RUN npm ci  # Not --only=production!

# Generate Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Copy & build
COPY . .
RUN npm run build

# Final environment settings
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
