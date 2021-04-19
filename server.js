// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
/* eslint-env es6 */

/*
 * Dependencies 
 */
const express = require('express');
const bodyParser = require('body-parser');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Square = require('./src/services/square.js'); 
const mySquare = new Square(2);;

 

 
function DebugServerConsole (vars)
{
  console.log( "MAIN SERVER :" + vars);
}



DebugServerConsole(`The area of mySquare is ${mySquare.area()}`);




//const library = require('./src/EscapeContent/library.js');

//let BarAppliances = require('./src/services/BarAppliances.js');


// Do
//module.exports.BarServices = require('./src/services');

//import {BarAppliances} from './src/services/BarAppliances.js';

//const services = require('src/services/services.js')

//import { Class1, Class2 } from './classes';
// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];


function filterById(jsonObject, id) {return jsonObject.filter(function(jsonObject) {return (jsonObject['ID'] == id);})[0];}


const barconfiguration = [
  {Name:"Good Beer", ID:"001",  State:"Closed"}, 
  {Name:"Better Bear Beer",ID:"002",  State:"Closed"}, 
  {Name:"A Beer", ID:"003", State:"Closed"}, 
  {Name:"Not Beer", ID:"004", State:"Closed"}, 
  {Name:"Any Beer", ID:"005", State:"Closed"}, 
  {Name:"Water", ID:"006", State:"Closed"}, 
  {Name:"Juice", ID:"007", State:"Closed"}, 
];
const recent_usage = {  "Tap":"001", "Door":"001"}


const doors_configuration = [
  {Name:"Front Door", ID:"001",  State:"Closed"}, 
  {Name:"Side Door", ID:"002",  State:"Closed"}, 
  {Name:"Men's Restroom",ID:"003",  State:"Closed"}, 
  {Name:"Women's Restroom", ID:"004", State:"Closed"}, 
];

const tables_configuration = [
  {Name:"Table 1", ID:"001",  State:"Inactive"}, 
  {Name:"Table 2", ID:"002",  State:"Inactive"}, 
]



const cubedirections = [
            {face: "L",slice: "M",rotate: "right"}, 
            {face: "C",slice: "M",rotate: "right"}, 
            {face: "R",slice: "M",rotate: "right"}, 
            {face: "B",slice: "S",rotate: "right"}, 
            {face: "C",slice: "S",rotate: "right"}, 
            {face: "F",slice: "S",rotate: "right"}, 
            {face: "U",slice: "E",rotate: "right"}, 
            {face: "C",slice: "E",rotate: "right"}, 
            {face: "D",slice: "E",rotate: "right"}
]; 


// import the cat module
//let cats = require('./cat');
//let Cat = cats.Cat;


//var barAppliances =   BarAppliances;

//var taps = barAppliances.getTaps();
/*
taps[0].Open();
taps[0].OgetState();
*/

let ShowState = false; 

/*
 * Config
 */
//const app = express();
const port = process.env.PORT || 8080;
app.use(express.static(`${__dirname}/public`));
app.use(express.static(`${__dirname}/Chat`));
app.use(bodyParser.json());

/*
 * User Routes
 */

app.get('/startshow', (req, res) => {
  ShowState = true; 
  
  io.emit('show-control', "startshow");
   res.send('Starting the Show')
});
app.get('/endshow', (req, res) => {
  ShowState = false; 
   res.send('ending the Show')
});

app.get('/checkshowstatus', (req, res) => {
   res.send('' + ShowState)
});

app.get('/enroll', (req, res) => {
   res.send('enrolled')
}); 

 

/*
 * User Routes
 */

app.get('/', (req, res) => {
  res.sendfile('views/index.html');
});


const basicRequests = [
 {value:"/BarConfiguration", content:barconfiguration}, 
 {value:"/DoorsConfiguration", content:doors_configuration}, 
 {value:"/TablesConfiguration", content:tables_configuration}, 
 {value:"/RecentUsage", content:recent_usage}, 
 {value:"/dreams", content:dreams},
   
]; 
basicRequests.forEach(element => {
  //console.log(element);
  app.get(element.value, (request, response) => {
      // express helps us take JS objects and send them as JSON
      response.json(element.content);
    });
});



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


