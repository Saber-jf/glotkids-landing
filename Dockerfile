# GlotKids site (Coolify, Dockerfile build pack, port 80).
# The production build stops while src/site.ts has unknowns (scripts/check.mjs).
# A preview: build argument DRAFT=1 -> dist-taslak/ (TASLAK banner, noindex).
FROM node:24-slim AS build
ARG DRAFT=0
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN if [ "$DRAFT" = "1" ]; then npm run build:draft && mv dist-taslak out; else npm run build && mv dist out; fi

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/out /srv
EXPOSE 80
