var session = OT.initSession(sessionId),
    publisher = OT.initPublisher("lawyers", { insertMode: "append", name: "lawyer", disableAudioProcessing: true }),
    archiveID = null;

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
    subHost = session.subscribe(event.stream, "publisher", { insertMode : "append" });
  }
  // if(event.stream.name === 'participant'){
  //   subPart = session.subscribe(event.stream, "subscribers", { insertMode: "append" });
  // }
  // if(event.stream.name === 'lawyer'){
  //   subLawyer = session.subscribe(event.stream, "lawyers", { insertMode: "append" });
  // }
});

session.on('connectionCreated', function(event) {
  console.log(event);
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

