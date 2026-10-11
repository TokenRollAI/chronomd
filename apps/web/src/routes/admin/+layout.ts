// Admin pages load data via the browser-side `adminApi` (relative URLs + auth cookie),
// which cannot run during SSR. Render the admin as a client-side app.
export const ssr = false;
