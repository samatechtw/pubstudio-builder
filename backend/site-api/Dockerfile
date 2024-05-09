FROM debian:bookworm-slim as base
WORKDIR /usr/src/backend/site-api

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

# Add LABEL to set pre-update hook
LABEL com.centurylinklabs.watchtower.lifecycle.pre-update="../pre-update.sh"

FROM base as dev

RUN apt-get update -yq \
  && apt-get install -yq \
  pkg-config \
  openssl \
  libssl-dev \
  curl \
  procps \
  inotify-tools

COPY ./backend/site-api/Cargo.* ./
COPY ./backend/site-api/db/metadata/migrations/* ./db/metadata/migrations/
COPY ./backend/site-api/db/sites/migrations/* ./db/sites/migrations/
COPY ./backend/site-api/src ./src/
COPY ./backend/*.sh ../
RUN ../limit-workspace.sh ../Cargo.toml site-api lib-shared-site-api lib-shared-types
COPY ./backend/lib-shared-site-api ../lib-shared-site-api/
COPY ./backend/lib-shared-types ../lib-shared-types/
COPY ./dist/apps/web-site/index.html ./
# Make sure backup dir is available
RUN mkdir -p ./db/sites/backups
# Copy backup file for testing in dev/CI
COPY ./tools/test/backup_test_dev_ci.db ./db/sites/backups/

ARG EXEC_ENV
ENV EXEC_ENV=$EXEC_ENV
ARG PLATFORM_WEB_URL
ENV PLATFORM_WEB_URL=$PLATFORM_WEB_URL
ARG SITE_API_HOST
ENV SITE_API_HOST=$SITE_API_HOST
ARG SITE_API_PORT
ENV SITE_API_PORT=$SITE_API_PORT
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG SITE_ADMIN_PUBLIC_KEY
ENV SITE_ADMIN_PUBLIC_KEY=$SITE_ADMIN_PUBLIC_KEY
ARG S3_URL
ENV S3_URL=$S3_URL
ARG S3_ACCESS_KEY_ID
ENV S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ENV S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
ARG SENDGRID_API_KEY
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY

COPY ./backend/target/aarch64-unknown-linux-gnu/debug/libsite_api.* ../target/aarch64-unknown-linux-gnu/debug/
COPY ./backend/target/aarch64-unknown-linux-gnu/debug/site-api* ../target/aarch64-unknown-linux-gnu/debug/

ENTRYPOINT ["/tini", "--"]
CMD ["../run-docker.sh", "site-api"]

FROM debian:bookworm-slim as prod
WORKDIR /usr/src/backend/site-api

ARG TARGETPLATFORM
ARG PLATFORM_FOLDER=${TARGETPLATFORM}/

# Add LABEL to set pre-update hook
LABEL com.centurylinklabs.watchtower.lifecycle.pre-update="../pre-update.sh"

COPY --from=base /tini /tini
COPY --chmod=755 ./backend/target/${PLATFORM_FOLDER}release/site-api ./
COPY --chmod=755 ./dist/apps/web-site/index.html ./
COPY --chmod=755 ./backend/pre-update.sh ../
COPY ./backend/site-api/db/metadata/migrations/* ./db/metadata/migrations/
COPY ./backend/site-api/db/sites/migrations/* ./db/sites/migrations/
# Make sure backup dir is available
RUN mkdir -p ./db/sites/backups

ARG EXEC_ENV
ENV EXEC_ENV=$EXEC_ENV
ARG SITE_API_HOST
ENV SITE_API_HOST=$SITE_API_HOST
ARG SITE_API_PORT
ENV SITE_API_PORT=$SITE_API_PORT
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG SITE_ADMIN_PUBLIC_KEY
ENV SITE_ADMIN_PUBLIC_KEY=$SITE_ADMIN_PUBLIC_KEY
ARG S3_URL
ENV S3_URL=$S3_URL
ARG S3_ACCESS_KEY_ID
ENV S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ENV S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
ARG SENDGRID_API_KEY
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY

ENTRYPOINT ["/tini", "--"]
CMD ["./site-api"]

FROM prod as stg
WORKDIR /usr/src/backend/site-api

# Copy backup file for testing in dev/CI
COPY ./tools/test/backup_test_dev_ci.db ./db/sites/backups/
