// client-side js, loaded by index.html
// run by the browser each time the page is loaded

console.log("hello world :o");

//require("./js/helper-modules")

createElement("div");
/*createElement("a",{"href":"http://google.com","style":"color:#FFF;background:#333;"},"google");`

var google = createElement("a",{"href":"http://google.com"},"google"),
    youtube = createElement("a",{"href":"http://youtube.com"},"youtube"),
    facebook = createElement("a",{"href":"http://facebook.com"},"facebook"),
    links_conteiner = createElement("div",{"id":"links"},[google,youtube,facebook]);

*/
// define variables that reference elements on our page
const dreamsList = document.getElementById("dreams");
const dreamsForm = document.querySelector("form");


/**
 * Convert (milli)seconds to time string (hh:mm:ss[:mss]).
 *
 * @param Boolean isSec
 *
 * @return String
 */
Number.prototype.toTime = function(isSec) {
    var ms = isSec ? this * 1e3 : this,
        lm = ~(4 * !!isSec),  /* limit fraction */
        fmt = new Date(ms).toISOString().slice(11, lm);

    if (ms >= 8.64e7) {  /* >= 24 hours */
        var parts = fmt.split(/:(?=\d{2}:)/);
        parts[0] -= -24 * (ms / 8.64e7 | 0);
        return parts.join(':');
    }

    return fmt;
};


  var group_selectedIndex =  ""; // dreamsForm.elements.group.selectedIndex ; 
  
  var player_selectedIndex =  ""; //dreamsForm.elements.player.selectedIndex ; 
  
   var group_selectedName =  ""; // dreamsForm.elements.group[group_selectedIndex].text; // "AssistanceFacilitatorStage"; 
  var player_selectedID =  ""; // dreamsForm.elements.player[player_selectedIndex].text;// "1"
  

function JoinSession(group_selectedIndex_l, group_selectedName_l, player_selectedIndex_l, player_selectedID_l)
{
  
  socket.emit('performer-leave-show', {"StageName":group_selectedName,"PerformerID":player_selectedID}); 
  group_selectedIndex = group_selectedIndex_l; 
  player_selectedIndex = player_selectedIndex_l;
  group_selectedName = group_selectedName_l; 
  player_selectedID = player_selectedID_l; 
  
  socket.emit('performer-join-show', {"StageName":group_selectedName,"PerformerID":player_selectedID} ); 
 //GetShowState(ShowID, GroupID, PlayerID);
 
  
}
 var Stagestrings_a = [];
function EnterRoom()
{
  
  JoinSession(dreamsForm.elements.group.selectedIndex,
              dreamsForm.elements.group[dreamsForm.elements.group.selectedIndex].text, 
             dreamsForm.elements.player.selectedIndex , 
              dreamsForm.elements.player[dreamsForm.elements.player.selectedIndex].text);// "1"
  
  
 fetch ("../Stages/"+group_selectedName+player_selectedID)
   .then(response => response.json()) // parse the JSON from the server
  .then(dreams => 
  {
   console.log(dreams);
   
   //{"Stage-Name":"AssistanceFacilitatorStage","Troupe":"0","Troupe-Sections":["0 - Arrivals"],"Stage-Sections":["0 - Arrivals"]}
   
   /*
   
  var showID = strings.ID; 
  var time = strings.Time; 
  var timeRemaining = strings.TimeRemaining; 
  
   */ 
   
   
   
  BarConfiguration.innerHTML = "" ; 
   
  var label = createElement("label",{"class":""}, dreams["Stage-Name"] + " : " + player_selectedID),
    div = createElement("div",{"class":"", "id":"CurrentState"}),
    newListItem = createElement("div",{"id":"CurrentStateDiv", "class":"sectionclass"},[label,div]);
   
  BarConfiguration.appendChild(newListItem);
   
   var Troupestrings = [];
     dreams["Troupe-Sections"].forEach(element => {
         Troupestrings.push(createElement("label",{"class":""}, element)); 
     });
   label = createElement("label",{"class":""}, "Troupe-Sections"),
    div = createElement("div",{"class":"listclass", "id":"TroupeState"},Troupestrings),
     
  newListItem = createElement("div",{"id":"TroupeDiv", "class":"sectionclass"},[label,div]);
    
  BarConfiguration.appendChild(newListItem);
   
   Stagestrings_a = []; 
   var  Stagestrings = [];
     dreams["Stage-Sections"].forEach(element => {
         Stagestrings.push(createElement("label",{"class":""}, element)); 
         Stagestrings_a.push(element); 
     });
   label = createElement("label",{"class":""}, "Stage-Sections"),
    div = createElement("div",{"class":"listclass", "id":"StageState"}, Stagestrings), 
  newListItem = createElement("div",{"id":"StagesDiv", "class":"sectionclass"},[label,div]);
   
  BarConfiguration.appendChild(newListItem);
 }); 
  
  
}





