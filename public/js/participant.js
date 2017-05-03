var session = OT.initSession(sessionId),
    publisher = OT.initPublisher("ME", { insertMode: "append", name: "participant", disableAudioProcessing: true  });

session.connect(apiKey, token, function(err, info) {
  if(err) {
    alert(err.message || err);
  }
  session.publish(publisher);
});

var subHost;
var subLawyer;
var subPart;
session.on('streamCreated', function(event) {

  if(event.stream.name === 'host'){
    subHost = session.subscribe(event.stream, "publisher", { insertMode : "append", subscribeToAudio:true, subscribeToVideo:true});
  }
  // if(event.stream.name === 'participant'){
  //   subPart = session.subscribe(event.stream, "subscribers", { insertMode: "append" });
  // }
  if(event.stream.name === 'lawyer'){
    subLawyer = session.subscribe(event.stream, "lawyers", { insertMode: "append", subscribeToAudio:true, subscribeToVideo:false});
    subHost.subscribeToAudio(false);
  }
});

session.on("signal", function(event) {
  console.log("Signal sent from connection " + event.from.id, event.data);
  // Process the event.data property, if there is any data.
  $('.well').append('<p>'+event.data+'</p>');
});
publisher.on("streamDestroyed", function(event) {
  $(".well").hide();
});

$(document).ready(function() {
  $(".disconnect").click(function (){
    session.disconnect();
  $(".well").hide();
  });
});