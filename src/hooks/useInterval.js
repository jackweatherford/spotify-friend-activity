import { useEffect, useRef } from "preact/hooks";

/**
 * Hook that calls the given callback function every given interval.
 *
 * @param {function} callback Callback function to run every interval.
 * @param {number} delay How long until next call to callback function.
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const tick = () => savedCallback.current();

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
