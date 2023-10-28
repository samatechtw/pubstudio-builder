<h2 align='center'>PubStudio Builder</h2>

<p align='center'>Page editor, renderer, and backend that powers https://pubstud.io</p>

<p align='center'>
<a href='https://www.npmjs.com/package/@samatech/pubstudio-editor'>
  <img src='https://img.shields.io/npm/v/@samatech/pubstudio-editor?color=222&style=flat-square'>
</a>
</p>

<br>

## Apps

- [site-api](backend/site-api) - Basic REST API for persisting site data. Supports multiple sites, versioning, automated backups, and usage tracking.
- [builder-demo](apps/builder-demo) - Vue app that demonstrates editor functionality. It can be used as a basic standalone site builder, but the main purpose is to provide a usage example for `@pubstudio/editor`.
- [web-site](apps/web-site) - Barebones app that retrieves site data from a source (e.g. the `site-api` backend) and renders it. Built as a single HTML file served by `site-api`.

## Documentation

- [Technical Notes](docs/tech-notes.md)
  - Technical design and terminology of the web builder and renderer
- [Site Data Format](docs/site-data-format.md)
- [Site Versioning](docs/versioning.md)
- [Renderer Specification](docs/renderer.md)
- [Text Editing](docs/text-editing.md)
- [Object Storage](docs/object-storage.md)
- [Site Api](site-api/Readme.md)

## Run in Docker

These instructions result in the backend running on port `3100`, and the demo frontend on port `8080`. Only the backend is necessary for serving sites. docker-compose can be used to bring up the services together, but we don't provide that here.

See the respective Readme files for setting [builder-demo](apps/builder-demo/Readme.md) and [site-api](backend/site-api/Readme.md) environment variables and building from source.

### Site API backend

> :warning: If you plan to expose the Site API to the public, replace `SITE_ADMIN_PUBLIC_KEY` with one generated following instructions in the `site-api` Readme

```bash
docker run -p 3100:3100 \
  -e EXEC_ENV='dev' \
  -e DATABASE_URL='sqlite:site-api/db/metadata/sites_metadata.db' \
  -e SITE_API_HOST='0.0.0.0' \
  -e SITE_API_PORT='3100' \
  -e S3_URL='https://da7c8f85bc450afcae564b1d7ae16d4e.r2.cloudflarestorage.com' \
  -e S3_ACCESS_KEY_ID='866e86eed58870d56aa4312f894a73cc' \
  -e S3_SECRET_ACCESS_KEY='dev' \
  -e SITE_ADMIN_PUBLIC_KEY='LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUF6Mis4bklTVmpubmFqNXlCVkRObgo4amhRVVFOeUlLYTUyUEIraG5DSWVCYVFaaHJVVkRWRXJESWU0MEx5ekF1WmRwaWNUY0RUSTRwTjE5RFZtQjcyClNpMXlDYldpTHp5azduUkMrVlVUNllvbXE1YWlCRG8rMDZ2dUVpbmZmTmhlODMwY0RCRGd1OC9XcWliTi92M2kKeDdiNkhkWGczSHNNSFRHRjVFM3dEU005ZTdzTzVJWCt0eTFsV3lRb1EydmZ6SDRxbkZJVmM2Z3lCRkE1Wmk0cwptSnQ2bkFsTnZrVHNYYzdhb3ZRYlArY1VrM2dmWFgyZjU2U0RrVDBMM3VLUDdiTDNaWERiRGNzTm5zbGxwR1F5Cms4Q3JwK0ZLZzgzUjV2bzg0Z3hFVCtROVA3amtEVS9XZUFPZmxNZm1idnc4aUNrRFQ0TnI3RGM2d2FWanZ2V3AKYUJsOEFzaEhHbURjZURLZ2NPRFk4WWVGREZGMENzbEtSTWFya20velU0ZjZrQ0Vza3hNRy9ZUE9ucXpoL1B6bAphUlJHekpDakFWZDU1ejJYdHZWUTROUnB3eGtLMk1NQlNYS1BuQ3Fnd3JsUWlPazBYeVhjVHhKcmZBc2hldDV0Cm9selZKdklkU3RieG02dUlBUmI4cUlVZG1HVVRLdEVaV3BTUzdBVitneUVZQ1pJVER2amNlZUs5bmFjaTF3Y04KM1hvV3RzZDZPMzJxc1BRcjc0dzU2R2xvbC96OFVhZjM5Z2hNUjFiajdYa0FST0E0NzNyWlcwMVJQcFdrQjZ4KwpTeUFqRms1YTc2aCtsRjlKWVhOR3p3TFk5dytlVUZNRjB5MEVOOGNWNFhVOXRod1ZweU1EZHpwVjlxeVJ2SC9SClN2dURKVFBzbUF4WnBNUSs5cFJId3FjQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==' \
  ghcr.io/samatechtw/pubstudio-builder/stg/site-api
```

### Builder demo frontend

```bash
docker run -p 8080:80 -e VITE_API_HOST='host.docker.internal:3100' ghcr.io/samatechtw/pubstudio-builder/stg/builder-demo
```

## Development

- [Contribution Guidelines](docs/contribution.md)
- [Commit Message](docs/commit-format.md)

Frontend, integration test, and E2E test apps are organized as an [Nx](https://github.com/nrwl/nx) monorepo. A custom plugin called [nx-vue3-vite](https://github.com/samatechtw/nx-vue3-vite/issues) is used for Vue3/Vite app support.

The Site API and backend libraries are a Cargo workspace in the `backend/` folder.
