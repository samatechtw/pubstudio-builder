# PubStudio Builder Demo

A very simple integration of `@pubstudio/editor`, `@pubstudio/renderer` that relies on `pubstudio-site-api` for site persistence.

#### Prerequisites

- Install [PNPM](https://pnpm.io/)

#### Setup

```bash
# Install packages
pnpm i
```

## Run

```bash
# Dev server with hot-reloading
npx nx serve builder-demo

# Build for production/preview
npx nx build builder-demo

# Preview server, requires rebuild to see changes
npx nx preview builder-demo
```

### Environment

Configuration is provided from the environment, in development mode defaults are read in from `.env.development`

| Name                     | Description                               |
| ------------------------ | ----------------------------------------- |
| EXEC_ENV                 | Execution environment: dev, ci, stg, prod |
| VITE_SITE_FORMAT_VERSION | Site data format version                  |

**Docker**

Note: Dockerfile is not set up for hot reload.

```bash
docker build -t builder-demo -f apps/builder-demo/Dockerfile --target=dev .

docker run -p 8080:80 builder-demo
```