//------- ==========-------  SHOW SEQUENCES ==========------- ==========------=

const ShowSessionClass = require('./src/services/showsession.js');
const GroupsClass = require('./src/services/groups.js');
const PerformerGroupsClass = require('./src/services/performergroups.js');
const SectionsManagerClass = require('./src/services/sectionsmanager.js');
const StagesManagerClass = require('./src/services/stagesmanager.js');

//mySectionsManager.join(arg); 
const myGroups = new GroupsClass(0);
const myStagePerformersGroups = new PerformerGroupsClass(0);
const mySectionsManager = new SectionsManagerClass(0);
const myStagesManager = new StagesManagerClass(0); 
var activeShowSessions = [];
var activeShowSessionsRef = []; 

function CreateNewShowSession (ID)
{
  
  var myShowSession = new ShowSessionClass(ID);
  activeShowSessions.push({"ID":ID, "State":myShowSession.getState()}); 
  activeShowSessionsRef.push({"ID":ID, "State":"", "session":myShowSession}); 
//  myShowSession.getState();
  
  myShowSession.on( 'ShowStateChange', (arg) => {
    
      DebugServerConsole(JSON.stringify(arg)); 
      mySectionsManager.join(arg); 
  
     // console.log('myShowSession -- ShowStateChange');
      io.in("show"+ID).emit('show-state-change', " ");
    
     // activeShowSessions[ID]["State"] = myShowSession.getState(); 

});  
  
  myShowSession.Go();

}

myStagesManager.getState().forEach(element => {
  
 
  for (var i=1; i<=element.scale; i++)
  {
    
   var  url = "/Stages/"+element.Name+i; 
    //element.SectionTroupe
   var Scenes = mySectionsManager.troupeScene[element.SectionTroupe]; 
   var StageScenes = mySectionsManager.Stages[element.id]; 
    
    var StageSceneNames = [];
    
     StageScenes.forEach(element => {
         StageSceneNames.push(mySectionsManager.ShowStructure[element]["ID"]); 
     });
    
    var SceneNames =  [];
     Scenes.forEach(element => {
         SceneNames.push(mySectionsManager.ShowStructure[element]["ID"]); 
     });
    //console.log(url);
    var responses =  {"Stage-Name" :element.Name, "Troupe":element.SectionTroupe, "Troupe-Sections":SceneNames,  "Stage-Sections":StageSceneNames};   
  app.get(url, (request, response) => {
     // console.log(activeShowSessionsRef);
      // express helps us take JS objects and send them as JSON
    
      response.json( responses );// activeShowSessionsRef [element.content].session.getState()); // element.content.getState());
    });
  }
});

app.get('/ActiveStages' , (req, res) => {
  
  
   res.json(myStagePerformersGroups.getGroups()); 
  

});

app.get('/Stages', (req, res) => {
   res.json(myStagesManager.getState()); 
});

var ID = 0; 
var ShowStateRequests = [];
for (ID=0; ID<50; ID++)
  {
 
    ShowStateRequests.push({value:"/ShowState"+ID, content:ID}); 
  }
 
ShowStateRequests.forEach(element => {
 // console.log(element);
  app.get(element.value, (request, response) => {
      //console.log(activeShowSessionsRef);
      // express helps us take JS objects and send them as JSON
   var  responseVals = activeShowSessionsRef [element.content].session.getState(); 
    var withStageID = 
        mySectionsManager.ShowStructure[
        mySectionsManager.Structure[responseVals.ID]["id"] ].stages; 
     // console.log(withStageID[0]); 
       var  currentStage = myStagesManager.getState()[withStageID[0]]; 
      if (currentStage){ 
       var withStage =  {"Name":currentStage.Name, "ID":withStageID[0]};
  
        responseVals["WithStage"] = withStage; 
      }
    else responseVals["WithStage"] = {};
    
      response.json( responseVals); // element.content.getState());
    });
});


