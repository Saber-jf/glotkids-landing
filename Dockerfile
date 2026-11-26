# GlotKids site (Coolify, Dockerfile build pack, port 80).
# The production build stops while src/site.ts has unknowns (scripts/check.mjs).
# The server always builds the PUBLISHED site (2026-11-26): the DRAFT build
# argument is no longer read here, so a DRAFT=1 left in Coolify changes nothing.
# A draft preview is local only: `npm run build:draft` -> dist-taslak/.
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
