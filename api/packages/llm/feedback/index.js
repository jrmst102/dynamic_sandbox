/**
 * DigitalOcean Function: LLM Feedback Proxy
 * Forwards requests to the Anthropic API with the API key appended server-side.
 * No user data is stored or logged.
 */
async function main(args) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  // Only allow POST
  if (args.__ow_method && args.__ow_method !== 'post') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Parse the incoming request body
  let payload;
  try {
    payload = typeof args.body === 'string' ? JSON.parse(args.body) : args;
    // Remove internal OpenWhisk fields
    delete payload.__ow_method;
    delete payload.__ow_headers;
    delete payload.__ow_path;
    delete payload.__ow_query;
    delete payload.__ow_body;
    delete payload.body;
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  // Validate required fields
  if (!payload.messages || !Array.isArray(payload.messages)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing required field: messages' }),
    };
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

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: data.error?.message || 'Anthropic API error' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to reach Anthropic API' }),
    };
  }
}

exports.main = main;