var PulseTimeout = null; 
var AttractionRunning = false; 
const StartPulseRate = 500; 
const PulseRate = 15000; 
const NumberOfShows = 48;   
var CurrentShow = 0;  
function PulseShow() 
{
  if (AttractionRunning)
    {
        DebugServerConsole(`Pulsing Show ${CurrentShow}, next show will start in ${PulseRate}`);
        CreateNewShowSession (CurrentShow);  

        CurrentShow += 1; 
        if (CurrentShow <NumberOfShows )
        {
             PulseTimeout =  setTimeout(PulseShow, PulseRate, 0);
       }
    }
   
}
function StartAttraction ()
{ 
  
  DebugServerConsole("StartAttraction")
  if (!AttractionRunning)
    {
      AttractionRunning = true;
      
      cacheAttractionState (); 
      EmitAttractionState(); 
     PulseTimeout = setTimeout(PulseShow, StartPulseRate, 0);
      
      
    }  
  

}
function StopResetAttraction ()
{
  DebugServerConsole("StopAttraction")
  
    if (PulseTimeout ) clearTimeout(PulseTimeout ); 
  AttractionRunning = false;
  CurrentShow = 0; 
   
   
      console.log(activeShowSessionsRef);
   
  mySectionsManager.reset();
  
  activeShowSessionsRef.forEach(element => {  if ( element["session"] ) {element["session"].StopClock(); delete element["session"];} }); 
  activeShowSessions = [];
  activeShowSessionsRef = [];
  
  
  
}

var CachedAttractionState = ""; 
function cacheAttractionState ()
{ 
    
      CachedAttractionState = getFullAttractionState () ; 
       DebugServerConsole("cacheAttractionState"); 
}
  function EmitAttractionState ()
{ 
    //DebugServerConsole("EmitAttractionState"); 
      io.in("controllers").emit('cacheAttractionState', CachedAttractionState);
    
     
  if (AttractionRunning)
    {
      setTimeout(EmitAttractionState, 1000);
    }
}
cacheAttractionState (); 

//var myShowSession = new ShowSessionClass(-1);
function getFullAttractionState ()
{
  //DebugServerConsole("NumberOfShows" + NumberOfShows);
  return {'NumberOfShows':NumberOfShows, 
          'ActiveShows':CurrentShow, 
         'ShowStructure': mySectionsManager.getShowStructure(), 
          'ShowsProgress': activeShowSessions, 
          'Groups': myGroups.getGroups(), 
          'SectionsManager':mySectionsManager.getSections(), 
           'PerformersManager':myStagePerformersGroups.getGroups(), 
         }
}
 
  
var AttractionStateRequests = [
 {value:"/FullAttractionState"}, 
  
]; 
AttractionStateRequests.forEach(element => {
  //console.log(element);
  app.get(element.value, (request, response) => {
      // express helps us take JS objects and send them as JSON
     // response.json(CachedAttractionState);//  getFullAttractionState());
      response.send(CachedAttractionState);//  getFullAttractionState());
    });
});

var marker = 0; 

function EmitPhrasePulse()
{
  
  io.emit("phrasePulse", {"marker":marker}); 
  marker = marker+=1; 
 if (marker > 5) marker = 0;
  setTimeout(EmitPhrasePulse, 500);
};
  setTimeout(EmitPhrasePulse, 500);
  
  
 var tryPhrase = 0;

