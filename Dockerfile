FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma/
COPY . .
RUN npx prisma generate --binaryTargets=debian-openssl-1.1.x

FROM node:20-alpine
RUN apk add --no-cache openssl1.1-compat
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist  # or your build output
COPY --from=builder /app/prisma ./prisma
EXPOSE $PORT
CMD ["npm", "start"]
