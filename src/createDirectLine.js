import Observable from 'core-js/es7/observable';

// import fetch from './mockFetch';

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
          new URL(`/conversations/${ this.conversationId }/activities`, domain).toString(),
          {
            body: JSON.stringify(activity),
            headers: {
              'Authorization': `Bearer ${ token }`
            },
            method: 'POST'
          }
        );

        if (!res.ok) {
          console.warn(await res.json());

          connectionStatusObserver.next(4);

          subscriber.error(new Error(`Failed to post activity, server returned ${ res.status }`));
        } else {
          const { activities, id = Math.random().toString(36).substr(2) } = await res.json();

          activities.forEach(activity => {
            activityObserver.next(activity);
          });

          // Mock an echo back so Web Chat think the outgoing activity is sent successfully
          activityObserver.next({
            ...activity,
            id
          });

          subscriber.next({ id });
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
