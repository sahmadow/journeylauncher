import { useRef, useEffect } from "react";

export function useAnimationFrame(callback: (time: number) => void) {
  const ref = useRef<(time: number) => void>(callback);
  const frameRef = useRef<number>(0);

  ref.current = callback;

  useEffect(() => {
    const loop = (time: number) => {
      ref.current(time);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);
}
