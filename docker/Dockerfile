# syntax=docker/dockerfile:1.7
# =============================================================================
# OrcaQ — Production image (Nuxt SPA + Nitro server)
# Build from repo root:  docker build -f docker/Dockerfile -t orcaq .
# =============================================================================

ARG NODE_IMAGE=node:22-alpine3.22

# -----------------------------------------------------------------------------
# 1. Builder — install full toolchain and produce .output
# -----------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS builder

WORKDIR /app

ARG NODE_MAX_OLD_SPACE_SIZE=8192
ENV NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE}"

# Toolchain is only a fallback for native drivers without a musl prebuild.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json .npmrc ./
# --ignore-scripts skips lifecycle hooks (husky needs .git, which is not in the context).
RUN --mount=type=cache,target=/root/.npm \
  npm ci --ignore-scripts --no-audit --no-fund

# Native drivers skipped their install scripts above; rebuild them so the copies
# traced into .output/server/node_modules contain working binaries.
RUN npm rebuild sqlite3 better-sqlite3

COPY . .
RUN npm run nuxt:build-web

# -----------------------------------------------------------------------------
# 2. Runtime deps — database drivers only, compiled for Alpine/musl
# -----------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runtime-deps

WORKDIR /deps

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json /tmp/
COPY docker/scripts/create-runtime-package.mjs /tmp/create-runtime-package.mjs
RUN node /tmp/create-runtime-package.mjs \
  /tmp/package.json /tmp/package-lock.json /deps

RUN --mount=type=cache,target=/root/.npm \
  npm install --omit=dev --no-audit --no-fund

# -----------------------------------------------------------------------------
# 3. Runner — minimal image
# -----------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runner

WORKDIR /app

# - tini: forwards SIGTERM so `docker stop` shuts Node down gracefully
# - DB client CLIs: native backup jobs shell out to them at runtime
#   (pg_dump / pg_restore / psql, mysqldump / mysql, sqlite3)
RUN apk add --no-cache \
  tini \
  postgresql17-client \
  mariadb-client \
  sqlite

COPY --from=runtime-deps --chown=node:node /deps/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.output ./.output

# Mount point for SQLite file connections (see docker/compose.yml).
RUN mkdir -p /data/sqlite && chown -R node:node /data

ENV NODE_ENV=production \
  NITRO_HOST=0.0.0.0 \
  NITRO_PORT=9432

USER node

EXPOSE 9432

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${NITRO_PORT}/" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", ".output/server/index.mjs"]
