# Collaboration transport

The builder submits idempotent command batches over HTTP and receives committed
operations over an authenticated WebSocket. HTTP operation reads are retained for
visibility checks, write reconciliation, and recovery from revision gaps.

`backend/lib-shared-site-api/src/collaboration` controls sockets, room subscriptions, catch-up
validation, and HTTP replay errors. Each API supplies its own authorization and database queries.
The replay crate contains wire types and deterministic command replay (no Tokio dependency).

The client sends its token in the first socket message. The server subscribes before reading
the durable log and deduplicates queued events by revision. Catch-up reads use a consistent
database transaction. Missing, compacted, or truncated operation ranges trigger a snapshot
reset before partial operations are sent. Socket writes time out after ten seconds.

Fan-out is process-local. A hosted site's SQLite database pins it to one Site API
instance. Heartbeats reconcile the durable log every 25 seconds so a missed
notification does not leave a client permanently stale. Immediate fan-out across
multiple Platform API replicas would require a shared event broker.

Shared integration contract and socket test helpers are in `libs/shared/util-test-collaboration`.
The hosted and platform test entry points supply only URLs, authentication, and reset
configuration. Run sequentially: the platform reset helper also resets the hosted Site APIs.

From the builder repository:

```sh
pnpm exec nx test frontend-feature-site-store-init
(cd apps/api-site-test && ../../node_modules/.bin/vitest run test/integration/collaboration.spec.ts)
cd backend
cargo test -p lib-shared-site-api collaboration
```

Alternatively, run `vitest run test/integration/collaboration.spec.ts` from
`apps/api-site-test`. In the platform repository, run
`vitest run test/integration/local-site/collaboration.spec.ts` from
`apps/api-platform-test`.
