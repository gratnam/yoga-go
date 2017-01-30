var session = OT.initSession(sessionId),
    publisher = OT.initPublisher("ME", { insertMode: "append", name: "participant" });

session.connect(apiKey, token, function(err, info) {
  if(err) {
    alert(err.message || err);
  }
  session.publish(publisher);
});

session.on('streamCreated', function(event) {

  console.log(event.stream.name)
  if(event.stream.name === 'host'){

    session.subscribe(event.stream, "publisher", { insertMode : "append" });
  }
  if(event.stream.name === 'participant'){
    session.subscribe(event.stream, "subscribers", { insertMode: "append" });
  }
  if(event.stream.name === 'lawyer'){
    session.subscribe(event.stream, "lawyers", { insertMode: "append" });
  }
});

session.on("signal", function(event) {
  console.log("Signal sent from connection " + event.from.id, event.data);
  // Process the event.data property, if there is any data.
  $('.well').append('<p>'+event.data+'</p>');
});
publisher.on("streamDestroyed", function(event) {
  console.log("DESTROY ALL HUMANS");
  $(".well").hide();
});

$(document).ready(function() {
  $(".disconnect").click(function (){
    session.disconnect();
  $(".well").hide();
  });
});