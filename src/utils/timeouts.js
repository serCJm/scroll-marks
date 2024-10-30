/**
 *
 * @param {NodeJS.Timeout | null} intervalId
 */
export function clearIntervalIfNeeded(intervalId) {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

/**
 *
 * @param {NodeJS.Timeout | null} timeoutId
 */
export function clearTimeoutIfNeeded(timeoutId) {
	if (timeoutId) {
		clearTimeout(timeoutId);
		timeoutId = null;
	}
}
