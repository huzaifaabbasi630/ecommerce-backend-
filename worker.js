/**
 * Cloudflare Worker proxy for the backend API.
 * Update BACKEND_URL to your deployed backend endpoint.
 */
const BACKEND_URL = 'https://ecommerce-backend-psi-flax-75.vercel.app/';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const requestUrl = new URL(request.url);
  const backendUrl = new URL(BACKEND_URL);
  backendUrl.pathname = requestUrl.pathname;
  backendUrl.search = requestUrl.search;

  const backendRequest = new Request(backendUrl.toString(), request);
  const response = await fetch(backendRequest);
  const responseBody = await response.arrayBuffer();
  const responseHeaders = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    responseHeaders.set(key, value);
  }

  return new Response(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}
