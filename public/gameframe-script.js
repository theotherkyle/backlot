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



// a helper function that creates a list item for a given dream
function appendNewDream(dream) {
  const newListItem = document.createElement("li");
  newListItem.innerText = dream;
  dreamsList.appendChild(newListItem);
}



const BarConfiguration = document.getElementById("BarConfiguration");

const StateConfiguration =  document.getElementById("StateConfiguration");
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

  // a helper function that creates a list item for a given dream
function appendNewDoor(tap) {
  
  appendNewElement(tap, doorstrings, DoorsConfiguration);
  
  
  
      
   
 // var newListItem = createElement("div",{"id":"name"},tap.Name);
  
  
  /*
    <div class="tap" id="tap-000">
           <label>Good Beer</label>
          <div class="status"> </div>
          <button type="submit" id="open-tap-000">Open Tap</button>
        </div>
        */
}



// a helper function that creates a list item for a given dream
function appendShowState( strings, DivConfiguration) {
  
  var showID = strings.ID; 
  var time = strings.Time; 
  var timeRemaining = strings.TimeRemaining; 
var label = createElement("label",{"class":""}, showID),
    div = createElement("div",{"class":"", "id":"CurrentState"}),
    newListItem = createElement("div",{"id":"CurrentStateDiv", "class":""},[label,div]);
  DivConfiguration.innerHTML = "" ; 
  DivConfiguration.appendChild(newListItem);
  
var showIDUrl = showID.replace(/\s+/g, '');
  SetSceneTemplate(showIDUrl); 
  
  
  
  
  }


function SetSceneTemplate(showIDUrl)
{
  
   
  //fetch()
  fetch("/scenetemplates/"+showIDUrl+".html")
 .then(response => response.text()) // parse the JSON from the server
  .then(response => {
        
        var  test_sceneTemplate = document.getElementById("test-scenetemplate");

             // testvideocontainer.innerHTML = response; 

                setHTML(test_sceneTemplate, response, true);


        });
}


function GetShowState(ShowID, GroupID, PlayerID){
fetch("/ShowState"+ShowID)
  .then(response => response.json()) // parse the JSON from the server
  .then(BarConfigurationResponse => {
  
  if(BarConfigurationResponse["Error"])
    {
    console.log("This Show Hasn't Started Yet");
      
       SetSceneTemplate("0-NoShow"); 
  
      
      
      
    }
  else 
    {    
  appendShowState(BarConfigurationResponse, BarConfiguration);  
  console.log(BarConfigurationResponse);
      
    }
  

  });
}
var visitedRooms = []; 
function GoIntoRoom(roomID, floorData)
{
  
    var roomLabels = []; 
  var roomInfo = floorData[roomID]; 
  visitedRooms.push(roomID);
  var label_roomName = createElement("label",{"class":"room-label"}, roomInfo.name );
   roomLabels.push(label_roomName); 
    roomInfo.connections.forEach(function(connection)
       {  
      if (!visitedRooms.includes(connection))
        {
          // roomLabels.push(
            roomLabels.push(createElement("div",{"class":"line"}, "-")); 
             roomLabels.push(GoIntoRoom(connection, floorData)); 
        }
      else 
        {
          
        }
       }); 
   var div_roomName = createElement("div",{"class":"room-container"}, roomLabels);
    return div_roomName;
//  return roomLabels;
  
  
// connectionsnewListItemArr.push (label_connection); 
}

var numberOfTiles = 7; 

