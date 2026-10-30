/**
 * Runs `fn` once calls stop for `wait` ms (the trailing call), with
 * `cancel()` to drop a pending one.
 *
 * In place of lodash's: `import { debounce } from 'lodash'` brought the whole
 * library (~70 KB minified, it does not tree-shake) into every page, through
 * the auth store the root layout loads.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => unknown,
  wait = 0
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}
