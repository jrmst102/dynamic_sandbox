/**
 * DigitalOcean Function: LLM Feedback Proxy
 * Forwards requests to the Anthropic API with the API key appended server-side.
 * No user data is stored or logged.
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
    body: JSON.stringify(payload),
  };
}

async function main(args) {
  const method = (args.__ow_method || '').toLowerCase();

  // Handle browser CORS preflight requests.
  if (method === 'options') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'API key not configured' });
  }

  // Only allow POST
  if (method && method !== 'post') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // Parse the incoming request body
  let payload;
  try {
    const rawBody = typeof args.__ow_body === 'string'
      ? args.__ow_body
      : typeof args.body === 'string'
        ? args.body
        : null;

    if (rawBody) {
      payload = JSON.parse(rawBody);
    } else if (args.body && typeof args.body === 'object') {
      payload = args.body;
    } else {
      payload = args;
    }

    // Remove internal OpenWhisk fields
    delete payload.__ow_method;
    delete payload.__ow_headers;
    delete payload.__ow_path;
    delete payload.__ow_query;
    delete payload.__ow_body;
    delete payload.body;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  // Validate required fields
  if (!payload.messages || !Array.isArray(payload.messages)) {
    return jsonResponse(400, { error: 'Missing required field: messages' });
  }

  // Forward to Anthropic API
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: payload.model || 'claude-sonnet-4-20250514',
        max_tokens: Math.min(payload.max_tokens || 1000, 1000),
        system: payload.system || '',
        messages: payload.messages,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { error: { message: 'Invalid response from Anthropic API' } };
    }

    if (!response.ok) {
      return jsonResponse(response.status, { error: data.error?.message || 'Anthropic API error' });
    }

    return jsonResponse(200, data);
  } catch (err) {
    return jsonResponse(502, { error: 'Failed to reach Anthropic API' });
  }
}

exports.main = main;
