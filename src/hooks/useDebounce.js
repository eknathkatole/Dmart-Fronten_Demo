import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay (ms).
 * Returns the debounced value — only updates after the user stops changing it.
 */
export const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
