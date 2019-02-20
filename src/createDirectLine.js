import Observable from 'core-js/es7/observable';

import fetch from './mockFetch';

class RequestReplyDirectLineJS {
  constructor({ domain = window.location.href, token }) {
    let activityObserver;
    let connectionStatusObserver;

    this.connectionStatus$ = new Observable(observer => {
      connectionStatusObserver = observer;
      connectionStatusObserver.next(0);
    });

    this.activity$ = new Observable(observer => {
      activityObserver = observer;

      connectionStatusObserver.next(1);

      (async () => {
        const res = await fetch(
          new URL('/conversations', domain).toString(),
          {
            headers: {
              'Authorization': `Bearer ${ token }`
            },
            method: 'POST'
          }
        );

        if (!res.ok) {
          console.warn(await res.json());

          connectionStatusObserver.next(4);
        } else {
          const { conversationId } = await res.json();

          this.conversationId = conversationId;

          connectionStatusObserver.next(2);
        }
      })().catch(err => console.error(err));
    });

    this.postActivity = activity => {
      let subscriber;

      (async () => {
        const res = await fetch(
          new URL(`/conversations/${ this.conversationId }/activity`, domain).toString(),
          {
            body: JSON.stringify(activity),
            method: 'POST'
          }
        );

        if (!res.ok) {
          console.warn(await res.json());

          connectionStatusObserver.next(4);

          subscriber.error(new Error(`Failed to post activity, server returned ${ res.status }`));
        } else {
          const { activities } = await res.json();

          activities.forEach(activity => {
            activityObserver.next(activity);
          });

          subscriber.next({ id: Math.random() });
        }
      })().catch(err => console.error(err));

      return new Observable(s => {
        subscriber = s;
      });
    };
  }
}

export default function ({ domain, token }) {
  return new RequestReplyDirectLineJS({ domain, token });
}
