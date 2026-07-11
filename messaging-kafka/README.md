# messaging-kafka

Standalone Kafka (KRaft mode, no Zookeeper) + RabbitMQ + Redis/BullMQ infra — the "traditional/
heavier" messaging stack option, compared against `messaging-nats/`. Infra + demo scripts only;
nothing in either backend currently depends on messaging (confirmed zero references anywhere in
`backend-nestjs/src`).

Redis here provisions its **own standalone instance** (host port `6380`, not the default `6379`)
so it can run alongside a backend's own dev Redis without colliding — it demonstrates BullMQ
specifically, the standard Redis-backed job queue in the Node/Bun ecosystem, as the "task queue"
counterpart to RabbitMQ.

## Usage

```bash
docker compose up -d
docker compose ps        # wait for kafka, rabbitmq, redis all healthy

bun install              # installs demo-script dependencies (standalone, not part of the root workspace)
bun run demo:kafka       # produces + consumes one message via kafkajs
bun run demo:rabbitmq    # publishes + consumes one message via amqplib
bun run demo:bullmq      # enqueues + processes one job via bullmq
```

Each demo script round-trips a single message/job end-to-end and exits — proof the stack works,
not a long-running service.

## Why KRaft mode

Kafka 4.0 (2024) removed ZooKeeper support entirely; KRaft (Kafka's own Raft-based consensus) is
current professional deployment practice, unlike the old `backend/docker-compose.yml`'s
ZooKeeper-coupled setup this folder replaces.
