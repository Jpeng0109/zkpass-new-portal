FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s \
  CMD wget -qO- http://127.0.0.1:5000/health || exit 1
CMD ["node", "src/server.js"]
