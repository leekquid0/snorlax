
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

function log(msg) {
  // Use console.log if available, otherwise do nothing
  if (typeof console !== 'undefined' && console.log) {
    console.log(msg);
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let assetPath = null;
      if (ROUTES[url.pathname]) {
        assetPath = '/static' + ROUTES[url.pathname];
      } else if (url.pathname.startsWith('/static/')) {
        assetPath = url.pathname;
      }

      log(`env.ASSETS present: ${!!env.ASSETS}`);
      log(`Request pathname: ${url.pathname}`);
      log(`Resolved assetPath: ${assetPath}`);

      if (assetPath && env.ASSETS) {
        const assetRequest = new Request(new URL(assetPath, url), request);
        log(`Fetching asset: ${assetPath}`);
        const assetResponse = await env.ASSETS.fetch(assetRequest);
        log(`Asset response status: ${assetResponse.status}`);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }
      }

      // Try to serve static/404.html if not found
      if (env.ASSETS) {
        const notFoundRequest = new Request(new URL('/static/404.html', url), request);
        log('Fetching 404.html');
        const notFoundResponse = await env.ASSETS.fetch(notFoundRequest);
        log(`404.html response status: ${notFoundResponse.status}`);
        if (notFoundResponse.status !== 404) {
          return notFoundResponse;
        }
      } else {
        log('env.ASSETS is undefined!');
      }
      log('Returning raw 404 response');
      return new Response('Not found', { status: 404 });
    } catch (err) {
      log('Exception thrown in fetch handler:');
      log(err && err.stack ? err.stack : err);
      return new Response('Internal Error: ' + (err && err.message ? err.message : err), { status: 500 });
    }
  },
};
