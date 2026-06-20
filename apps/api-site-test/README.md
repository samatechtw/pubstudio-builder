# PutStudio Site API Integration Tests

An app for running integration tests against the Site API.

Managed by Nx.

## Testing

```sh
# Run API request tests
npx nx req-test api-site-test

# Run a single test (positional arg is a Vitest path filter)
npx nx req-test api-site-test -- smoke/health-check
```
