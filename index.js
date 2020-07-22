'use strict';


// Imports dependencies and set up http server
const
  request = require('request'),
  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()),
  axios = require('axios'),
  postbackPayloads = {
    comeIn: "1",
    findOutMore: "2",
    getStarted: "3"
  },
  quickReplyPayloads = {
    comeInNow: "1",
    comeInLater: "2"
  }
  // creates express http server

// Sets server port and logs message on success
let listener = app.listen(process.env.PORT || 1337, () => console.log(`webhook is listening on port ${listener.address().port}`));

async function setParams() {
  let request_body = {
    "greeting":[
      {
        "locale":"default",
        "text":"Hello, {{user_first_name}}. Welcome to our page 😄"
      }
    ],
    "get_started":{
        "payload":postbackPayloads.getStarted
    }
 };

  await request({
    "uri": "https://graph.facebook.com/v7.0/me/messenger_profile",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(res.statusCode);
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

setParams();

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;
  
  // Checks this is an event from a page subscription
  if (body.object === 'page') {

  // Iterates over each entry - there may be multiple if batched
  body.entry.forEach(function(entry) {

    // Gets the message. entry.messaging is an array, but 
    // will only ever contain one message, so we get index 0
    let webhook_event = entry.messaging[0];
    console.log(webhook_event);

    // Get the sender PSID
    let sender_psid = webhook_event.sender.id;
    console.log('Sender PSID: ' + sender_psid);

    // Check if the event is a message or postback and
    // pass the event to the appropriate handler function
    if (webhook_event.get_started)
      getStarted(sender_psid);
    if (webhook_event.message) {
      handleMessage(sender_psid, webhook_event.message);        
    } else if (webhook_event.postback) {
      handlePostback(sender_psid, webhook_event.postback);
    } 
      
      

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

//Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

 

  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = "test";
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token']; 
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

async function getStarted(sender_psid){

  // await request({
  //   "uri": "https://graph.facebook.com/v7.0/me/messenger_profile",
  //   "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
  //   "method": "POST",
  //   "json": request_body
  // }, (err, res, body) => {
  //   if (!err) {
  //     console.log(res.statusCode);
  //   } else {
  //     console.error("Unable to send message:" + err);
  //   }
  // }); 

  // const res = await fetch(`https://graph.facebook.com/${sender_psid}?fields=first_name&access_token=${process.env.PAGE_ACCESS_TOKEN}`);
  // console.log(`https://graph.facebook.com/${sender_psid}?fields=first_name&access_token=${process.env.PAGE_ACCESS_TOKEN}`);

  
  // request({
  //   "uri":`https://graph.facebook.com/${sender_psid}?fields=first_name&access_token=${process.env.PAGE_ACCESS_TOKEN}`,
  //   "qs": {
  //     "access_token":process.env.PAGE_ACCESS_TOKEN,
  //     "fields":"first_name"
  //   },
  //   "method":"GET"
  // }, (err, res, body) => {
  //   console.log(res)
  // })

  // const name = await res.json();


  let response = {
    "text":`How would you like us to help you today?`,
    "quick_replies":[
      {
        "content_type":"text",
        "title":"I'd Like to Come in now 🚶🏾‍♀️",
        "payload":quickReplyPayloads.comeInNow
      },{
        "content_type":"text",
        "title":"I'd Like to Come in later ⏱...🚶🏾‍♀️",
        "payload":quickReplyPayloads.comeInLater,
      },{
        "content_type":"text",
        "title":"I'd Like to know more about you're business",
        "payload":postbackPayloads.findOutMore,
      }
    ]
  }
  //callSendAPI(sender_psid, message);
  callSendAPI(sender_psid, response);
}

// Handles messages events
function handleMessage(sender_psid, received_message) {

  let response;

  if(received_message.quick_reply){
    let payload=received_message.quick_reply.payload;
    switch(payload){
      case quickReplyPayloads.comeInNow:{
        response = ( {"text": "Ok. Checking if now's a good time..."});
        break;
      }
      case quickReplyPayloads.comeInLater:{
        response = ({
          "text":"Ok how would you like to do that?",
          "quick_replies":[
            {
              "content_type":"text",
              "title":"Tell me when I can get through quickly 🏃🏾‍♀️💨",
              "payload":quickReplyPayloads.comeInNow
            },{
              "content_type":"text",
              "title":"I wanna plan a time I can come in ⌚🤔",
              "payload":quickReplyPayloads.comeInLater,
            },{
              "content_type":"text",
              "title":"I'd Like to know more about you're business",
              "payload":postbackPayloads.findOutMore,
            }
          ]
        })
        break;
      }
    }
  }else

  // Check if the message contains text
  if (received_message.text) {    

    // Create the payload for a basic text message
    response = {
      "attachment": {
      "type":  "template",
      "payload":{
        "template_type": "button",
        "text":"What do you want to do?",
       
          "buttons": [{
            "type":"postback",
            "title":"A",
            "payload": "A",
          },
          {
            "type": "postback",
            "title": "B",
            "payload": "B",

          }],
      

      }

    }
  }
    
  } else if (received_message.attachments) {
  
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }

  
   
  
  // Sends the response message
  callSendAPI(sender_psid, response);  

}



// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  if(received_postback.quick_reply){
    let payload=received_postback.quick_reply.payload;
    switch(payload){
      case quickReplyPayloads.comeInNow:{
        response = ( {"text": "Ok. Checking if now's a good time"});
      }
      case quickReplyPayloads.comeInLater:{
        response = ({
          "text":"Ok how would you like to do that?",
          "quick_replies":[
            {
              "content_type":"text",
              "title":"Tell me when I can get through quickly 🏃🏾‍♀️💨",
              "payload":quickReplyPayloads.comeInNow
            },{
              "content_type":"text",
              "title":"I wanna plan a time I can come in ⌚🤔",
              "payload":quickReplyPayloads.comeInLater,
            },{
              "content_type":"text",
              "title":"I'd Like to know more about you're business",
              "payload":postbackPayloads.findOutMore,
            }
          ]
        })
        return;
      }
    }
  }

  // Get the payload for the postback
  let payload = received_postback.payload;
  
  // Set the response based on the postback payload
  if  (payload === postbackPayloads.getStarted){
    getStarted(sender_psid);
    return;
  }
  if (payload === 'A') {

    response = { "text": "Okay you picked 'A' " }
  } else if (payload === 'B') {
    response = { "text": "Okay you pikced 'B' " }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);


}


// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
// Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

		// Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
  
}



