export const isClient = import.meta.env.MODE === 'client';
export const isDoc = import.meta.env.MODE === 'doc';

export const deployPath = isDoc
  ? `<your-pagespy-host>`
  : window.DEPLOY_BASE_PATH;
export const deployUrl = isDoc
  ? `https://<your-pagespy-host>`
  : `${location.protocol}//${window.DEPLOY_BASE_PATH}`;

export const PLACEHOLDER_RESPONSE =
  '__PLACEHOLDER_RESPONSE_DEFINED_BY_PAGE_SPY__';
