/**
 * Detect the runtime environment.
 * Provides helpers to identify PWA and macOS contexts.
 */

export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  if (
    typeof navigator.userAgentData === 'object' &&
    typeof navigator.userAgentData.platform === 'string'
  ) {
    return navigator.userAgentData.platform.toLowerCase() === 'macos';
  }

  return /mac/i.test(navigator.userAgent) || /mac/i.test(navigator.platform);
}

export const isPWA = (): boolean => {
  if (!!('windowControlsOverlay' in navigator)) {
    return !!(navigator.windowControlsOverlay as any)?.visible;
  }

  return false;
};
