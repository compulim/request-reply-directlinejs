import fetch from 'node-fetch';
import { createServer } from 'restify';

import requestToBuffer from './requestToBuffer';

const PORT = 5000;

(async function () {
  const server = createServer();
  const watermarks = {};

  server.pre(({ headers, method }, res, next) => {
    if (method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', headers.origin);
      res.header('Access-Control-Allow-Headers', 'Authorization');
      res.send();
    } else {
      return next();
    }
  });

  server.post('/conversations', async ({ headers }, res) => {
    res.header('Access-Control-Allow-Origin', headers.origin);

    const sreq = await fetch(
      'https://directline.botframework.com/v3/directline/conversations',
      {
        headers: {
          'Authorization': headers.authorization
        },
        method: 'POST'
      }
    );

    if (!sreq.ok) {
      res.status(500);
      res.send();

      return;
    }

    const json = await sreq.json();

    res.send(json);
  });

  server.post('/conversations/:conversationID/activities', async (req, res) => {
    const { headers: { authorization, origin }, params: { conversationID } } = req;
    const body = JSON.parse((await requestToBuffer(req)).toString());

    res.header('Access-Control-Allow-Origin', origin);

    let id;

    try {
      id = postActivity({ authorization, conversationID }, body);
    } catch (err) {
      res.status(500);

      return res.send(err);
    }

    let cumulatedActivities = [];

    for (;;) {
      await sleep();

      const { activities, watermark } = await pollActivities({ authorization, conversationID }, watermarks[conversationID]);

      if (activities.length) {
        cumulatedActivities = [...cumulatedActivities, ...activities];
        watermarks[conversationID] = watermark;
      } else {
        break;
      }
    }

    res.send({ activities: cumulatedActivities, id });
  });

  server.listen(PORT, () => {
    console.log(`Request-reply proxy now listening to port ${ PORT }`);
  });
})().catch(err => console.error(err));

async function pollActivities({ authorization, conversationID }, watermark = '') {
  const req = await fetch(
    `https://directline.botframework.com/v3/directline/conversations/${ encodeURI(conversationID) }/activities?watermark=${ watermark }`,
    {
      headers: { authorization }
    }
  );

  if (!req.ok) {
    throw new Error(`Server returned ${ req.status }`);
  }

  return await req.json();
}

async function postActivity({ authorization, conversationID }, activity) {
  const req = await fetch(
    `https://directline.botframework.com/v3/directline/conversations/${ encodeURI(conversationID) }/activities`,
    {
      body: JSON.stringify(activity),
      headers: {
        authorization,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }
  );

  if (!req.ok) {
    throw new Error(`Server returned ${ req.status }`);
  }

  const { id } = await req.json();

  return id;
}

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
