'use client';

import React, { createContext, useContext, useState } from 'react';
import { FocusAnchor } from '@/features/dashboard/components/focus-anchor';

interface FocusContextType {
    activeTask: string | undefined;
    visionTitle: string | undefined;
    setFocus: (task: string, vision: string) => void;
    clearFocus: () => void;
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusAnchorProvider({ children }: { children: React.ReactNode }) {
    const [activeTask, setActiveTask] = useState<string | undefined>(undefined);
    const [visionTitle, setVisionTitle] = useState<string | undefined>(undefined);
    const [isVisible, setIsVisible] = useState(false);

    const setFocus = (task: string, vision: string) => {
        setActiveTask(task);
        setVisionTitle(vision);
        setIsVisible(true);
    };

    const clearFocus = () => {
        setActiveTask(undefined);
        setVisionTitle(undefined);
        setIsVisible(false);
    };

    return (
        <FocusContext.Provider value={{ activeTask, visionTitle, setFocus, clearFocus, isVisible, setIsVisible }}>
            {children}
            {isVisible && activeTask && (
                <FocusAnchor
                    activeTask={activeTask}
                    visionTitle={visionTitle}
                    onClose={() => setIsVisible(false)}
                />
            )}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error('useFocus must be used within a FocusAnchorProvider');
    }
    return context;
}