function CreateTiles(rooms , DivConfiguration) {
  var RowList = [];
  for (var i=0; i<numberOfTiles; i++)
    {
      var TilesList = []; 
       for (var x=0; x<numberOfTiles; x++)
         {
             var  class_tile = "tile"
             var label = ""; 
            /*  rooms.forEach(function (room)
              {
                  if (x == room.x )
                    {
                       if (i == room.y )
                         {
                        class_tile = "color_tile";
                           
                        //label = room.name; 
                         }
                    }

              }); */
           
             var tile = createElement("div",{"id":"tile_"+x+"_"+i, "class": class_tile}, label);
           TilesList.push(tile); 
         }
        var game_column = createElement("div",{"id":"column_"+i, "class":"game-column"}, TilesList);
       RowList.push(game_column); 
    }
  
  
   var  floor_contents = createElement("div",{"id":"", "class":"rooms grid-container"}, RowList);
    
   // newListItemArr.push (floor_contents); 
   // var  FloorLayout = createElement("div",{"id":"", "class":"floor"},newListItemArr);
    // FloorsList.push (FloorLayout); 
    
 
      DivConfiguration.appendChild(floor_contents);
  
       rooms.forEach(function (room)
         {
             
        
         
         
          for(var x= room.x; x<room.x+room.h; x++)
             for(var i = room.y; i<room.y+room.w; i++)
               {
                   var div = document.getElementById("tile_"+x+"_"+i);
                // div.className = "hall_tile"; 
                    div.className = "color_tile";
                    div.style.backgroundColor = room.color;
                 
                   if (i == room.y)
                     { 
                       if(room.doors != "left")
                         div.style.borderLeft = "3px solid silver";
                       else 
                         div.style.borderLeft = "5px solid red";
                     }
                 if (i == room.y+room.w-1)
                     { 
                        if(room.doors != "right")
                         div.style.borderRight = "3px solid silver";
                       else 
                         div.style.borderRight = "5px solid red";
                     }
                   if (x == room.x+room.h-1)
                     { 
                       if(room.doors != "bottom")
                         div.style.borderBottom = "3px solid silver";
                       else 
                         div.style.borderBottom = "5px solid red";
                     } 
                 if (x == room.x)
                     { 
                        if(room.doors != "top")
                         div.style.borderTop = "3px solid silver";
                       else 
                         div.style.borderTop = "5px solid red";
                     }
               
                   
                 
                   //class_tile = "";
               }
           if (room.doors["top"])
             room.doors["top"].forEach(function(number) {
                    //  console.log(number);

                for(var x= room.x; x<room.x+room.h; x++)
                 //for(var i = room.y; i<room.y+room.w; i++)
                   {
                       var div = document.getElementById("tile_"+x+"_"+number);
                       div.style.borderTop = "";
                   }      
             });
         
             if (room.doors["bottom"])
             room.doors["bottom"].forEach(function(number) {
                    //  console.log(number);

                for(var x= room.x; x<room.x+room.h; x++)
                 //for(var i = room.y; i<room.y+room.w; i++)
                   {
                       var div = document.getElementById("tile_"+x+"_"+number);
                       div.style.borderBottom= "";
                   }      
             });
         
         
             if (room.doors["left"])
             room.doors["left"].forEach(function(number) {
                    //  console.log(number);

               // for(var x= room.x; x<room.x+room.h; x++)
                 for(var i = room.y; i<room.y+room.w; i++)
                   {
                       var div = document.getElementById("tile_"+number+"_"+i);
                       div.style.borderLeft = "";
                   }      
             });
         
         
         
         if (room.type=="XHallway")
           {
                 var x= room.x; 
                 for(var i = 0; i<numberOfTiles; i++)
                 {
                    var div = document.getElementById("tile_"+x+"_"+i);
                    div.style.height = '30px';
                  } 
           }
          if (room.type=="YHallway")
           {
                 var i= room.y; 
                 for(var x = 0; x<numberOfTiles; x++)
                 {
                    var div = document.getElementById("tile_"+x+"_"+i);
                    div.style.width = '30px';
                  } 
           }
          
        
                          
           });
  
  
  
  
  
}
function appendRoomElements(rooms, DivConfiguration) {
  
  
    var FloorsList = []; 
  
  Object.keys(rooms).forEach(function(floor){
      var floorData = rooms[floor]; 
     var floor_label = createElement("label",{"class":"floor_label"}, floor); 
    var newListItemArr = []; 
    newListItemArr.push (floor_label); 
    
    
    var div = GoIntoRoom("0", floorData);    
   var  floor_contents = createElement("div",{"id":"", "class":"rooms"}, div);
    
   // newListItemArr.push (floor_contents); 
   // var  FloorLayout = createElement("div",{"id":"", "class":"floor"},newListItemArr);
    // FloorsList.push (FloorLayout); 
    
 
      DivConfiguration.appendChild(floor_contents);
});
}



