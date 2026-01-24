importScripts("https://cdn.jsdelivr.net/gh/soap-phia/tinyjet@latest/tinyjet/scramjet.all.js");
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker()

async function proxyRequest(request) {
  try {
    const url = new URL(request.url)
    
    if (url.pathname.startsWith('/scramjet/')) {
      const encodedUrl = url.pathname.replace('/scramjet/', '') + url.search
      const realUrl = decodeURIComponent(encodedUrl)
      
      console.log('Proxying to:', realUrl)
      
      const newRequest = new Request(realUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        integrity: request.integrity
      })
      
      return fetch(newRequest)
    }
    
    return fetch(request)
  } catch (error) {
    console.error('Proxy request error:', error)
    return new Response('Proxy Error: ' + error.message, { 
      status: 500, 
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

async function handleRequest(event) {
  const url = new URL(event.request.url)
  
  // Don't intercept static assets - let them load directly
  if (url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.ico') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.jpeg') || 
      url.pathname.endsWith('.gif') || 
      url.pathname.endsWith('.svg') || 
      url.pathname.endsWith('.woff') || 
      url.pathname.endsWith('.woff2') ||
      url.pathname.startsWith('/tinyjet/')) {
    return fetch(event.request)
  }
  
  try {
    await scramjet.loadConfig()
    
    if (scramjet.route(event)) {
      try {
        return await scramjet.fetch(event)
      } catch (scramjetError) {
        console.error('Scramjet fetch error:', scramjetError)
        
        if (event.request.url.includes('/scramjet/')) {
          return await proxyRequest(event.request)
        }
        
        return await fetch(event.request)
      }
    }
    
    return await fetch(event.request)
  } catch (error) {
    console.error('Service worker error:', error)
    
    if (event.request.url.includes('/scramjet/')) {
      return await proxyRequest(event.request)
    }
    
    try {
      return await fetch(event.request)
    } catch (fallbackError) {
      console.error('Fallback fetch failed:', fallbackError)
      return new Response('Service Error', { 
        status: 500, 
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  }
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event))
})