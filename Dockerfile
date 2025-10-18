# Dockerfile (root)
# Small, secure, and without bundling .env

FROM node:20-alpine

# Create app dir and set permissions
WORKDIR /app

# Copy only what's needed to install (no .env)
COPY app/package.json ./

# Install prod deps (none here, but future-proof)
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source (still no .env)
COPY app/server.js ./server.js

# Create non-root user and drop privileges
RUN addgroup -S app && adduser -S app -G app
USER app

# App listens on 3000 internally
EXPOSE 3000

# Optional: lightweight healthcheck (alpine has busybox wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
