import { RoadmapHistoryItem } from '@/features/roadmaps/types';
import { isSameDay, subDays, startOfDay } from 'date-fns';

export interface StreakResult {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
}

export function calculateStreak(history: RoadmapHistoryItem[] = []): StreakResult {
    if (!history || history.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
    }

    // Filter for daily habits only, as that's what counts for the "daily" streak
    // Or should we count ANY activity? The spec said "Daily Habits", let's stick to that for now
    // but usually any progress is good. Let's include everything for now to be generous, 
    // or strictly daily habits if we want to enforce that specific loop.
    // "Today's habits build the bridge" -> suggests habits. 
    // Let's filter for habits to be strict about the "Daily Habit" loop.
    const habitHistory = history.filter(item => item.section === 'dailyHabits');

    if (habitHistory.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
    }

    // Extract unique dates and sort descending
    const uniqueDates = Array.from(new Set(habitHistory.map(item => {
        // Handle both Firestore Timestamp and Date strings/objects
        let date: Date;
        if (item.completedAt && typeof (item.completedAt as any).toDate === 'function') {
            date = (item.completedAt as any).toDate();
        } else if (item.completedAt instanceof Date) {
            date = item.completedAt;
        } else {
            // Fallback for strings or generic objects, though schemas should catch this
            date = new Date(item.completedAt as string | number | Date);
        }
        return startOfDay(date).toISOString();
    }))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Descending

    if (uniqueDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
    }

    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    const lastActivity = new Date(uniqueDates[0]);

    // Current Streak Calculation
    let currentStreak = 0;

    // If the last activity was today or yesterday, the streak is alive.
    // If it was before yesterday, the streak is broken (0).
    if (isSameDay(lastActivity, today) || isSameDay(lastActivity, yesterday)) {
        currentStreak = 1;
        let currentDate = lastActivity;

        // Iterate backwards checking for consecutiveness
        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i]);
            const expectedPrevDate = subDays(currentDate, 1);

            if (isSameDay(prevDate, expectedPrevDate)) {
                currentStreak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }
    }

    // Longest Streak Calculation
    let longestStreak = currentStreak; // At least as long as current
    let tempStreak = 1;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i]);
        const next = new Date(uniqueDates[i + 1]); // This is actually the "previous" day in time

        if (isSameDay(next, subDays(current, 1))) {
            tempStreak++;
        } else {
            tempStreak = 1;
        }

        if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
        }
    }

    return {
        currentStreak,
        longestStreak,
        lastActivityDate: lastActivity
    };
}
