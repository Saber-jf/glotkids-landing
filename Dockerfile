# GlotKids site (Coolify, Dockerfile build pack, port 80).
# The production build stops while src/site.ts has unknowns (scripts/check.mjs).
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && mv dist out

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/out /srv
EXPOSE 80
