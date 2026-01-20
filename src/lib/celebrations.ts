import confetti from 'canvas-confetti';

type CelebrationTier = 'dailyHabits' | 'weeklyTactics' | 'monthlySprints' | 'yearlyMilestones' | 'visionTimeline' | 'vision';

export const triggerMilestoneCelebration = (tier: CelebrationTier, toast: any) => {
    const strategies = celebrationStrategies[tier];
    if (!strategies || strategies.length === 0) return;

    // Pick a random strategy
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    randomStrategy(toast);
};

const runFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
};

const runSchoolPride = () => {
    const end = Date.now() + 2 * 1000;
    const colors = ['#bb0000', '#ffffff'];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
};

const celebrationStrategies: Record<CelebrationTier, ((toast: any) => void)[]> = {
    dailyHabits: [
        // 1. "Streak Flame" (Simulated with distinct colors)
        (toast) => {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#ef4444', '#f97316', '#facc15'], // Fire colors
            });
            toast({
                title: "🔥 Daily Win!",
                description: "You're building serious momentum.",
            });
        },
        // 2. "Checkmark Sweep" (Gold spread)
        (toast) => {
            confetti({
                particleCount: 60,
                spread: 100,
                origin: { y: 0.7 },
                colors: ['#eab308', '#fef08a'], // Gold
            });
            toast({
                title: "✨ Perfect Day",
                description: "Every habit checked. Nicely done.",
            });
        },
        // 3. Simple Cheer
        (toast) => {
            toast({
                title: "Consistency is Key 🔑",
                description: "Another day, another victory.",
            });
        }
    ],
    weeklyTactics: [
        // 1. "The Stamp"
        (toast) => {
            runSchoolPride();
            toast({
                title: "📅 WEEK COMPLETE",
                description: "7/7 Days. You crushed this week!",
                className: "border-green-500 bg-green-50"
            });
        },
        // 2. "Weekend Warrior"
        (toast) => {
            confetti({
                particleCount: 100,
                spread: 160,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#ec4899', '#6366f1'], // Cool vibes
            });
            toast({
                title: "🚀 Weekly Objectives Met",
                description: "Time to recharge for next week.",
            });
        }
    ],
    monthlySprints: [
        // 1. "Level Up"
        (toast) => {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                scalar: 1.2,
            });
            toast({
                title: "⬆️ LEVEL UP: Monthly Sprint Completed",
                description: "You've made significant progress on your vision.",
                className: "bg-blue-50 border-blue-500"
            });
        },
        // 2. "Confetti Cannon"
        (toast) => {
            const defaults = { origin: { y: 0.7 } };
            const fire = (particleRatio: number, opts: any) => {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(200 * particleRatio)
                }));
            };
            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });

            toast({
                title: "🏆 MONTHLY MASTERPIECE",
                description: "This month is one for the books."
            });
        }
    ],
    yearlyMilestones: [
        // 1. fireworks
        (toast) => {
            runFireworks();
            toast({
                title: "🎆 YEARLY MILESTONE ACHIEVED",
                description: "This is a major life moment. Take it in.",
                duration: 8000
            });
        }
    ],
    visionTimeline: [
        (toast) => {
            runSchoolPride();
            toast({
                title: "🚩 MILESTONE REACHED",
                description: "You've conquered a major phase of your journey.",
                className: "border-indigo-500 bg-indigo-50"
            });
        }
    ],
    vision: [
        // Vision completion
        (toast) => {
            runFireworks();
            toast({
                title: "🌟 VISION REALIZED",
                description: "You have crossed the bridge. Welcome to your new reality.",
                duration: 10000,
                className: "bg-yellow-50 border-yellow-500"
            });
        }
    ]
};
