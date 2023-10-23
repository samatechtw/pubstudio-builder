# PubStudio Frontend Renderer

This app provides a bare renderer that expects an API source to provide site data.

## Run

```bash
# Dev server with hot-reloading
npx nx serve web-site

# Build for production/preview
npx nx build web-site

# Preview server, requires rebuild to see changes
npx nx preview web-site
```

### Environment

Configuration is provided from the environment, in development mode defaults are read in from `.env.development`