io.on('connection', (socket) => {
  DebugServerConsole('a user connected');
  
  socket.on('join-controllers', (msg) => 
 {
    //{"ShowID":ShowID,"GroupID":GroupID,"PlayerID":PlayerID}
    DebugServerConsole('join the show'); 
    socket.join("controllers"); 
}); 
  
    socket.on('joinsillygame', (msg) => 
 {
  
    socket.emit('setPhrase',{"tryPhrase":tryPhrase, "marker":marker}); 
      tryPhrase += 1; 
     if (tryPhrase > 5) tryPhrase = 0;
  }); 
  
  
  socket.on('performer-join-show', (msg) => 
 {
    //{"ShowID":ShowID,"GroupID":GroupID,"PlayerID":PlayerID}
  //  {"StageName":"AssistanceFacilitatorStage","PerformerID":"2"}
    myStagePerformersGroups.join( msg); 
    var joinChannel = "PerformerStage-"+msg["StageName"]+msg["PerformerID"]; 
     socket.join(joinChannel); 
   // socket.join("show"+msg["ShowID"]+"_group"+msg["GroupID"]); 
    DebugServerConsole(`Stage Performer Joined Show : ${JSON.stringify(msg)} : ${joinChannel}`); 
    
    
      io.in(joinChannel).emit('channel-change', joinChannel);
    
    
    // check if your room isn't undefined.
//if (io.sockets.adapter.rooms["show"+msg["ShowID"]]) 
{
   // result
}
    
    //https://socket.io/docs/v3/rooms/
    
  });
  
  socket.on('join-show', (msg) => 
 {
    //{"ShowID":ShowID,"GroupID":GroupID,"PlayerID":PlayerID}
    
    myGroups.join( msg); 
    socket.join("show"+msg["ShowID"]); 
    socket.join("show"+msg["ShowID"]+"_group"+msg["GroupID"]); 
    DebugServerConsole(`Player Joined Show : ${JSON.stringify(msg)}`); 
    
    // check if your room isn't undefined.
//if (io.sockets.adapter.rooms["show"+msg["ShowID"]]) 
{
   // result
}
    
    //https://socket.io/docs/v3/rooms/
    
  });
  
  socket.on('leave-show', (msg) => 
 {
    
    myGroups.leave( msg); 
    socket.leave("show"+msg["ShowID"]); 
    var leaving = "show"+msg["ShowID"]+"_group"+msg["GroupID"]; 
    socket.leave(leaving); 
    DebugServerConsole(`Player Left Show : ${JSON.stringify(msg)}`); 
    
  });
  
  
  
   socket.on('show-scene-message', (msg) => {
    
    //DebugServerConsole(msg);
    
      io.emit('show-control', msg);
  });
  
  
  
// ------- ==========------- ==========------- ==========------- ==========
  
  socket.on('disconnect', () => {
    DebugServerConsole('user disconnected');
      });
  
  socket.on('control-message', (msg) => {
    
    //DebugServerConsole(msg);
    
      io.emit('show-control', msg);
  });
  
  const stateEvents = [{value:'opentap', command:"Open", Type:"Tap", configuration:barconfiguration}, 
                       {value:'closetap', command:"Closed", Type:"Tap", configuration:barconfiguration},
                       {value:'opendoor', command:"Open", Type:"Door", configuration:doors_configuration },
                       {value:'closedoor', command:"Closed", Type:"Door", configuration:doors_configuration},
                       {value:'enabletable', command:"Active", Type:"Table", configuration:tables_configuration},
                       {value:'disabletable', command:"Inactive", Type:"Table", configuration:tables_configuration}];
  
  stateEvents.forEach(element => {  
   //  DebugServerConsole(element);   
    
      socket.on(element.value, (msg) => { 
        DebugServerConsole(element.value); 
       var object_configuration = element.configuration;/// (element.Type == "Door") ?  doors_configuration  : barconfiguration ; 
        
        
        var selectedObject = filterById(object_configuration, msg);
        selectedObject.State = element.command;    
        if ( element.command == "Open"){
           DebugServerConsole(element.command); 
           DebugServerConsole(recent_usage); 
          recent_usage [ element.Type]  = msg; }
        io.emit('show-control', {"command":element.command, "id":msg, "Type":element.Type});
  });
    
    
  });
  
  socket.on('opentap', (msg) => {
    //DebugServerConsole("aopentap")
    //StartAttraction (); 
    
      setTimeout(StartAttraction, 10);
    
    var number = parseInt(msg, 10);
    io.emit('cube-control', cubedirections[number]);
    
    
  });
  
   socket.on('closetap', (msg) => {
    //DebugServerConsole("aopentap")
    //StopResetAttraction (); 
     
      setTimeout(StopResetAttraction, 10);
   
    
  });


    

});

http.listen(process.env.PORT || port, () => {
  DebugServerConsole('listening on *:3000');
});
 


function myFunc(arg) {
  DebugServerConsole(`arg was => ${arg}`);
  
if (arg < cubedirections.length)
  {
  }
  else arg = 0;
  
  io.emit('cube-control', cubedirections[arg]);
  //setTimeout(myFunc, 5000, arg+1);
}

//setTimeout(myFunc, 1500, 0);


/*
 * Listen
 */
//app.listen(process.env.PORT || port);
DebugServerConsole(`app listening on port ${port}`);
DebugServerConsole(`aOK`);
 