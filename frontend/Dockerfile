# ── Etapa 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Etapa 2: Nginx ───────────────────────────────────────────────
FROM nginx:alpine

# Por defecto usa el nginx local, Railway sobreescribe este argumento
ARG NGINX_CONF=nginx.local.conf

COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80