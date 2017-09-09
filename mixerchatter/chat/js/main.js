////////////////////
// Helper Functions
///////////////////
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

// Get User ID & start it up
var username = getUrlParameter('username');
$.getJSON( "https://Mixer.com/api/v1/channels/"+username, function( data ) {
  userID = data.id;
  userPartner = data.partnered;
  if (userPartner === true){
    subIcon = data.badge.url;
  } else {
    subIcon = "";
  }

  // Get chat endpoints after getting user ID.
  $.getJSON( "https://Mixer.com/api/v1/chats/"+userID, function( data ) {
    var endpoints = data.endpoints
    mixerSocketConnect(endpoints);
  });
});

// General Settings
var chatTime = getUrlParameter('timer');
timeToShowChat = chatTime; // in Milliseconds
var direction = getUrlParameter('dir');
chatDirection = direction || 'bottom'; // 'top' = top to bottom

// initialization
function initialize() {
  var sheet = $("#dynamic-css").get(0).sheet;
  if(chatDirection == 'top') {
    var style = '.chat{ top: 0px; }';
  } else if(chatDirection == 'bottom') {
    var style = '.chat{ bottom: 0px; }';
  }
  sheet.insertRule(style, 0);
}

// CHAT
// Connect to mixer Websocket
function mixerSocketConnect(endpoints){
    if ("WebSocket" in window){

       // Let us open a web socket
       var randomEndpoint = endpoints[Math.floor(Math.random()*endpoints.length)];
       var ws = new ReconnectingWebSocket(randomEndpoint);
       console.log('Connected to '+randomEndpoint);

       ws.onopen = function(){
          // Web Socket is connected, send data using send()
          var connector = JSON.stringify({type: "method", method: "auth", arguments: [userID], id: 1});
          ws.send(connector);
          console.log('Connection Opened...');
          var html = "<div class='chatmessage' id='1'>Chat connection established to "+username+".</div>";
          addToScreen(html, 5000);

          // Error Handling & Keep Alive
          setInterval(function(){
            errorHandle(ws);
          }, 10000)
       };

       ws.onmessage = function (evt){
        chat(evt);

        // Debug - Log all chat events.
        // console.log(evt);
       };

       ws.onclose = function(){
          // websocket is closed.
          console.log("Connection is closed...");
       };

    }else{
       // The browser doesn't support WebSocket
       console.error("Woah, something broke. Abandon ship!");
    }
}
// Chat Messages
function chat(evt){
    var evtString = $.parseJSON(evt.data);
    var eventType = evtString.event;
    var eventMessage = evtString.data;

    if (eventType == "ChatMessage"){
        var username = eventMessage.user_name;
        var userrolesSrc = eventMessage.user_roles;
    var userroles = userrolesSrc.toString().replace(/,/g, " ");
      var usermessage = eventMessage.message.message;
      var messageID = eventMessage.id;
      var completeMessage = "";

        $.each(usermessage, function() {
          var type = this.type;

          if (type == "text"){
            var messageTextOrig =  this.data;
            var messageText = messageTextOrig.replace(/([<>&])/g, function (chr) {
                return chr === "<" ? "&lt;" : chr === ">" ? "&gt;" : "&amp;";
            });
            completeMessage += messageText;
          } else if (type == "emoticon"){
            var emoticonSource = this.source;
            var emoticonPack = this.pack;
            var emoticonCoordX = this.coords.x;
            var emoticonCoordY = this.coords.y;
            if (emoticonSource == "builtin"){
              completeMessage += '<div class="emoticon" style="background-image:url(https:\/\/Mixer.com/_latest/emoticons/'+emoticonPack+'.png); background-position:-'+emoticonCoordX+'px -'+emoticonCoordY+'px; height:24px; width:24px; display:inline-block;"></div>';
            } else if (emoticonSource == "external"){
            completeMessage += '<div class="emoticon" style="background-image:url('+emoticonPack+'); background-position:-'+emoticonCoordX+'px -'+emoticonCoordY+'px; height:24px; width:24px; display:inline-block;"></div>';
            }
          } else if (type == "link"){
            var chatLinkOrig = this.text;
            var chatLink = chatLinkOrig.replace(/(<([^>]+)>)/ig, "");
            completeMessage += chatLink;
          } else if (type == "tag"){
            var userTag = this.text;
            completeMessage += userTag;
          }
      });

        // Place the completed chat message into the chat area.
        // Fade message in, wait X time, fade out, then remove.
        var html = "<div class='chatmessage' id='"+messageID+"'><div class='chatusername "+userroles+"'>"+username+" <div class='badge'><img src="+subIcon+"></div></div> "+completeMessage+"</div>";
        addToScreen(html);

    } else if (eventType == "ClearMessages"){
      // If someone clears chat, then clear all messages on screen.
      $('.chatmessage').remove();
    } else if (eventType == "DeleteMessage"){
      // If someone deletes a message, delete it from screen.
      $('#'+eventMessage.id).remove();
    }
}

function addToScreen(html, duration) {
  duration = duration || timeToShowChat; // optional parameter
  var elem = $(html).appendTo('.chat');

  if (duration != '0') {
    elem.hide().fadeIn('fast').delay(duration).fadeOut('fast', function(){ $(this).remove(); });
  }
}

// Error Handling & Keep Alive
function errorHandle(ws){
  var wsState = ws.readyState;
  if (wsState !== 1){
    // Connection not open.
    console.log('Ready State is '+wsState);
  } else {
    // Connection open, send keep alive.
    ws.send('{"type": "method", "method": "ping", "arguments": [], "id": 12}');
  }
}
