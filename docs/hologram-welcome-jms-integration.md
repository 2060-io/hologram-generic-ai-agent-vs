# Hologram-Welcome JMS integration Module

## Overview

The Hologram-Welcome implement JMS integration Module integration includes a statistics (stats) module that communicates via JMS (Java Message Service) to send and receive agent metrics and events. This module is designed to work with brokers like Apache ActiveMQ Artemis.

## How It Works

When enabled, the stats module connects to a JMS broker (such as Artemis) and subscribes to a specific queue where VS Agent publishes real-time metrics. Your NestJS application listens to these metrics through the configured event handler, enabling features like live monitoring, analytics, or audit logging.

## Required Environment Variables

| Variable Name             | Description                                                                    | Example Value / Default |
| ------------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| `VS_AGENT_STATS_ENABLED`  | Enables (`true`) or disables (`false`) the stats module and its JMS connection | `true`                  |
| `VS_AGENT_STATS_HOST`     | Hostname or IP address of your JMS broker (e.g., Artemis)                      | `localhost`             |
| `VS_AGENT_STATS_PORT`     | Port number where the JMS broker is listening                                  | `61616`                 |
| `VS_AGENT_STATS_QUEUE`    | The JMS queue name where stats are published                                   | `stats.queue`           |
| `VS_AGENT_STATS_USER`     | Username for authenticating with the JMS broker                                | `artemis`               |
| `VS_AGENT_STATS_PASSWORD` | Password for authenticating with the JMS broker                                | `artemis`               |

In the app.module setup, use these values to configure the stats module:

```typescript
import { ConfigService } from '@nestjs/config'

EventsModule.register({
  modules: {
    messages: true,
    connections: true,
    stats: process.env.VS_AGENT_STATS_ENABLED === 'true',
  },
  options: {
    statOptions: {
      host: process.env.VS_AGENT_STATS_HOST,
      port: Number(process.env.VS_AGENT_STATS_PORT),
      queue: process.env.VS_AGENT_STATS_QUEUE,
      username: process.env.VS_AGENT_STATS_USER,
      password: process.env.VS_AGENT_STATS_PASSWORD,
      reconnectLimit: 10,
      threads: 2,
      delay: 1000,
    },
    eventHandler: CoreService,
    url: process.env.SERVICE_AGENT_ADMIN_URL,
    imports: [ChatbotModule],
  },
})
```

> **Tip:** Always convert the stats enabled flag to boolean (`process.env.VS_AGENT_STATS_ENABLED === 'true'`).
