# **App Name**: Vision Bridge

## Core Features:

- Vision Vault Input: Capture user's 2, 5, and 10-year visions for Career, Health, Relationships, and Legacy.
- AI Roadmap Generation: Server action that uses Google Gemini to reverse-engineer visions into a JSON roadmap of Yearly Milestones, Monthly Sprints, Weekly Tactics, and Daily Habits, leveraging a tool to ensure strategic alignment between short-term tasks and long-term visions.
- Roadmap Persistence: Save the AI-generated roadmap, tasks, and milestones to Firestore.
- Vision Page UI: Develop a Vision Page to input 2/5/10 year goals.
- Real-time Roadmap Display: Streaming display of AI-generated roadmap content, rendered with zero-latency optimistic updates.
- Secure Authentication: Implement secure user authentication with Firebase Auth, ensuring AuthState is pervasive throughout the application and data loading is optimized using an 'Optimistic ID'.

## Style Guidelines:

- Primary color: Vibrant Neon Green (#00F5A0) to represent hyper-intelligence and forward momentum.
- Background color: Dark, desaturated slate gray (#2E3138) for a sophisticated dark mode aesthetic.
- Accent color: Electric Blue (#7DF9FF), for highlights and interactive elements, creating contrast and drawing attention.
- Headline font: 'Geist', sans-serif.
- Body font: 'Inter', sans-serif. Note: currently only Google Fonts are supported.
- Use minimalist, geometric icons with neon accents to represent tasks, milestones, and categories.
- Employ a glassmorphism effect with frosted glass panels for a modern, layered interface.
- Implement smooth transitions and subtle animations to enhance user experience and provide visual feedback.
