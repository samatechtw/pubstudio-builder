<h2 align='center'>PubStudio Builder</h2>

<p align='center'>Page editor, renderer, and backend that powers https://pubstud.io</p>

<p align='center'>
<a href='https://www.npmjs.com/package/@samatech/pubstudio-editor'>
  <img src='https://img.shields.io/npm/v/@samatech/pubstudio-editor?color=222&style=flat-square'>
</a>
</p>

<br>

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

See the environment section below for configuration.

**site-api backend**

```bash

```

**Builder demo frontend**

```bash

```

### Updating

Updating a deployed `site-api` can be done manually, or automatically via [Watchtower](https://containrrr.dev/watchtower/usage-overview/).

## Environment

Environment variables are used to configure the `site-api` deployment.

TODO

## Usage as Library

TODO

## Development

- [Contribution Guidelines](docs/contribution.md)
- [Commit Message](docs/commit-format.md)

This is an [Nx](https://github.com/nrwl/nx) monorepo, and a custom plugin called [nx-vue3-vite](https://github.com/samatechtw/nx-vue3-vite/issues) is used for Vue3/Vite app support.

#### Prerequisites

- Install [PNPM](https://pnpm.io/)

#### Setup

```bash
# Install packages
pnpm i
```

#### Run

Run locally

```bash
# Run site-api (backend)
$ npm run site-api
```

```bash
# Run example site editor in development mode
npx nx serve builder-demo
```

**Build**

```bash
# Build example site editor for production
npx nx build builder-demo
```
