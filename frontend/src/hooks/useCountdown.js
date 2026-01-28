import { useEffect, useState } from "react";

export function useCountdown(endsAt) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, endsAt - Date.now());
      setSeconds(Math.floor(diff / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  return seconds;
}
