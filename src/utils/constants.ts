export const isClient = import.meta.env.MODE === 'client';
export const isDoc = import.meta.env.MODE === 'doc';

export const deployPath = isDoc
  ? `<your-PageSpy-server-host>`
  : window.DEPLOY_BASE_PATH;
export const deployUrl = isDoc
  ? `https://<your-PageSpy-server-host>`
  : `${location.protocol}//${window.DEPLOY_BASE_PATH}`;