function doSomething () 
{
  var selectedIndex = dreamsForm.elements.group.selectedIndex ; 
 var mySelect = dreamsForm.elements.player; 
  for (var val in mySelect.options) { mySelect.options.remove(0); }

  var scale = StagesResponse[selectedIndex].scale; 
    for(var i=1; i<=scale; i++)
      {
        var option = document.createElement("option");
        option.text = i; 
        mySelect.add(option);
      }; 
  
}
var StagesResponse = {}; 

// fetch the initial list of dreams
fetch("/Stages")
  .then(response => response.json()) // parse the JSON from the server
  .then(stagesresponse => {
  
  StagesResponse = stagesresponse; 
  
 var mySelect = dreamsForm.elements.group;

  
  stagesresponse.forEach( element => { 
  
      var option = document.createElement("option");
      option.text = element["Name"];
    option.value = element["id"]; 
        mySelect.add(option);
}); 
   //stagesresponse.forEach 
   
  
  //  });
   
  });




const BarConfiguration = document.getElementById("BarConfiguration");
const DoorsConfiguration = document.getElementById("DoorsConfiguration");
const TablesConfiguration = document.getElementById("TablesConfiguration");


const tapstrings = { id:"tap-", initalLabel:"Open Tap", state:"Open", altLabel:"Close Tap", class:"tapLabel", div_class:"tap" ,  emitAlt:"closetap", emitBase:"opentap"}

const doorstrings = { id:"door-", initalLabel:"Open Door", state:"Open", altLabel:"Close Door", class:"tapLabel", div_class:"tap" ,  emitAlt:"closedoor", emitBase:"opendoor"}
const tablestrings = { id:"table-", initalLabel:"Enter Table", state:"Active", altLabel:"Leave Table", class:"tapLabel", div_class:"tap" ,  emitAlt:"disabletable", emitBase:"enabletable"}

// a helper function that creates a list item for a given dream
function appendNewElement(tap, strings, DivConfiguration) {
  
  var tapID = strings.id + tap.ID;
  var tapIDStatus = tapID + "Status"
  var LabelText = strings.initalLabel ; 
  if (tap.State == strings.state) LabelText = strings.altLabel ;
var label = createElement("label",{"class":strings.class}, tap.Name),
    div = createElement("div",{"class":"status_"+tap.State, "id":tapIDStatus}),
    button = createElement("button",{"type":"submit","id":"button-"+tapID},LabelText),
    newListItem = createElement("div",{"id":tapID, "class":strings.div_class},[label,div,button]);
  
  DivConfiguration.appendChild(newListItem);
  var taptapName = '#button-'+tapID; 
     $(taptapName).click(function(){
       var textContent = $(taptapName).text()  ; 
      if  (textContent == strings.altLabel)
        socket.emit(strings.emitAlt, tap.ID); 
     else  socket.emit(strings.emitBase, tap.ID);
    });
  
  }
function appendNewTable(tap) {
  appendNewElement(tap, tablestrings, TablesConfiguration);
  }

function appendNewTap(tap) {
  appendNewElement(tap, tapstrings, BarConfiguration);
  }
function appendNewDoor(tap) {
  appendNewElement(tap, doorstrings, DoorsConfiguration);
}



// a helper function that creates a list item for a given dream
function appendShowState( strings, DivConfiguration) {
  
  var showID = strings.ID; 
  var time = strings.Time; 
  var timeRemaining = strings.TimeRemaining; 
  //var LabelText = strings.initalLabel ; 
 // if (tap.State == strings.state) LabelText = strings.altLabel ;
var label = createElement("label",{"class":""}, showID),
    div = createElement("div",{"class":"", "id":"CurrentState"}),
    //button = createElement("button",{"type":"submit","id":"button-"+tapID},LabelText),
    newListItem = createElement("div",{"id":"CurrentStateDiv", "class":""},[label,div]);
  DivConfiguration.innerHTML = "" ; 
  DivConfiguration.appendChild(newListItem);
 /* var taptapName = '#button-'+tapID; 
     $(taptapName).click(function(){
       var textContent = $(taptapName).text()  ; 
      if  (textContent == strings.altLabel)
        socket.emit(strings.emitAlt, tap.ID); 
     else  socket.emit(strings.emitBase, tap.ID);
    });*/
  
  }

