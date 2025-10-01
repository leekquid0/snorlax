
// Cloudflare Worker script to serve static files and routes
const STATIC_PREFIX = '/static/';
const PEOPLE_PREFIX = '/static/people-secrets/';

const ROUTES = {
  '/': 'static/index.html',
  '/science': 'static/Proxy.html',
  '/math': 'static/Games.html',
  '/english': 'static/Apps.html',
  '/about': 'static/About.html',
  '/settings': 'static/Settings.html',
  '/snorlax': 'static/people-secrets/snorlax.html',
  '/tlochsta': 'static/people-secrets/tlochsta.html',
  '/fowntain': 'static/people-secrets/fowntain.html',
  '/bigfoot': 'static/people-secrets/bigfoot.html',
  '/burb': 'static/people-secrets/burb.html',
  '/derpman': 'static/people-secrets/derpman.html',
  '/cats': 'static/people-secrets/cats.html',
};

async function handleRequest(request) {
  const url = new URL(request.url);
  let filePath = ROUTES[url.pathname];

  // Serve static files directly if path starts with /static/
  if (!filePath && url.pathname.startsWith('/static/')) {
    filePath = url.pathname.slice(1); // remove leading /
  }

  // If not found, serve 404
  if (!filePath) {
    filePath = 'static/404.html';
  }

  // Try to fetch the asset from the Worker environment
  try {
    // __STATIC_CONTENT is provided by Wrangler for static assets
    const asset = await __STATIC_CONTENT_MANIFEST[filePath]
      ? await fetch(`https://your-cdn-url/${filePath}`)
      : null;
    if (asset && asset.ok) {
      return asset;
    }
  } catch (e) {
    // fallback to 404
  }

  // If asset not found, return 404
  if (filePath !== 'static/404.html') {
    // Try to serve 404.html
    try {
      const notFound = await fetch(`https://your-cdn-url/static/404.html`);
      if (notFound && notFound.ok) return notFound;
    } catch (e) {}
  }
  return new Response('Not found', { status: 404 });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};
