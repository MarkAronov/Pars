# messaging-nats

Standalone NATS + JetStream infra — the modern, lightweight alternative to the
`messaging-kafka/` stack. Infra + demo scripts only; nothing in either backend currently depends
on messaging.

JetStream (durable streaming) is enabled via the `-js` flag, giving NATS both plain pub/sub
(`pubsub-demo.ts`) and Kafka-like durable/replayable streams (`jetstream-demo.ts`) in one
lightweight server — the unified alternative to running Kafka + RabbitMQ + Redis separately.

## Usage

```bash
docker compose up -d
docker compose ps        # wait for nats healthy

bun install               # installs demo-script dependencies (standalone, not part of the root workspace)
bun run demo:pubsub       # fire-and-forget pub/sub round trip
bun run demo:jetstream    # durable stream: publish, consume, ack
```