function ListRoomElementsOld(rooms, DivConfiguration) {
  
  
  
  Object.keys(rooms).forEach(function(floor){
  
    var floorData = rooms[floor]; 

     var floor_label = createElement("label",{"class":"floor_label"}, floor); 

    var newListItemArr = []; 
     newListItemArr.push (floor_label); 
 Object.keys(floorData).forEach(function(room){
     
   var roomInfo = floorData[room]; 
   
    var connectionsnewListItemArr = []; 
       roomInfo.connections.forEach(function(connection)
       {  
           var label_connection  = createElement("label",{"class":""}, floorData[connection].name);
         connectionsnewListItemArr.push (label_connection); 
   
       }); 
   
      var label = createElement("label",{"class":""}, roomInfo.name),
          
    div_connections = createElement("div",{"class":"", "id":""},  connectionsnewListItemArr);
    div = createElement("div",{"class":"", "id":""}, [label, div_connections]);
   
    //button = createElement("button",{"type":"submit","id":"button-"+tapID},LabelText),
  //newListItemArr.push (label); 
    newListItemArr.push (div); 

   });
 var  newListItem = createElement("div",{"id":"", "class":""},newListItemArr);
   
  DivConfiguration.appendChild(newListItem);
   

    
    
  });
}



function UnlockADoor(place, rooms, DivConfiguration) {
  
    var room = rooms[place]; 
      var x = rooms[place].x; 
      var y = rooms[place].y; 
  
        var div = document.getElementById("tile_"+x+"_"+y);
  
                       if(room.doors == "left")
                         div.style.borderLeft = "";
                  
                        if(room.doors == "right")
                         div.style.borderRight = "";
                 
                       if(room.doors == "bottom")
                         div.style.borderBottom = "";
                  
                        if(room.doors == "top")
                         div.style.borderTop = "";
                

  
  
} 


function DisplayCurrentRoomOptions(place, connections, DivConfiguration)
{
  
  
  
  
  var  CurrentRoomLabel  = document.getElementById("currentRoomLabel");
    
     
    var roomLabels = []; 
  var roomInfo = connections[place]; 
  //visitedRooms.push(roomID);
 // var label_roomName = createElement("label",{"class":"room-label"}, roomInfo.name );
  CurrentRoomLabel.innerHTML = roomInfo.name ; 
   //roomLabels.push(label_roomName); 
  var hitList = []; 
    roomInfo.connections.forEach(function(connection)
       {  
     
      
      var connectionInfo =  connections[connection] ; 
      var connectionID = "connnection_"+connection; 
     
      var label_connectionName = createElement("label",{"class":"connnection-room-label", "id":connectionID}, connectionInfo.name );
      
         roomLabels.push(label_connectionName); 
          //  roomLabels.push(createElement("div",{"class":"line"}, "-")); 
      
      
      hitList.push(connection); 
     
  
      
       }); 

    
    
   var  floor_contents = createElement("div",{"id":"current-connections-list", "class":"connections-list"}, roomLabels);
    
 
      DivConfiguration.appendChild(floor_contents);
  
    hitList.forEach(function(connectionID)
                    {
      var local_connectionID = connectionID; 
    // $("connnection"+connectionInfo.name).click(function(){
        $('#connnection_'+connectionID).click(function(){
          
          
          console.log("ok " + local_connectionID);
          
          if ( connections[connectionID].status != "Locked")
          {
              
          

        //PutPacmanInAPlace(connectionID, StagesResponse.Locations, 0, 1);
            
        socket.emit('move-rooms', {"room":connectionID});//{"ShowID":ShowID,"GroupID":GroupID,"PlayerID":PlayerID} ); 


            
            
            
            
        //UnlockADoor(0, StagesResponse.Locations, div);
          var  CurrentRoomOptionsDiv  = document.getElementById("CurrentRoomOptions");
          
          CurrentRoomOptionsDiv.innerHTML = ""; 
          
  //UnlockADoor(connectionID, StagesResponse.Locations, BuildingConfigurationDiv);
          
        DisplayCurrentRoomOptions(connectionID, StagesResponse.Connections["FirstFloor"], CurrentRoomOptionsDiv);

          }
          else 
            {
              UnlockADoor(connectionID, StagesResponse.Locations, BuildingConfigurationDiv);
              connections[connectionID].status = "Unlocked"; 
            }
          
      //socket.emit('control-message', "start-show");
    });
    });
  
  
  
  
}
function DeletePackman(player)
{
  
    var element = document.getElementById("player-icon-"+player);
    if(element)
        element.parentNode.removeChild(element);
}
function PutPacmanInAPlace(place, rooms, player, pac_id) {
  
  
  
  
    var element = document.getElementById("player-icon-"+player);
    if(element)
        element.parentNode.removeChild(element);
      // var div = document.getElementById("BuildingConfiguration");
  
      var x = rooms[place].x; 
      var y = rooms[place].y; 
  
        var div = document.getElementById("tile_"+x+"_"+y);
  
        var pacman  = createElement("div",{"class":"pacman pacman_"+pac_id, "id":"player-icon-"+player});
        div.appendChild(pacman);
  
  
  
  
}




