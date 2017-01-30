var session = OT.initSession(sessionId),
    publisher = OT.initPublisher("lawyers", { insertMode: "append", name: "lawyer" }),
    archiveID = null;

session.connect(apiKey, token, function(err, info) {
  if(err) {
    alert(err.message || err);
  }
  session.publish(publisher);
});

session.on('streamCreated', function(event) {
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


  //signal specific witness
  $('.object').click(function(event){
    event.preventDefault();
    session.signal({
      type: 'msg',
      data: 'Objection'
    }, function(error) {
      if (!error) {
      }
    });
  })


$(document).ready(function() {
  $(".disconnect").click(function (){
    session.disconnect();
  });
});