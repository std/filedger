export default {
  async fetch(request, env,ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api')) {
      const api_address = "http://ledg.app/mainnet";

      //const statusCode = 301;

      const url = new URL(request.url);
      const { pathname, search } = url;

      const destinationURL = `${api_address}${pathname}${search}`;

      async function gatherResponse(response) {
        const { headers } = response;
        const contentType = headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return JSON.stringify(await response.json());
        }
        return response.text();
      }

      const init = {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      };

      const cache=caches.default
      const cacheKey=destinationURL
      let  response=await cache.match(cacheKey);

      if (!response) {
        response = await fetch(destinationURL, init);

        const results = await gatherResponse(response);
        response = new Response(results, init);
        response.headers.append("Cache-Control", "s-maxage=30");
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
      return response
    }

    return env.ASSETS.fetch(request);
  },
}