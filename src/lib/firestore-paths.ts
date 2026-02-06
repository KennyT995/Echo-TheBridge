/**
 * Centralized registry for Firestore paths used in the application.
 */

export const FirestorePaths = {
    /**
     * Path to a user document.
     */
    user: (userId: string) => `users/${userId}`,

    /**
     * Path to a user's collection of visions.
     */
    visions: (userId: string) => `users/${userId}/visions`,

    /**
     * Path to a specific vision document.
     */
    vision: (userId: string, visionId: string) => `users/${userId}/visions/${visionId}`,

    /**
     * Path to a user's collection of roadmaps.
     */
    roadmaps: (userId: string) => `users/${userId}/roadmaps`,

    /**
     * Path to a specific roadmap document.
     */
    roadmap: (userId: string, visionId: string) => `users/${userId}/roadmaps/${visionId}`,

    /**
     * Path to a user's collection of decisions.
     */
    decisions: (userId: string) => `users/${userId}/decision_journal`,

    /**
     * Path to a specific daily plan document.
     */
    dailyPlan: (userId: string, dateKey: string) => `users/${userId}/daily_plans/${dateKey}`,

    /**
     * Path to a user's collection of daily plans.
     */
    dailyPlans: (userId: string) => `users/${userId}/daily_plans`,

    /**
     * Path to a user's collection of daily logs.
     */
    dailyLogs: (userId: string) => `users/${userId}/daily_logs`,

    /**
     * Path to a specific daily log document.
     */
    dailyLog: (userId: string, logId: string) => `users/${userId}/daily_logs/${logId}`,

    /**
     * Path to a specific decision journal document.
     */
    decisionJournal: (userId: string, decisionId: string) => `users/${userId}/decision_journal/${decisionId}`,
};
