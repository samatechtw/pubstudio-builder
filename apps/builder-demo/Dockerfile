FROM node:20-alpine3.18 AS base
ENV TINI_VER=0.19
ENV NGINX_VER=1.24
ENV PNPM_VERSION 8.7.0

RUN apk add --no-cache \
  curl~=8 \
  tini~="$TINI_VER" \
  nginx~="$NGINX_VER"
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

# DEV BUILDER DEMO BUILD IMAGE
# ------------------------------------------------------------------------------------
FROM base as base.build

WORKDIR /usr/src

COPY tools/scripts/*-subset* ./tools/scripts/
COPY apps/builder-demo/subset.config.js ./apps/builder-demo/
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
RUN node ./tools/scripts/package-subset.js builder-demo apps/builder-demo/subset.config.js package.json package.json

RUN pnpm i

COPY nx.json ./
COPY tsconfig*.json ./
COPY libs/shared ./libs/shared
COPY libs/frontend ./libs/frontend
COPY apps/builder-demo/*.json ./apps/builder-demo/
COPY apps/builder-demo/index.html ./apps/builder-demo/
COPY apps/builder-demo/vite.config.ts ./apps/builder-demo/
COPY apps/builder-demo/postcss.config.js ./apps/builder-demo/
COPY apps/builder-demo/src ./apps/builder-demo/src
COPY tools/nginx nginx

# DEV BUILDER DEMO BUILD IMAGE
# ------------------------------------------------------------------------------------
FROM base.build as build.dev
ARG LAST_COMMIT_SHA
ENV VITE_LAST_COMMIT_SHA=$LAST_COMMIT_SHA
ARG RELEASE_VERSION
ENV VITE_RELEASE_VERSION=$RELEASE_VERSION
ARG VITE_EXEC_ENV=dev
ENV VITE_EXEC_ENV=$VITE_EXEC_ENV
ARG VITE_API_HOST=site-api:3100
ENV VITE_API_HOST=$VITE_API_HOST
ARG VITE_SITE_FORMAT_VERSION=0.1
ENV VITE_SITE_FORMAT_VERSION=$VITE_SITE_FORMAT_VERSION
ARG VITE_S3_SITE_ASSETS_URL=https://pub-3091ea5c0f2e49f680e2481e04871042.r2.dev
ENV VITE_S3_SITE_ASSETS_URL=$VITE_S3_SITE_ASSETS_URL
RUN pnpm run build:builder-demo

# DEV BUILDER DEMO APP IMAGE
# ------------------------------------------------------------------------------------
FROM base as dev
COPY --from=build.dev --chown=app:app /usr/src/dist/apps/builder-demo /usr/share/nginx/html
COPY --from=build.dev --chown=app:app /usr/src/nginx/nginx.conf /etc/nginx/
COPY --from=build.dev --chown=app:app /usr/src/nginx/conf.d /etc/nginx/conf.d
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "exec nginx -g 'daemon off;'"]

# STAGING BUILDER DEMO BUILD IMAGE
# ------------------------------------------------------------------------------------
FROM base.build as build.stg
ARG LAST_COMMIT_SHA
ENV VITE_LAST_COMMIT_SHA=$LAST_COMMIT_SHA
ARG RELEASE_VERSION
ENV VITE_RELEASE_VERSION=$RELEASE_VERSION
ARG VITE_EXEC_ENV=stg
ENV VITE_EXEC_ENV=$VITE_EXEC_ENV
ARG VITE_API_HOST=https://s1.stg.pubstud.io
ENV VITE_API_HOST=$VITE_API_HOST
ARG VITE_SITE_FORMAT_VERSION=0.1
ENV VITE_SITE_FORMAT_VERSION=$VITE_SITE_FORMAT_VERSION
ARG VITE_S3_SITE_ASSETS_URL=https://pub-d5f0f1ff65b44136af53a8d4737bd47f.r2.dev
ENV VITE_S3_SITE_ASSETS_URL=$VITE_S3_SITE_ASSETS_URL
ARG VITE_S3_TEMPLATE_PREVIEWS_URL=https://pub-7476b53237c5423499c0d21275d1767b.r2.dev
ENV VITE_S3_TEMPLATE_PREVIEWS_URL=$VITE_S3_TEMPLATE_PREVIEWS_URL
RUN pnpm run build:builder-demo

# STAGING BUILDER DEMO APP IMAGE
# ------------------------------------------------------------------------------------
FROM base as stg
COPY --from=build.stg --chown=app:app /usr/src/dist/apps/builder-demo /usr/share/nginx/html
COPY --from=build.stg --chown=app:app /usr/src/nginx/nginx.conf /etc/nginx/
COPY --from=build.stg --chown=app:app /usr/src/nginx/conf.d /etc/nginx/conf.d
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "exec nginx -g 'daemon off;'"]

# PRODUCTION BUILDER DEMO BUILD IMAGE
# ------------------------------------------------------------------------------------
FROM base.build as build.prod
ARG LAST_COMMIT_SHA
ENV VITE_LAST_COMMIT_SHA=$LAST_COMMIT_SHA
ARG RELEASE_VERSION
ENV VITE_RELEASE_VERSION=$RELEASE_VERSION
ARG VITE_EXEC_ENV=prod
ENV VITE_EXEC_ENV=$VITE_EXEC_ENV
ARG VITE_API_HOST=https://s1.api.pubstud.io
ENV VITE_API_HOST=$VITE_API_HOST
ARG VITE_SITE_FORMAT_VERSION=0.1
ENV VITE_SITE_FORMAT_VERSION=$VITE_SITE_FORMAT_VERSION
ARG VITE_S3_SITE_ASSETS_URL=https://site-assets.pubstudioassets.com
ENV VITE_S3_SITE_ASSETS_URL=$VITE_S3_SITE_ASSETS_URL
ARG VITE_S3_TEMPLATE_PREVIEWS_URL=https://template-previews.pubstudioassets.com
ENV VITE_S3_TEMPLATE_PREVIEWS_URL=$VITE_S3_TEMPLATE_PREVIEWS_URL
RUN pnpm run build:builder-demo

# PRODUCTION BUILDER DEMO APP IMAGE
# ------------------------------------------------------------------------------------
FROM base as prod
COPY --from=build.prod --chown=app:app /usr/src/dist/apps/builder-demo /usr/share/nginx/html
COPY --from=build.prod --chown=app:app /usr/src/nginx/nginx.conf /etc/nginx/
COPY --from=build.prod --chown=app:app /usr/src/nginx/conf.d /etc/nginx/conf.d

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "exec nginx -g 'daemon off;'"]
