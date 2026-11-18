import { useEffect, useState } from 'react';

/** Layout breakpoints, matching the @media rules in styles.css. */
export const STACKED = '(max-width: 860px)'; // sidebar stacks above the results
export const PHONE = '(max-width: 640px)'; // card layouts instead of wide grids

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}
