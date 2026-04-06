# ── Etapa 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# La variable de entorno que usa api.ts para saber dónde está el backend
# En producción Docker, el frontend llama al backend por su nombre de servicio
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Etapa 2: Nginx ───────────────────────────────────────────────
FROM nginx:alpine

# Configuración de Nginx adaptada a React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia el build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80