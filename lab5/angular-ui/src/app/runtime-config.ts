declare global {
  interface Window {
    APP_CONFIG?: {
      apiBaseUrl?: string;
    };
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getBackendBaseUrl(): string {
  const configuredBaseUrl = window.APP_CONFIG?.apiBaseUrl?.trim() ?? '';
  const fallbackBaseUrl = window.location.origin;
  return trimTrailingSlash(configuredBaseUrl || fallbackBaseUrl);
}

export function buildBackendUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
}

