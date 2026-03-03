# NXT FTSO Value Provider

This is a sample implementation of an FTSOv2 feed value provider that serves values for requested feed IDs. By default, it uses [CCXT](https://ccxt.readthedocs.io/) to fetch the latest values from supported exchanges. Alternatively, it can be configured to provide fixed or random values for testing purposes.

## Configuration

The provider behavior can be adjusted via the `VALUE_PROVIDER_IMPL` environment variable:
- `fixed`: returns a fixed value.
- `random`: returns random values.
- Leave blank to use the default CCXT-based values.

**Exchange API credentials (optional)**  
If you set `BYBIT_API_KEY` / `BYBIT_API_SECRET` (and similarly for `COINCHECK_*`, `GMOCOIN_*`), the provider uses authenticated requests for those exchanges (better rate limits, useful as fallback). **Do not bake secrets into the image.** Build the image without secrets; at **run** time pass env from a local `.env` file:

```bash
docker run --rm -it -p 3101:3101 --env-file .env nxt-ftso-vp
```

Keep `.env` only on your machine or in AWS Secrets Manager; it is listed in `.gitignore`.

## Build and test the image

**1. Build the image** (from the project root):

```bash
cd ftso-v2-example-value-provider
docker build -t nxt-ftso-vp .
```

**2. Run the container** (service listens on port 3101):

```bash
docker run --rm -it -p 3101:3101 nxt-ftso-vp
```

Wait until the log shows `Nest application successfully started` and `available on PORT: 3101`.

**3. Test the API** (in another terminal):

- **With voting round** (Scaling):

```bash
curl -s -X POST http://localhost:3101/feed-values/0 \
  -H 'Content-Type: application/json' \
  -d '{"feeds":[{"category":1,"name":"BTC/USD"}]}'
```

- **Without voting round** (Fast Updates). Use the path with a trailing slash:

```bash
curl -s -X POST http://localhost:3101/feed-values/ \
  -H 'Content-Type: application/json' \
  -d '{"feeds":[{"category":1,"name":"BTC/USD"}]}'
```

- **Swagger UI**: open http://localhost:3101/api-doc in a browser to try the endpoints interactively.

**4. Quick test with fixed values** (no exchange connection needed):

```bash
docker run --rm -it -p 3101:3101 -e VALUE_PROVIDER_IMPL=fixed nxt-ftso-vp
```

Then run the same `curl` commands above; responses will contain the fixed value (e.g. `0.01`) for all requested feeds.

**5. Copy-paste test commands** (after container is running):

```bash
# With voting round (Scaling)
curl -s -X POST http://localhost:3101/feed-values/0 -H 'Content-Type: application/json' -d '{"feeds":[{"category":1,"name":"BTC/USD"}]}'

# Without voting round (Fast Updates)
curl -s -X POST http://localhost:3101/feed-values/ -H 'Content-Type: application/json' -d '{"feeds":[{"category":1,"name":"BTC/USD"}]}'
```

---

## Starting the Provider

To start the provider using the pre-built image from the registry:

```bash
docker run --rm -it --publish "0.0.0.0:3101:3101" ghcr.io/flare-foundation/ftso-v2-example-value-provider
```

This will start the service on port `3101`. You can find the API spec at: http://localhost:3101/api-doc.

## Obtaining Feed Values

The provider exposes two API endpoints for retrieving feed values:

1. **`/feed-values/<votingRound>`**: Retrieves feed values for a specified voting round. Used by FTSOv2 Scaling clients.
2. **`/feed-values/`**: Retrieves the latest feed values without a specific voting round ID. Used by FTSOv2 Fast Updates clients.

> **Note**: In this implementation, both endpoints return the same data, which is the latest feed values available.

### Usage

#### Fetching Feed Values with a Voting Round ID

Use the endpoint `/feed-values/<votingRound>` to obtain values for a specific voting round.

```bash
curl -X 'POST' \
  'http://localhost:3101/feed-values/0' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "feeds": [
    { "category": 1, "name" : "BTC/USD" }
  ]
}'
```

**Example Response:**

```json
{
  "votingRoundId": 0,
  "data": [
    { "feed": { "category": 1, "name": "BTC/USD" }, "value": 71287.34508311428 }
  ]
}
```

#### Fetching Latest Feed Values (Without Voting Round ID)

Use the endpoint `/feed-values/` to get the most recent feed values without specifying a voting round.

```bash
curl -X 'POST' \
  'http://localhost:3101/feed-values/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "feeds": [
    { "category": 1, "name" : "BTC/USD" }
  ]
}'
```

**Example Response:**

```json
{
  "data": [
    { "feed": { "category": 1, "name": "BTC/USD" }, "value": 71285.74004472858 }
  ]
}
```