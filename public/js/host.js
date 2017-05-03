var session = OT.initSession(sessionId);
var archiveID = null;
var publisher = OT.initPublisher("publisher", { insertMode: "append", name: "host", disableAudioProcessing: true });

session.connect(apiKey, token, function(err, info) {
  if(err) {
    alert(err.message || err);
  } 
    console.log(info);
    session.publish(publisher);
});

var tokenBoot = {}
var userInfo = {}

OT.getAudioDevice(function(error, devices) {
  audioInputDevices = devices.filter(function(element) {
    return element.kind == "audioInput";
  });
  videoInputDevices = devices.filter(function(element) {
    return element.kind == "videoInput";
  });
  for (var i = 0; i < audioInputDevices.length; i++) {
    console.log("audio input device: ", devices);
  }
  for (i = 0; i < videoInputDevices.length; i++) {
    console.log("video input device: ", videoInputDevices[i].deviceId);
  }
});

var subHost;
var subLawyer;
var subPart;

session.on('streamCreated', function(event) {
  var ID = event.stream.streamId;
  var streamObj = event.stream;
  var chatObj = event.stream.connection;
  var box = '<div id = "' + ID + '"></div>';
  var boot = '<div class="input-group"><span class="'+ ID +' input-group-btn"><button class="btn btn-default" type="button">Boot</button> </span> <form id="DM'+ID+'"> <input type="text" class="form-control" id="DMtext'+ID+'" placeholder="Direct message..."> </form></div>';

  
  tokenBoot[event.target.token] = ID;
  userInfo[ID] = {'streamObj': streamObj,
    'chatObj': chatObj};

  if(event.stream.name === 'lawyer'){
    $("#lawyers").append(box);
    subLawyer = session.subscribe(event.stream, ID, { insertMode : "append" });

  }
  if(event.stream.name === 'participant'){
    $("#subscribers").append(box);
    subPart = session.subscribe(event.stream, ID, { insertMode: "append" });
    $("#" + ID).append(boot);
  }

  //force unpublish
  $("." + ID).click(function(){
    session.forceUnpublish($(this).parent().parent().attr('id'));
    $(this).parent().parent().remove();
  });

  //signal specific witness
  $('#DM' + ID).submit(function(event){
    event.preventDefault();
    var who = userInfo[ID].chatObj;
    session.signal({
      to: who,
      data: $('#DMtext'+ID).val()
    });
    $('#DMtext'+ID).val('')
  })
});

session.on('archiveStarted', function(event) {
  archiveID = event.id;
  console.log("ARCHIVE STARTED");
  $(".start").hide();
  $(".stop").show();
  disableForm();
});

session.on('archiveStopped', function(event) {
  archiveID = null;
  console.log("ARCHIVE STOPPED");
  $(".start").show();
  $(".stop").hide();
  enableForm();
});

//Stenographer messages + lawyer objections
session.on('signal:msg', function(event) {
  var msg = document.createElement('p');
  var d = new Date();

  if(event.data === 'Objection' && $('.sustained').html()===undefined ){
    event.data = 'Objection from lawyer: ' + event.from.connectionId;
    $('#lawyers').parent().parent().removeClass('panel-default').addClass('panel-danger');
    $('#sustained').append('<a class="sustained btn btn-success">Sustained</a><a class="overruled btn btn-danger">Overruled</a>');

    $('.sustained').click(function(){
      $('#lawyers').parent().parent().removeClass('panel-danger').addClass('panel-default');
      session.signal({
        type: 'msg',
        data: 'Sustained'
      }, function(error) {
        if (!error) {
          $('.sustained, .overruled').remove();
        }
      });
    });
    $('.overruled').click(function(){
      $('#lawyers').parent().parent().removeClass('panel-danger').addClass('panel-default');
      session.signal({
        type: 'msg',
        data: 'Overruled'
      }, function(error) {
        if (!error) {
          $('.overruled, .sustained').remove();
        }
      });
    });
  }

  msg.textContent = d.toUTCString() + ' : ' + event.data;
  msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
  $('#history').append(msg);
  msg.scrollIntoView();
});

session.on('connectionDestroyed', function(event) {
  $("#"+tokenBoot[event.target.token]).remove();
});

session.on('connectionCreated', function(event) {
  console.log(event);
});

$(document).ready(function() {
  $(".start").click(function (event) {
    var options = $(".archive-options").serialize();
    disableForm();
    $.post("/start", options).fail(enableForm);
  }).show();
  $(".stop").click(function(event){
    $.get("stop/" + archiveID);
  }).hide();
  $(".disconnect").click(function (){
    console.log('disconnect');
    session.disconnect();
  });
  $('.trans').click(function(){
    //Download text in court log box
    var content = $('#history').text();
    uriContent = "data:application/octet-stream," + encodeURIComponent(content);
    $('.trans').replaceWith('<a href="'+uriContent+'" class="trans navbar-link">Ready to download</a>');
  })

});

function disableForm() {
  $(".archive-options-fields").attr('disabled', 'disabled');
}
function enableForm() {
  $(".archive-options-fields").removeAttr('disabled');
}


// Stenographer Chat
var form = document.querySelector('#chat');
var msgTxt = document.querySelector('#msgTxt');

// Send a signal once the user enters data in the form
form.addEventListener('submit', function(event) {
  event.preventDefault();
  session.signal({
      type: 'msg',
      data: msgTxt.value
    }, function(error) {
      if (!error) {
        msgTxt.value = '';
      }
    });
});





