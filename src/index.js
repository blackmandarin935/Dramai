const HF_ENDPOINTS = {
  llm: 'https://router.huggingface.co/hf-inference/models/TinyLlama/TinyLlama-1.1B-Chat-v1.0',
  tts: 'https://router.huggingface.co/hf-inference/models/hexgrad/Kokoro-82M',
  image: 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
  music: 'https://router.huggingface.co/hf-inference/models/facebook/musicgen-small',
};

async function hashKey(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/hf')) {
      return this.handleHFProxy(request, env, url);
    }
    
    return env.ASSETS.fetch(request);
  },

  async handleHFProxy(request, env, url) {
    const type = url.searchParams.get('type');
    const endpoint = HF_ENDPOINTS[type];
    
    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.text();
    const cacheKey = `hf:${type}:${await hashKey(body)}`;
    
    const cached = await env.CACHE.get(cacheKey, { type: 'arrayBuffer' });
    if (cached) {
      const contentType = type === 'image' ? 'image/png' : 
                          type === 'tts' || type === 'music' ? 'audio/wav' : 
                          'application/json';
      return new Response(cached, {
        headers: { 
          'Content-Type': contentType,
          'X-Cache': 'HIT'
        }
      });
    }

    const hfToken = env.HF_TOKEN;
    const headers = { 'Content-Type': 'application/json' };
    if (hfToken) {
      headers['Authorization'] = `Bearer ${hfToken}`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err, status: res.status }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = res.headers.get('Content-Type') || 'application/json';
    const data = await res.arrayBuffer();
    
    ctx.waitUntil(
      env.CACHE.put(cacheKey, data, { expirationTtl: 86400 })
    );

    return new Response(data, {
      headers: { 
        'Content-Type': contentType,
        'X-Cache': 'MISS'
      }
    });
  }
};
