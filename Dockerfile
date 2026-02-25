FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma/
RUN npx prisma generate  # No --binaryTargets flag!

COPY . .
RUN npm run build  # For Next.js

EXPOSE $PORT
CMD ["npm", "start"]
