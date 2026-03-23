<table width="100%">
  <tr>
    <td align="left" width="120">
      <img src="apps/web/public/brand/kurvo-logo.png" alt="Kurvo Logo" width="100" />
    </td>
    <td align="right">
      <h1>Kurvo</span></h1>
      <h3 style="margin-top: -10px;">An extraordinary, AI-powered video editor for professional creators.</h3>
    </td>
  </tr>
</table>

## Why Kurvo?

- **Privacy First**: Your creative assets stay on your device - always.
- **AI Intelligence**: Autonomous tools for splitting, captioning, and enhancing content.
- **Professional Standard**: A high-fidelity, open-source alternative designed for the modern web.
- **Zero Friction**: No watermarks, no subscriptions, no forced logic.

## Features

- **Cinematic Timeline**: Multi-track editing with pixel-perfect precision.
- **AI Magic**: Real-time content awareness and automated editing shortcuts.
- **Pro Performance**: Hardware-accelerated transitions and high-FPS preview.
- **Total Freedom**: Transparent, open-source code for the creative community.
- **Analytics**: Powered by [Databuddy](https://www.databuddy.cc), 100% Anonymized & Non-invasive.

## Project Structure

- `apps/web/` – Main Next.js web application
- `src/components/` – UI and editor components
- `src/hooks/` – Custom React hooks
- `src/lib/` – Utility and API logic
- `src/stores/` – State management (Zustand, etc.)
- `src/types/` – TypeScript types

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/docs/installation)
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

> **Note:** Docker is optional but recommended for running the local database and Redis. If you only want to work on frontend features, you can skip it.

### Setup

1. Clone the repository

2. Copy the environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Start the infrastructure:
   ```bash
   docker compose up -d db redis serverless-redis-http
   ```

4. Install and Start:
   ```bash
   bun install
   bun dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Contributing

We welcome contributions! We're actively developing the next generation of creative tools.

**🎯 Focus areas:** Timeline performance, AI integrations, professional color grading, and advanced transition effects.

## Credits

**Kurvo is proudly built on top of the [OpenCut](https://github.com/opencut-app/opencut) project.**

We are deeply grateful to the original OpenCut authors and contributors for providing the foundational architecture that made Kurvo possible. This version includes extensive UI/UX modifications, performance optimizations, and new AI-driven features.

Original sponsors included:
- [Vercel](https://vercel.com)
- [fal.ai](https://fal.ai)

## License

[MIT LICENSE](LICENSE)

---

![Kurvo Banner](apps/web/public/brand/kurvo-logo.png)
