# Echo: The Bridge
    
Echo: The Bridge is an AI-powered life coaching platform that helps you translate your long-term visions into action-oriented roadmaps. Using advanced generative AI, it reverse-engineers your aspirations into yearly milestones, monthly sprints, weekly tactics, and daily habits.

## Features

-   **Vision Definition**: Clearly articulate your long-term goals.
-   **AI Roadmap Generation**: Automatically generate a structured plan to achieve your vision.
-   **AI Coach**: Reflect on your progress with an AI coach that provides strategic briefings.
-   **Plan Management**: Choose from different tiers (Trailblazer, Pathfinder, Visionary) to suit your needs.
-   **Progress Tracking**: Mark off milestones and habits as you complete them.

## Tech Stack

-   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
-   **Backend**: Firebase (Firestore, Auth), Genkit (AI Flows)
-   **AI**: Gemini 2.5 Flash via Genkit
-   **Deployment**: Firebase App Hosting

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app runs on [http://localhost:9002](http://localhost:9002).

3.  **Lint**:
    ```bash
    npm run lint
    ```

4.  **Build**:
    ```bash
    npm run build
    ```

## Environment Setup

Ensure you have the necessary Firebase and Google Cloud configuration for Genkit to function correctly. You will need a valid Google Cloud project with Vertex AI or AI Studio API access.
