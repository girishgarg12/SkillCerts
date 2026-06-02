# Stage 1: Install build dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Stage 2: Compile React assets using Vite compiler
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Inject Backend URL into client bundle at build-time
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 3: Serve static web assets using Nginx
FROM nginx:stable-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Periodically verify web server is online
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
