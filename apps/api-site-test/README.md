# PutStudio Site API Integration Tests

An app for running integration tests against the Site API.

Managed by Nx.

## Testing

```sh
# Run API request tests
npx nx req-test api-site-test

# Run a single test
npx nx req-test api-site-test --test-file apps/api-site-test/test/smoke/health-check.spec.ts
```
