
// Cloudflare Worker script using @cloudflare/kv-asset-handler for static assets
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

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
    let event = { request };
    let customPath = ROUTES[url.pathname];
    if (customPath) {
      // Rewrite to static file
      event.request = new Request(new URL('/static' + customPath, url), request);
    }
    try {
      return await getAssetFromKV(event);
    } catch (e) {
      // Serve 404.html if not found
      try {
        event.request = new Request(new URL('/static/404.html', url), request);
        return await getAssetFromKV(event);
      } catch (e2) {
        return new Response('Not found', { status: 404 });
      }
    }
  },
};