function SetRoomTemplate(showIDUrl)
{
  
   
  //fetch()
  fetch("/roomtemplates/"+showIDUrl+".html")
 .then(response => response.text()) // parse the JSON from the server
  .then(response => {
        
        var  test_sceneTemplate = document.getElementById("test-roomtemplates");

             // testvideocontainer.innerHTML = response; 

                setHTML(test_sceneTemplate, response, true);


        });
}

  
  
var BuildingConfigurationDiv = document.getElementById("BuildingConfiguration");

var StagesResponse = {}; 

// fetch the initial list of dreams
fetch("/AdventureBuilding")
  .then(response => response.json()) // parse the JSON from the server
  .then(stagesresponse => {
  
  // return  {"Connections":this.BuildingMap, "Locations": this.LocationsMap }; 
  StagesResponse = stagesresponse; 
  console.log(StagesResponse); 
  
 var div = document.getElementById("BuildingConfiguration");
 // appendRoomElements(StagesResponse, div); 
  
  
  
  
 var div = document.getElementById("BuildingConfiguration");
  CreateTiles(StagesResponse.Locations, div); 
  
  //PutPacmanInAPlace(0, StagesResponse.Locations,0, 1);
  UnlockADoor(0, StagesResponse.Locations, BuildingConfigurationDiv);
  
  
  
  var  CurrentRoomOptionsDiv  = document.getElementById("CurrentRoomOptions");
  
  DisplayCurrentRoomOptions(0, StagesResponse.Connections["FirstFloor"], CurrentRoomOptionsDiv);
  
  
  
  
}); 
   



socket.on('enter-room', function(msg) {
   console.log('enter-room');
   console.log(msg);
  SetRoomTemplate(msg.roomURL); 
     //   GetShowState(ShowID, GroupID, PlayerID);
  
  });



 


 socket.emit('join-building-scene', {"ID":"ID"});//{"ShowID":ShowID,"GroupID":GroupID,"PlayerID":PlayerID} ); 

socket.on('building-state-change', function(msg) {
   console.log('building-state-change');
   console.log(msg);
     //   GetShowState(ShowID, GroupID, PlayerID);
  
  });

var playersCache = {}; 
socket.on('BuildingStateChange', function(msg) {
  
  
console.log("socket ID " + socket.id );
   console.log('building-state-change');
  
   console.log(msg);
  
  Object.keys(playersCache).forEach(key => {
  
            
          DeletePackman(key);
  });
    
  playersCache = msg.Players; 
  var pac_id = 1; 
  Object.keys(msg.Players).forEach(key => {
    
  console.log(key, msg.Players[key]);
    //if (key != socket.id)
      {
        var val = msg.Players[key]; 
        
          PutPacmanInAPlace(val, StagesResponse.Locations,key, pac_id);
        pac_id++; 
      }
});
  
 var div = document.getElementById("BuildingConfiguration");
  
     //   GetShowState(ShowID, GroupID, PlayerID);
  
  });



socket.emit('move-rooms', {"room":0});//{"ShowID":ShowID,"GroupID":GroupID,"PlayerID":PlayerID} ); 

