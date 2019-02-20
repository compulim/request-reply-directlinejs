# `request-reply-dljs`

- `npm install`
- `npm start`
- Navigate to [http://localhost:5080/](http://localhost:5080/)

# Endpoints

You can specify `?domain=https://directline.botframework.com/vnext/directline/` as a prefix (remember the trailing slash.)

> Note: If not specified in `?domain`, it will goes to http://localhost:5000/.

## Creating a new conversation

`POST /conversations`

- Header
   - `Authorization: Bearer TOKEN`
- Response
   - (Same as Direct Line v3)
   - `{ conversationId: 'CONVERSATION_ID' }`

## Posting to a conversation

`POST /conversations/CONVERSATION_ID/activities`

- Header
   - `Authorization: Bearer TOKEN`
- Body
   - `{ activities: [{ type: 'message' }, { type: 'message' }], id: NEW_ACTIVITY_ID }`

> Note: Don't forget the echo back the message the user send out
>       Echo back is used in Web Chat for ACK successful send (today)
