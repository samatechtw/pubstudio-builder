# Pubstudio Site API

The Site API is written in Rust, and is not managed by Nx. Use the instructions below to install and run.

## Prerequisites

**Install Rust**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Generate Auth Keys

When testing or developing locally, you can use the [below test keys](#test-keys). When running a public Site API server, you must generate your own RS256 key pair:

```bash
# Generate private key (don't add passphrase)
ssh-keygen -t rsa -b 4096 -m PEM -f RS256.key
# Write public key to file
openssl rsa -in RS256.key -pubout -outform PEM -out RS256.key.pub
# Display base64 encoded private key
cat RS256.key | base64
# Display base64 encoded public key
cat RS256.key.pub | base64
```

## Environment setup

In development, the backend is built on the host with Cargo. Binaries are cross-compiled and copied into the development cluster. Some tools are needed to achieve this.

### Environment Variables

Environment variables are used to configure the `site-api` deployment. See the `.env` file in this directory for defaults. When running the docker image, all variables must be provided.

Name                    | Description
----------------------- | ----------------------------
EXEC_ENV                | Execution environment: dev, ci, stg, prod
DATABASE_URL            | URL of the site metadata SQLite database
SITE_API_HOST           | API host address
SITE_API_PORT           | Port the API listens on
SITE_ADMIN_PUBLIC_KEY   | Public key for authorizing Admin/Owner requests
S3_URL                  | Optional URL for S3 object storage
S3_ACCESS_KEY_ID        | Optional key ID for signing S3 requests
S3_SECRET_ACCESS_KEY    | Optional secret key for signing S3 requests

## Run

```bash
# Debug mode
cargo run

# Release mode
cargo run --release

# Verify API is available
curl http://127.0.0.1:3100/api/healthz
```

## Build

```bash
cargo build --release
```

**Docker**

> :warning: If you plan to expose the Site API to the public, replace `SITE_ADMIN_PUBLIC_KEY` with one generated following the above instructions.

```bash
docker build -t site-api -f backend/site-api/Dockerfile --target=dev  .

docker run -p 3100:3100 \
  -e EXEC_ENV='ci' \
  -e DATABASE_URL='sqlite:site-api/db/metadata/sites_metadata.db' \
  -e SITE_API_HOST='0.0.0.0' \
  -e SITE_API_PORT='3100' \
  -e S3_URL='https://da7c8f85bc450afcae564b1d7ae16d4e.r2.cloudflarestorage.com' \
  -e S3_ACCESS_KEY_ID='866e86eed58870d56aa4312f894a73cc' \
  -e S3_SECRET_ACCESS_KEY='dev' \
  -e SITE_ADMIN_PUBLIC_KEY='LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUF6Mis4bklTVmpubmFqNXlCVkRObgo4amhRVVFOeUlLYTUyUEIraG5DSWVCYVFaaHJVVkRWRXJESWU0MEx5ekF1WmRwaWNUY0RUSTRwTjE5RFZtQjcyClNpMXlDYldpTHp5azduUkMrVlVUNllvbXE1YWlCRG8rMDZ2dUVpbmZmTmhlODMwY0RCRGd1OC9XcWliTi92M2kKeDdiNkhkWGczSHNNSFRHRjVFM3dEU005ZTdzTzVJWCt0eTFsV3lRb1EydmZ6SDRxbkZJVmM2Z3lCRkE1Wmk0cwptSnQ2bkFsTnZrVHNYYzdhb3ZRYlArY1VrM2dmWFgyZjU2U0RrVDBMM3VLUDdiTDNaWERiRGNzTm5zbGxwR1F5Cms4Q3JwK0ZLZzgzUjV2bzg0Z3hFVCtROVA3amtEVS9XZUFPZmxNZm1idnc4aUNrRFQ0TnI3RGM2d2FWanZ2V3AKYUJsOEFzaEhHbURjZURLZ2NPRFk4WWVGREZGMENzbEtSTWFya20velU0ZjZrQ0Vza3hNRy9ZUE9ucXpoL1B6bAphUlJHekpDakFWZDU1ejJYdHZWUTROUnB3eGtLMk1NQlNYS1BuQ3Fnd3JsUWlPazBYeVhjVHhKcmZBc2hldDV0Cm9selZKdklkU3RieG02dUlBUmI4cUlVZG1HVVRLdEVaV3BTUzdBVitneUVZQ1pJVER2amNlZUs5bmFjaTF3Y04KM1hvV3RzZDZPMzJxc1BRcjc0dzU2R2xvbC96OFVhZjM5Z2hNUjFiajdYa0FST0E0NzNyWlcwMVJQcFdrQjZ4KwpTeUFqRms1YTc2aCtsRjlKWVhOR3p3TFk5dytlVUZNRjB5MEVOOGNWNFhVOXRod1ZweU1EZHpwVjlxeVJ2SC9SClN2dURKVFBzbUF4WnBNUSs5cFJId3FjQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==' \
  site-api
```

## Usage

Runs on port 3100 by default.

A [requests.http](./requests.http) file is provided that makes it easy to test the API. Install the VSCode extension "REST Client" to send the requests.

TODO -- complete Site API endpoint documentation.

```bash
# Create
curl 'http://localhost:3100/api/sites' \
  -H 'content-type: application/json' \
  --data-raw '{"name":"Test Site","data":"{\\\"some\\\":\\\"stringified_json\\\"}"}'

# Get
curl 'http://localhost:3100/api/sites/1'

# List
curl 'http://localhost:3100/api/sites'

# Update
curl 'http://localhost:3100/api/sites/1' \
  -H 'content-type: application/json' \
  -X PATCH \
  --data-raw '{"name":"New Name", "data":"{\"some\":\"new_data\"}"}'

```

### Updating

Updating a deployed `site-api` can be done manually, or automatically via [Watchtower](https://containrrr.dev/watchtower/usage-overview/).

## Test Keys

**RS256 Public key**
> LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUF6Mis4bklTVmpubmFqNXlCVkRObgo4amhRVVFOeUlLYTUyUEIraG5DSWVCYVFaaHJVVkRWRXJESWU0MEx5ekF1WmRwaWNUY0RUSTRwTjE5RFZtQjcyClNpMXlDYldpTHp5azduUkMrVlVUNllvbXE1YWlCRG8rMDZ2dUVpbmZmTmhlODMwY0RCRGd1OC9XcWliTi92M2kKeDdiNkhkWGczSHNNSFRHRjVFM3dEU005ZTdzTzVJWCt0eTFsV3lRb1EydmZ6SDRxbkZJVmM2Z3lCRkE1Wmk0cwptSnQ2bkFsTnZrVHNYYzdhb3ZRYlArY1VrM2dmWFgyZjU2U0RrVDBMM3VLUDdiTDNaWERiRGNzTm5zbGxwR1F5Cms4Q3JwK0ZLZzgzUjV2bzg0Z3hFVCtROVA3amtEVS9XZUFPZmxNZm1idnc4aUNrRFQ0TnI3RGM2d2FWanZ2V3AKYUJsOEFzaEhHbURjZURLZ2NPRFk4WWVGREZGMENzbEtSTWFya20velU0ZjZrQ0Vza3hNRy9ZUE9ucXpoL1B6bAphUlJHekpDakFWZDU1ejJYdHZWUTROUnB3eGtLMk1NQlNYS1BuQ3Fnd3JsUWlPazBYeVhjVHhKcmZBc2hldDV0Cm9selZKdklkU3RieG02dUlBUmI4cUlVZG1HVVRLdEVaV3BTUzdBVitneUVZQ1pJVER2amNlZUs5bmFjaTF3Y04KM1hvV3RzZDZPMzJxc1BRcjc0dzU2R2xvbC96OFVhZjM5Z2hNUjFiajdYa0FST0E0NzNyWlcwMVJQcFdrQjZ4KwpTeUFqRms1YTc2aCtsRjlKWVhOR3p3TFk5dytlVUZNRjB5MEVOOGNWNFhVOXRod1ZweU1EZHpwVjlxeVJ2SC9SClN2dURKVFBzbUF4WnBNUSs5cFJId3FjQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==

**RS256 Private key**
> LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlKS0FJQkFBS0NBZ0VBejIrOG5JU1Zqbm5hajV5QlZETm44amhRVVFOeUlLYTUyUEIraG5DSWVCYVFaaHJVClZEVkVyREllNDBMeXpBdVpkcGljVGNEVEk0cE4xOURWbUI3MlNpMXlDYldpTHp5azduUkMrVlVUNllvbXE1YWkKQkRvKzA2dnVFaW5mZk5oZTgzMGNEQkRndTgvV3FpYk4vdjNpeDdiNkhkWGczSHNNSFRHRjVFM3dEU005ZTdzTwo1SVgrdHkxbFd5UW9RMnZmekg0cW5GSVZjNmd5QkZBNVppNHNtSnQ2bkFsTnZrVHNYYzdhb3ZRYlArY1VrM2dmClhYMmY1NlNEa1QwTDN1S1A3YkwzWlhEYkRjc05uc2xscEdReWs4Q3JwK0ZLZzgzUjV2bzg0Z3hFVCtROVA3amsKRFUvV2VBT2ZsTWZtYnZ3OGlDa0RUNE5yN0RjNndhVmp2dldwYUJsOEFzaEhHbURjZURLZ2NPRFk4WWVGREZGMApDc2xLUk1hcmttL3pVNGY2a0NFc2t4TUcvWVBPbnF6aC9QemxhUlJHekpDakFWZDU1ejJYdHZWUTROUnB3eGtLCjJNTUJTWEtQbkNxZ3dybFFpT2swWHlYY1R4SnJmQXNoZXQ1dG9selZKdklkU3RieG02dUlBUmI4cUlVZG1HVVQKS3RFWldwU1M3QVYrZ3lFWUNaSVREdmpjZWVLOW5hY2kxd2NOM1hvV3RzZDZPMzJxc1BRcjc0dzU2R2xvbC96OApVYWYzOWdoTVIxYmo3WGtBUk9BNDczclpXMDFSUHBXa0I2eCtTeUFqRms1YTc2aCtsRjlKWVhOR3p3TFk5dytlClVGTUYweTBFTjhjVjRYVTl0aHdWcHlNRGR6cFY5cXlSdkgvUlN2dURKVFBzbUF4WnBNUSs5cFJId3FjQ0F3RUEKQVFLQ0FnQnNIcEpSaG0ycGNHdng5S0lZTUI4YXlpMWF2SkFNNHJuMWtBeHlxRThKUU1HTTVxa0xKeVNmR0JTdgpZYUxKcGJZY2NaanVrZlc3RFloYlY3Y3M3ZDV6ZFZKK0t4VFl5Q1F6UVpmeSsxeEFtc2hqSVVWYkxMeTRlV0hDClI5Nzc1STlCSEZHMUhFcjJ1WExyQndUUnhxVWdjWWZXYXpjajFHTFJDSklBR0h0cGJaZkxXUWwvSlRSSlo3anYKazE0RkhrSHRCVW5TWnBwVnlUSWd1MnZmald1ak0wN3A2NU9BKzgyemEzRGNCSjM3WmNkOHdkeWZUeTQ4ZjZ3dgoxSURPY0lxU1czakZmOWc5VFR2UktxbjIwRjdvVWtGbVpIQUJXUkx4OERZeG9ERXU3d2pab05ZRTlqc1VITmRkCnBmKytrMnc5a0Jyd285QnBzN1BGWVI0blYwWXZVdlBpSXBMb3NuaTZTR2NYbGZZZjE3c2puVmtXbmQzMmYxT24KS0d5bkZNbllncTZ3aDkzSUMxVXNVeFhKQWg2Z2lVWjV5eGM5UXNVZGJTMHZRV1d4UEg4cy9WRHZpRUpGNGdBSwpGRzBFeDZCZmttL0VIWldyYXJ4ZS9zTGJCMHd4cXF0WWdNRGo0Q3I2bmFyaWdoQS9JdXJuclNXZzlHbTVRcENLCmg5dE8yS2RUZTRpSWNOd3BVNkhNMTVhU1hVK2JXQjJobzRnei9zRG10UmdHQ0ludkc0UHIwRmlGS0hKWGR1cHAKRjluQ0JZaHZCWWNqK2dsWllhTGhvSmRXRHh3UUxoSFBERzBObjQvNGtDTkhLd1ZFK05xSERMeTVPM2NOWTlESgpVSkthaVV5ZUE5b09PbE9iWFFyU3pqaDc2SldidVRzdVNqNFFoWnFRdzNzMEhBS1RDUUtDQVFFQTZQN29sanQyCk50RkMxN1J1NFcrOGN6RTZqb1NIaFhnckJDRzVic3dYRjdpZlZyTzM5d0Iza0RzTmtNSlJkVzJibVVGRUcwdGMKaVFXcWgwaFNoeTBUeWREZHlVNythUzV2a2RVOU45ZElhYXh2OU0veVRZeFRjeHVrTVFKOFllYmJiMk96TFB2MwoxUktMSC91eEw3MzBoWlExU3RIdmhDNVUrMGRaRkNnaTlQdThQRE5Qdks3NXFBaWVxODRBRmtGNzB3NGNJcHZlCnpIWTFnRjcySDJFY3hvUmt3U01KN1cyZGQvM2ZQQ2FxUXROMHlDUHptZGxQSnVSbkMxdVUxRUlzb0ZvQ2swTUEKdEViN3dPN2dhY2NubDBWUTlMdllFWEUzVlZKcG9YT2ZzYmJ5Z0FUM2kvakFzOStqNVJ0WHNwWG9YNjl6d05zbAprSEJuL1AwMTlTcU5YUUtDQVFFQTQrck4zcFNWY1VSY3ZwdndKemtqMUJYN0ZPMFpqcWV6eUN4UWVxVlZIVGgzCktURWVSUkhjNW5Xc3BHaHN0R0pxbEFINjdqZitFSFJBTEIvY0hHSmI4VWtqRjJCeC8zVkNxWGovT0NsZnhyWFgKdDdjaTV5Y2plMWNzdDV4UzdKNDJVeVJBWVdSb3ViMDZyRy9tVU1vM2VtUTMxbExYdHd4VVM0TS91T25kODFUNwpINUhaekxXa1lqbE9NNmZzS0hXUDA4d3huOCtqb2xvWnVkS1NWKzRxSHpOQmRxMVFnVHdaRTdhaGR1Qkt5ekp6CnRDNU50MDU4NDArb0xCZ1hFTG40UnVOcFVKRmRQbkhFT0UrN2U4RWp5Y3kyTDVuTUVISUFPUnJnRWlKVHgreXAKb1hJVEZ2NlBPRTFVai82WWFqUiszUmlYcW1zN1FNZW5CS0xNemtkTDB3S0NBUUJFM1NLTlZLSEo3ZXVkcVh5awpNTXc0RjdMQThMYkZZaEVFdFpzQy9sdE03WXBhcTkrUnA1ZXZEMlVoQmUzaGtUWE9CQlpISXUwRXFxSU9QZmYyCmNBSkxRZXByVjJlbVdzMHJBeVdHM2FCUGEySGpyNXBrQlRlYzYreUpkN3lmaXdZTVZDRmZDRkhscmdka3VwVlMKRVFpMmVtbU41YUt2SktxRllqOFgwQTBVNzFwaFNLRW1tV2k4bTErYVU5Wit2WGdGbDBRRmpxQTVPaTd4OUI4MgpneE5vTVRVK1NFYmszK01NMWdJbTJ4NnpoYUFjajFPdWd5WDd6c0lOLzFGcnN1dFJzWWpWVVpaaHNpRXlrdWZOCkc4bTkwZ1R0Y0orWitDWnNsMkVWRVFHQUd4eHRiZ3BrV205S09xMU1SOXFScy9Ec1p3VUZXVUF2QXFvWmdoVnkKa3RNWkFvSUJBQW4xeU9saE5PYXVSaDlPVVVCbGp0dEYycU1mZVc1eWhiakp0dnFsSHdNWDVKMDRPRXBzYldyawoyWmFWdWFwb1lwLzFOaklTNEZkM3ZSWXdqajN2VG5WTTdPdW9tMUsrblJzcTNueGwwbm1zbUxDK29CZlo3Z01GCjNENXA1blhRdEM4TjlvSkxFUWlNN0hOOHNHUDNjbFUyNi9uQnhRdUt6bVErYUJwOG5lWjBZRVVRNnFPM2pHZCsKZVp4b1NqbTZhWDZuL2NNdUg4aUloM2RIYkgzTE9xd0NZV24rU1BaYzJmdXlqM3ZTY1hKUDBoNmRwMmZMVmtuWQp3VkNyL05ZT1NudE9sTnVnZnFLcjloYy81TUdUdnl5aWRaTys5TndESDE5ZmZVdE5sTHUzNi9IU09tTlczSXRwClZiaTFONVBzbDE2eUpHNmVJUWpEc05qVEJJQS9QV0VDZ2dFQkFOczFhS0hxZy80MGwwYTI0dWdXMS9jNlRzZFcKQTZaVitla2hSdGNaMUI4RUk5MFBXUnRmUytyOG5yYnBMb3ZKMEN4bEY3TGdXUDVFSnFwek5ZclFrSlVSMkV0ZwpuNjhwdjlxcEswL0NDSWhPUFdXajU0M2JDLytJNDRaM1RERjhyR0cwR3pyUzBISkxFR0U4d3RXVE5RWFNnMmI0CjZ2Z3Ztc0lML0hVYmkzOUx0QXN2NVg0bkZ5eEYwcVc0eFlnamN6WXppQzVON0Q1cXVPMFlKc0FmbDNoWmZ3QUYKb2E2Y3JCTnM4OHZwelFaK0t2MGprMlNzQmdyc3hCN1EwTkg0MzEvajJYWXpBMXBxMGxVKzNicTFjWDJ6SnNTdgpFeDBtVnltejhHTlUvRDIxYStzVkFKMTdsQ091ZzdJS0RWbklNZWR4U2oyQXdaSTBxZUNVRnpZWmI0WT0KLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0=
