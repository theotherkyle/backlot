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


// a helper function that creates a list item for a given dream
function appendNewDream(dream) {
  const newListItem = document.createElement("li");
  newListItem.innerText = dream;
  dreamsList.appendChild(newListItem);
}

// fetch the initial list of dreams
fetch("/dreams")
  .then(response => response.json()) // parse the JSON from the server
  .then(dreams => {
    // remove the loading text
    dreamsList.firstElementChild.remove();
  
    // iterate through every dream and add it to our page
  
 // dreams.forEach(appendNewDream);
  
    // listen for the form to be submitted and add a new dream when it is
    dreamsForm.addEventListener("submit", event => {
      // stop our form submission from refreshing the page
      event.preventDefault();
/*
      // get dream value and add it to the list
      let newDream = dreamsForm.elements.dream.value;
      dreams.push(newDream);
      appendNewDream(newDream);
*/
      // reset form
      dreamsForm.reset();
      //dreamsForm.elements.dream.focus();
    });
   
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


fetch("/BarConfiguration")
  .then(response => response.json()) // parse the JSON from the server
  .then(BarConfigurationResponse => {
    // remove the loading text
   // BarConfiguration.firstElementChild.remove();
  
    // iterate through every dream and add it to our page
    BarConfigurationResponse.forEach(appendNewTap);

  });
fetch("/DoorsConfiguration")
  .then(response => response.json()) 
  .then(DoorsConfigurationResponse => {
   DoorsConfigurationResponse.forEach(appendNewDoor);
  });
 
fetch("/TablesConfiguration")
  .then(response => response.json()) 
  .then(ConfigurationResponse => {
   ConfigurationResponse.forEach(appendNewTable);
  });
 


 



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



   // ${viewingSharedScreen || sharingScreen ? 'Open' : 'Close'
   
// const cameraSubscriberClass =
  //    `video-container ${!activeCameraSubscribers ? 'hidden' : ''} active-${activeCameraSubscribers} ${viewingSharedScreen || sharingScreen ? 'small' : ''}`;
  