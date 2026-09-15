# ─── ShopSense Frontend — Docker Image (Multi-Stage) ─────────────────────────
# Stage 1: Build React app with Vite
# Stage 2: Serve compiled dist/ with nginx
# Build:  docker build -t shopsense-frontend .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled bundle from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to proxy /api/* → backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
