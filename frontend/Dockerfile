# =====================================================
# Stage 1: Dependencies
# Install all npm packages for the build
# =====================================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for Vite build)
RUN npm ci --frozen-lockfile

# =====================================================
# Stage 2: Builder
# Compile and bundle the React application with Vite
# =====================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Build the production bundle
# VITE_API_BASE_URL is injected at build time via ARG
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# =====================================================
# Stage 3: Final Production Image
# Serve static files via Nginx (lightweight & fast)
# =====================================================
FROM nginx:stable-alpine AS runner

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Health check using wget (available in alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