function GetShowState(ShowID, GroupID, PlayerID){
fetch("/ShowState"+ShowID)
  .then(response => response.json()) // parse the JSON from the server
  .then(BarConfigurationResponse => {
 // appendShowState(BarConfigurationResponse, BarConfiguration);  
  console.log(BarConfigurationResponse);
 
  });
}



  socket.emit('join-controllers', {"ControllerID":"12"}); 
var currentShow = -1; 

const DreamsConfiguration = document.getElementById("DreamConfiguration");

  socket.on('cacheAttractionState', function(msg) {
    
   // Rebuild(msg); 
    
    
    console.log('cacheAttractionState');
    console.log(msg);
    //console.log();
    var values = msg["SectionsManager"][Stagestrings_a[0]]["CurrentShows"]; 
   // console.log(values);//]
    var Message = "Currently With Show : " + values; 
    if (currentShow != values[0])
      {
        currentShow = values[0]; 
        window.StartUp("show"+currentShow, "admin-lounge");
     
   document.getElementById("video").classList.remove('animate__animated');
   document.getElementById("video").classList.remove('animate__bounce');
   document.getElementById("video").classList.add('animate__animated');
   document.getElementById("video").classList.add('animate__bounce');
        
      }
    var label = createElement("label",{"class":""}, Message),
    div = createElement("div",{"class":"", "id":"CurrentState"}),
    //button = createElement("button",{"type":"submit","id":"button-"+tapID},LabelText),
    newListItem = createElement("div",{"id":"CurrentStateDiv", "class":""},[label,div]);
    DreamsConfiguration.innerHTML = "" ; 
    DreamsConfiguration.appendChild(newListItem);
    
  
   });

 
socket.on('channel-change', function(msg) {
   console.log('channel-change');
   console.log(msg);
     //   GetShowState(ShowID, GroupID, PlayerID);
  
  });


 
socket.on('show-state-change', function(msg) {
   console.log(msg);
        GetShowState(ShowID, GroupID, PlayerID);
  
  });





var ShowID= ""; 
var GroupID= ""; 
var PlayerID = ""; 


    // listen for the form to be submitted and add a new dream when it is
dreamsForm.addEventListener("submit", event => {
      // stop our form submission from refreshing the page
      event.preventDefault();
  
      EnterRoom(); 
  
    });





/*

 socket.on('show-control', function(msg) {
        
   //$().
   console.log(msg);
   
   var TapID = "tap-"+msg.id+"Status"; 
   var TapIDButton = "button-tap-"+msg.id; 
   var className = "status_"+ msg.command;
   var NewCommand =  "Close"; 
   if (msg.command == "Closed" ) NewCommand = "Open";
 
   if (msg.Type  == "Door") { 
     TapID = "door-"+msg.id+"Status"; 
      TapIDButton = "button-door-"+msg.id; 
   }
   else if (msg.Type  == "Table") { 
     TapID = "table-"+msg.id+"Status"; 
      TapIDButton = "button-table-"+msg.id; 
      if (msg.command == "Active" ){ NewCommand = "Leave"; className =  "status_Active"; }
         else {NewCommand = "Enter";className =  "status_Inactive";}
   }
   document.getElementById(TapID).setAttribute("class", className);
   document.getElementById(TapIDButton).textContent = NewCommand +" " + msg.Type  ;
   
//    button = createElement("button",{"type":"submit","id":"open-"+tapID},"Open Tap"),
   
      //var TapDiv =  BarConfiguration
      //console.log(TapDiv);
    
      });

  
*/

   // ${viewingSharedScreen || sharingScreen ? 'Open' : 'Close'
   
// const cameraSubscriberClass =
  //    `video-container ${!activeCameraSubscribers ? 'hidden' : ''} active-${activeCameraSubscribers} ${viewingSharedScreen || sharingScreen ? 'small' : ''}`;
  
  