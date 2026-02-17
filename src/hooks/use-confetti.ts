"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";

interface UseConfettiOptions {
    duration?: number;
    particleCount?: number;
    spread?: number;
}

export function useConfetti() {
    const celebrate = useCallback((options: UseConfettiOptions = {}) => {
        const {
            duration = 3000,
            particleCount = 50,
            spread = 360,
        } = options;

        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread,
            ticks: 60,
            zIndex: 9999,
        };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCountScaled = particleCount * (timeLeft / duration);

            // Multiple origins to fill screen
            confetti({
                ...defaults,
                particleCount: particleCountScaled,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount: particleCountScaled,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const simpleBurst = useCallback(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999,
        });
    }, []);

    return { celebrate, simpleBurst };
}
