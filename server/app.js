/* https://raw.githubusercontent.com/fbsamples/messenger-platform-samples/master/quick-start/app.js
https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/

To run this code:
  1. Deploy this code to a server running Node.js
  2. Run `yarn install`
  3. Add your VERIFY_TOKEN and PAGE_ACCESS_TOKEN to your environment vars
*/

'use strict';

var express = require("express");
var request = require("request");
var app = express();

var port = 5000;
// const httpServer = app.listen(port, () => {
//   console.log('listening on *:' + port);
// });

var httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    // origin: "https://example.com",
    methods: ["GET", "POST"]
  }
});
this.socket = null;

io.on("connection", socket => {
  // socket.send("Hello!");
  // socket.emit("greetings", "Hey!", { "ms": "jane" }, Buffer.from([4, 3, 3, 1]));
  this.socket = socket;
  socket.emit('SocketIO Server online')

  // handle the event which is sent with socket.send()
  socket.on("connectSocket", (pageID) => {
    console.log('Client connected: ' + pageID);
    socket.emit('SocketIO connected with client');
  });
  socket.on('replyMessage', (pageToken, _pageID, userID, message) => {
    console.log('sending reply');
    sendMessage(userID, message, pageToken)
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});



// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());  // Parse application/json

app.get('/', (req, res) => {
  res.status(200).send('welcome')
})

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {  // GET request is for webhook verification
  const VERIFY_TOKEN = 'praneeth';
  
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('WEBHOOK verification failed');
      res.sendStatus(403);
    }
  }
  else
    res.status(200).send('no token found');
});

app.post('/webhook', (req, res) => {   // POST request is for receiving messages
  let body = req.body;
  console.log('\n\n got a message')

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      let event = entry.messaging[0];
      console.log(event);

      let userID = event.sender.id;
      let sendTime = event.timestamp;
      let msgText = event.message.text;
      // let msgId = event.message.id;

      console.log('Sender ID: ' + userID);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (event.message)
        handleMessage(userID, msgText, sendTime);
      // else if (event.postback)
      //   handlePostback(userID, event.postback);
    });
    res.status(200).send('EVENT_RECEIVED');  // status 200 OK
  } else {
    res.sendStatus(404);  // Error 404: Page not found
  }
});

const handleMessage = (userID, msgText, sendTime) => {
  if (msgText) {
    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send API
    // sendMessage(userID, `Your message: ${msgText}`);   // Send the response to sender/user
    io.emit('newMessage', userID, msgText, sendTime);  // Send to frontend react app
  } else
    console.log('No text mentioned')
}

// Sends response messages via the Send API
const sendMessage = (userID, msgText, pageToken='') => {
  let response = { 'text': msgText };
  // The page access token we have generated in your app settings
  pageToken = pageToken || 'EAAFRHZBzA39kBAG2PHWR0vwqVKdv393PzJCvcfqBZB1RhisMtqGJ81sZAYcvZCcJg7w49fLKxOhjuMEWRdEhQMZC6wNXcVhpCdAPjmOJWXShQ3QQRZCrFsg9ib78KO7ndX3sAxtfZACYZBSOsCCSxyn1qiTZC3MRhsmCFVBBbssRWooscFOOeXPAQYrF1ew1w5nH5M0ALPwGNLZCL6p9TZCU6Qj';
  let requestBody = {
    'recipient': { 'id': userID },
    'message': response
  };

  // Send the HTTP request to the Messenger Platform
  request({
    'uri': 'https://graph.facebook.com/me/messages',
    'qs': { 'access_token': pageToken },
    'method': 'POST',
    'json': requestBody
  }, (err, _res, _body) => {
    if (!err)
      console.log('Reply sent!');
    else
      console.error('Unable to send message:' + err);
  });
}

// // Handles messaging_postbacks events
// function handlePostback(userID, receivedPostback) {
//   let response;
//   // Get the payload for the postback
//   let payload = receivedPostback.payload;
//   // Set the response based on the postback payload
//   if (payload === 'yes') {
//     response = { 'text': 'Thanks!' };
//   } else if (payload === 'no') {
//     response = { 'text': 'Oops, try sending another image.' };
//   }
//   sendMessage(userID, response);   // Send the message to acknowledge the postback
// }
httpServer.listen(port);
console.log('Your app is listening on port ' + port);
