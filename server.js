// Dependencies
var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    OpenTok = require('opentok');

// Verify that the API Key and API Secret are defined
var apiKey = process.env.API_KEY,
    apiSecret = process.env.API_SECRET;
if (!apiKey || !apiSecret) {
  console.log('You must specify API_KEY and API_SECRET environment variables');
  process.exit(1);
}

// Initialize the express app
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Initialize OpenTok
var home, name, opentok, sessionId;
var startTok = function(){
  opentok = new OpenTok(apiKey, apiSecret);
  opentok.createSession({ mediaMode: 'routed' },function(err, session) {
      if (err) throw err;
      app.set('sessionId', session.sessionId);
      // We will wait on starting the app until this is done
    });
}

init();

app.get('/', function(req, res) {
  startTok();
  res.render('index.ejs');
});

app.post('/', function(req, res) {
    home = app.get('sessionId');
    name = '/name'+req.body.courtName;
    sessionId = app.get('sessionId');
});

app.get('/name/:name', function(req, res){
  sessionId = app.get('sessionId');
  res.render('name.ejs');
});

app.get('/host', function(req, res) {
  var sessionId = app.get('sessionId'),
      // generate a fresh token for this client
      token = opentok.generateToken(sessionId, { role: 'moderator' });

  res.render('host.ejs', {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token,
  });
});

// app.get('/stenographer', function(req, res) {
//   var sessionId = app.get('sessionId'),
//       // generate a fresh token for this client
//       token = opentok.generateToken(sessionId, { role: 'publisher' });

//   res.render('host.ejs', {
//     apiKey: apiKey,
//     sessionId: sessionId,
//     token: token,
//   });
// });

app.get('/lawyer', function(req, res) {
  var sessionId = app.get('sessionId'),
      // generate a fresh token for this client
      token = opentok.generateToken(sessionId, { role: 'publisher' });

  res.render('lawyer.ejs', {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token,

  });
});

app.get('/participant', function(req, res) {
  var sessionId = app.get('sessionId'),
      // generate a fresh token for this client
      token = opentok.generateToken(sessionId, { role: 'publisher' });

  res.render('participant.ejs', {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token,

  });
});

app.get('/history', function(req, res) {
  var page = req.param('page') || 1,
      offset = (page - 1) * 5;
  opentok.listArchives({ offset: offset, count: 5 }, function(err, archives, count) {
    if (err) return res.send(500, 'Could not list archives. error=' + err.message);
    res.render('history.ejs', {
      archives: archives,
      showPrevious: page > 1 ? ('/history?page='+(page-1)) : null,
      showNext: (count > offset + 5) ? ('/history?page='+(page+1)) : null
    });
  });
});

app.get('/download/:archiveId', function(req, res) {
  var archiveId = req.param('archiveId');
  opentok.getArchive(archiveId, function(err, archive) {
    if (err) return res.send(500, 'Could not get archive '+archiveId+'. error='+err.message);
    res.redirect(archive.url);
  });
});

app.post('/start', function(req, res) {
  var hasAudio = (req.param('hasAudio') !== undefined);
  var hasVideo = (req.param('hasVideo') !== undefined);
  var outputMode = req.param('outputMode');
  opentok.startArchive(app.get('sessionId'), {
    name: 'Node Archiving Sample App',
    hasAudio: hasAudio,
    hasVideo: hasVideo,
    outputMode: outputMode
  }, function(err, archive) {
    if (err) return res.send(500,
      'Could not start archive for session '+sessionId+'. error='+err.message
    );
    res.json(archive);
  });
});

app.get('/stop/:archiveId', function(req, res) {
  var archiveId = req.param('archiveId');
  opentok.stopArchive(archiveId, function(err, archive) {
    if (err) return res.send(500, 'Could not stop archive '+archiveId+'. error='+err.message);
    res.json(archive);
  });
});

app.get('/delete/:archiveId', function(req, res) {
  var archiveId = req.param('archiveId');
  opentok.deleteArchive(archiveId, function(err) {
    if (err) return res.send(500, 'Could not stop archive '+archiveId+'. error='+err.message);
    res.redirect('/history');
  });
});

// replace 3000 with process.env.PORT
function init() {
  app.listen(process.env.PORT, function() {
    console.log('Your app is now ready at http://localhost:'+process.env.PORT+'/');
  });
}