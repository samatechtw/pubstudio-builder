# PubStudio Builder Demo

A very simple integration of `@pubstudio/editor`, `@pubstudio/renderer` that relies on `pubstudio-site-api` for site persistence.

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
