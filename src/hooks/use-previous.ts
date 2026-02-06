import { useRef, useEffect } from "react";

/**
 * A hook that returns the value of a variable from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
