<div align="center">
  <img src="apps/web/public/brand/kurvo-logo.png" alt="Kurvo Logo" width="160" />
  <h1>Kurvo</h1>
  <p><strong>The Premium Open-Source Video Editor for Modern Creators.</strong></p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MIT-gray?style=for-the-badge" alt="License" />
  </div>

  <br />

  <p>
    <a href="https://kurvo.app"><strong>Live Demo</strong></a> •
    <a href="#getting-started"><strong>Documentation</strong></a> •
    <a href="https://github.com/SQADIRKVM/kurvo-editor"><strong>GitHub</strong></a> •
    <a href="https://discord.gg/kurvo"><strong>Community</strong></a>
  </p>
</div>

---

## ⚡ Why Kurvo?

Kurvo is an extraordinary, AI-powered video editing platform designed to give professional creators absolute freedom and performance.

| 🛡️ Privacy First | 🤖 AI Intelligence | 🚀 Pro Performance |
| :--- | :--- | :--- |
| Your creative assets stay on your device - always. Zero cloud tracking. | Autonomous tools for splitting, captioning, and enhancing content instantly. | Hardware-accelerated transitions and high-FPS real-time preview. |

---

## ✨ Features

- **🎬 Cinematic Timeline**: Multi-track editing with pixel-perfect precision and fluid scrubbing.
- **🪄 Kurvo Intelligence**: Real-time content awareness and automated editing shortcuts.
- **💎 Visual Excellence**: Premium transitions, professional color grading, and aura effects.
- **🔓 Total Freedom**: No watermarks, no subscriptions, and 100% transparent open-source code.
- **📊 Minimal Analytics**: Powered by [Databuddy](https://www.databuddy.cc), completely anonymized.

---

## 🏗️ Project Structure

```text
├── apps/web/           # Main Next.js web application
├── src/components/     # Docked Pro UI & Editor components
├── src/hooks/          # Custom React logic & AI bridges
├── src/lib/            # Core FFmpeg engine & utilities
├── src/stores/         # state management (Zustand)
└── packages/           # Internal shared modules (@kurvo/ui, @kurvo/env)
```

---

## 🚀 Getting Started

### Prerequisites
- [Bun Runtime](https://bun.sh)
- [Docker Desktop](https://www.docker.com) (Optional but recommended for DB/Redis)

### Local Setup

1. **Clone & Environment**
   ```bash
   git clone https://github.com/SQADIRKVM/kurvo-editor.git
   cd kurvo-editor
   cp apps/web/.env.example apps/web/.env.local
   ```

2. **Spin up Infrastructure**
   ```bash
   docker compose up -d db redis serverless-redis-http
   ```

3. **Install & Launch**
   ```bash
   bun install
   bun dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to start creating.

---

## 🤝 Contributing

We welcome contributions! We're building the future of creative tools together.

**🎯 Current Focus:** Timeline optimization, new AI effects, and advanced audio processing.

---

## 📜 Credits

**Kurvo is proudly built on top of the foundational [OpenCut](https://github.com/opencut-app/opencut) project.**

We are grateful to the original OpenCut authors for the core architecture. This version introduces the **Pro UI Shell**, **Kurvo Intelligence**, and extensive performance optimizations for a premium experience.

---

<div align="center">
  <p>Built with ❤️ by the Kurvo Community</p>
  <img src="apps/web/public/brand/kurvo-logo.png" alt="Kurvo Footer" width="40" />
</div>
