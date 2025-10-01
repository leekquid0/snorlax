
// Cloudflare Worker script using @cloudflare/kv-asset-handler for static assets

const ROUTES = {
  '/': '/index.html',
  '/science': '/Proxy.html',
  '/math': '/Games.html',
  '/english': '/Apps.html',
  '/about': '/About.html',
  '/settings': '/Settings.html',
  '/snorlax': '/people-secrets/snorlax.html',
  '/tlochsta': '/people-secrets/tlochsta.html',
  '/fowntain': '/people-secrets/fowntain.html',
  '/bigfoot': '/people-secrets/bigfoot.html',
  '/burb': '/people-secrets/burb.html',
  '/derpman': '/people-secrets/derpman.html',
  '/cats': '/people-secrets/cats.html',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let assetPath = null;
    if (ROUTES[url.pathname]) {
      assetPath = '/static' + ROUTES[url.pathname];
    } else if (url.pathname.startsWith('/static/')) {
      assetPath = url.pathname;
    }

    if (assetPath) {
      // Rewrite request to the static asset and fetch from ASSETS binding
      const assetRequest = new Request(new URL(assetPath, url), request);
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    // Try to serve static/404.html if not found
    const notFoundRequest = new Request(new URL('/static/404.html', url), request);
    const notFoundResponse = await env.ASSETS.fetch(notFoundRequest);
    if (notFoundResponse.status !== 404) {
      return notFoundResponse;
    }
    return new Response('Not found', { status: 404 });
  },
};
