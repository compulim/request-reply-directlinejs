function replyWithError(json) {
  return Promise.resolve({
    json: async () => json,
    ok: false,
    status: 500,
    text: async () => JSON.stringify(json)
  });
}

function replyWithSuccess(json) {
  return Promise.resolve({
    json: async () => json,
    ok: true,
    text: async () => JSON.stringify(json)
  });
}

export default async (url, { body, method }) => {
  if (method === 'POST' && /\/conversations\/?$/.test(url)) {
    // Create conversation
    return replyWithSuccess({ converationId: Math.random().toString(36).substr(2) });
  } else if (method === 'POST' && /\/conversations\/.+?\/activity\/?$/.test(url)) {
    // Post activity
    const { text } = JSON.parse(body);

    return replyWithSuccess({ activities: [{
      from: {
        id: 'bot'
      },
      id: Math.random(),
      text: `You said, \`${ text }\`.`,
      timestamp: new Date().toISOString(),
      type: 'message'
    }] });
  } else {
    return replyWithError(`Unknown URL ${ url }`);
  }
}
