# Project Robin: A Self-Evolving, Multi-Agent Framework

![Project Robin Banner](https://og.once-upon-a-product.com/PROJECT%20ROBIN/A%20Self-Evolving%2C%20Multi-Agent%20Framework.png?base_color=%230f172a&theme=dark&font_family=JetBrains%20Mono&padding=100&text_color=%2334d399&secondary_text_color=%2394a3b8)

Welcome to Project Robin, an advanced, browser-based framework for building and managing a multi-agent AI system. This application is more than a dashboard; it's a command layer designed to architect a self-evolving operational brain, capable of planning, learning, and executing complex tasks through a network of specialized AI agents.

## Core Philosophy

The central idea behind Robin is **guided evolution**. You act as the mentor to an AI that learns from every interaction, mission, and failure. It can propose its own upgrades, new skills, and even new specialized agents, which you can then approve, reject, or modify. This creates a powerful feedback loop where the AI's capabilities grow in alignment with your strategic goals.

## Key Features

- **Multi-Agent Architecture:** Comes pre-loaded with a suite of specialized agents (`wise_agent`, `coding_agent`, `red_robin_agent`, etc.) and allows you to create your own custom agents through the **Agent Forge**.
- **AI Planner & Mission Control:** Decompose high-level objectives into detailed, multi-step strategic plans. The system can then execute these plans, delegating tasks to the most appropriate agents.
- **Self-Evolution Cycle:** Robin analyzes mission failures and performance data to autonomously propose improvements, bug fixes, and new skills. You guide its development by reviewing and approving these proposals.
- **Rich Toolset & Workspaces:** A comprehensive suite of tools built for real-world tasks, including:
    - **Cyber Command:** A web security scanner and audit tool.
    - **Red Robin Co-Pilot:** An interactive workspace for offensive and defensive cybersecurity operations.
    - **Cyber Intel (CYSS):** A powerful OSINT tool for deep-dive investigations.
    - **Policy Advisor:** A workspace for analyzing legislation and strategic documents.
    - **Browser Agent:** An autonomous agent for web scraping and automation.
- **Dynamic Context (RAG):** Robin uses a Memory Stream and a Knowledge Base to maintain context, ensuring its responses and plans are relevant and informed by past events.
- **Zero-Build Setup:** Runs directly in the browser using ES Modules and `esm.sh`. No `npm install` or complex build process required.
- **Offline First:** A service worker provides a seamless offline experience, caching all necessary assets.

## Architecture

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`)
- **State Management:** A robust, local-first database powered by `localStorage`.
- **(Optional) Persistence:** Can be configured to use Firebase Firestore for more durable IndexedDB persistence.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge).
- A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running Locally

This project is designed for simplicity. No build step is required.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/project-robin.git
    cd project-robin
    ```

2.  **Create an Environment File:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

3.  **Add Your API Key:**
    Open the newly created `.env` file and paste your Google Gemini API Key.
    ```
    # .env
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

4.  **Serve the Application:**
    You can use any simple static server. If you have Node.js, `serve` is a great option.
    ```bash
    # If you don't have serve, install it globally: npm install -g serve
    serve -s .
    ```
    The `-s` flag is important; it ensures that all routes are rewritten to `index.html`, which is necessary for the hash-based navigation to work correctly.

5.  **Open in Browser:**
    Navigate to the local URL provided by the server (usually `http://localhost:3000`). The app will prompt you for an API key if the environment variable isn't configured for your server.

### (Optional) Firebase Configuration

For a more robust local persistence layer using IndexedDB (managed by Firebase), you can optionally configure Firebase.

1.  Create a new Web project in the [Firebase Console](https://console.firebase.google.com/).
2.  Find your project's configuration details.
3.  Add them to your `.env` file.

## License

This project is open-source and licensed under the [MIT License](LICENSE).