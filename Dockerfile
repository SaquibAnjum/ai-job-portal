# Node.js Base Image
FROM node:18-alpine AS base

WORKDIR /app

# Copy root & backend dependencies
COPY package.json ./
COPY server/package.json ./server/
RUN cd server && npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server/server.js"]
