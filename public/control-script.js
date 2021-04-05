// client-side js, loaded by index.html
// run by the browser each time the page is loaded

console.log("hello world :o");

//require("./js/helper-modules")


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
        fmt = new Date(ms).toISOString().slice(11, lm).split('.')[0] ;//.slice(11, lm);
  

    if (ms >= 8.64e7) {  /* >= 24 hours */
        var parts = fmt.split(/:(?=\d{2}:)/);
        parts[0] -= -24 * (ms / 8.64e7 | 0);
        return parts.join(':');
    }

    return fmt;
};


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
const tablestrings = { id:"table-", initalLabel:"Enter Table", state:"Open", altLabel:"Close Table", class:"tapLabel", div_class:"tap" ,  emitAlt:"disabletable", emitBase:"enabletable"}

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




// a helper function that creates a list item for a given dream
function AdjustAttrElement(tap, strings, DivConfiguration) {
  
  var tapID = strings.id + tap.ID;
  var tapIDStatus = tapID + "Status"
  var LabelText = tap.ID ; 
  if (tap.State == strings.state) LabelText = tap.ID;
  
//var label = createElement("label",{"class":strings.class}, tap.ID),
   // div = createElement("div",{"class":"Attrstatus_"+tap.State, "id":tapIDStatus}),
    //button = createElement("button",{"type":"submit","id":"button-"+tapID},LabelText),
   // newListItem = createElement("div",{"id":tapID, "class":strings.div_class},[label,div]);
  
  //DivConfiguration.appendChild(newListItem);
  
  tapDiv =  document.getElementById(tapIDStatus);; 
  
  var grps = 0; 
  var aud = 0; 
  
   if(ShowsGroups[tap.ID])
     {
      grps = Object.keys( ShowsGroups[tap.ID]).length; 
       Object.values(ShowsGroups[tap.ID]).forEach(element =>  (aud += element.length));
     //  console.log(""+ aud);     
     }
  
      groupslabel= document.getElementById("groupsLabel"+tapIDStatus); 
      groupslabel.innerHTML = "Grps: "+ grps; 
  
      audlabel= document.getElementById("audLabel"+tapIDStatus); 
      audlabel.innerHTML = "Aud: "+ aud; 
    
  
  
  
  ShowStructure.forEach(function(element) {
  
    //ShowStructureString += element.ID + " "; 
    
    createElement("br");
    labelClass = "SmalltapLabel"; 
    //console.log(ShowsProgress[0]['State'['ID']])
    if(ShowsProgress[tap.ID])
    if (element.ID == ShowsProgress[tap.ID]['State']['ID'])
    {
      labelClass = "SmalltapLabel_red"; 
      LabelElement = document.getElementById("ShowsProgress"+element.ID+tapID); 
      LabelElement.setAttribute("class", labelClass);
     // 
      timeval = ShowsProgress[tap.ID]['State']['TimeRemaining'] ; 
      stringtime = timeval.toTime() ;
      labeltimeremaining = document.getElementById("timeR"+tapIDStatus); 
      labeltimeremaining.innerHTML = stringtime; 
      
      
      elapsedtimeval = ShowsProgress[tap.ID]['State']['ElapsedTime'] ; 
      elapsedstringtime = elapsedtimeval.toTime() ;
      labeleapsedtime= document.getElementById("timeTotal"+tapIDStatus); 
      labeleapsedtime.innerHTML = elapsedstringtime; 
      
     // timeTotal"+tapIDStatus
      
     /* if(ShowsProgress[tap.ID-1])
        {
          
        var tapID = strings.id + (tap.ID -1);
      labelClass = "SmalltapLabel"; 
      LabelElement = document.getElementById("ShowsProgress"+element.ID+(tapID)); 
      LabelElement.setAttribute("class", labelClass);
        }
        */
     // tapDiv.appendChild(label);
    }
    else 
    {
      LabelElement = document.getElementById("ShowsProgress"+element.ID+tapID); 
      LabelElement.setAttribute("class", labelClass);
      
    }
    
  });
  
  
  }




function adjustStructureElement(tap, strings, DivConfiguration) {
  
  
  var tapID = strings.id + tap.ID;
  var tapIDStatus = tapID + "Status"
  grps = SectionStatus[tap.ID]["CurrentShows"];
  
 labeleapsedtime= document.getElementById( "groupsLabel"+tapIDStatus ); 
  labeleapsedtime.innerHTML = grps; 
  
  
}


function appendNewStructureElement(tap, strings, DivConfiguration) {



  var tapID = strings.id + tap.ID;
  var tapIDStatus = tapID + "Status"
  var LabelText = tap.ID ; 
  if (tap.State == strings.state) LabelText = tap.ID;
  var grps = 0; 
  var aud = 0; 
  
  var totalTime  = tap.Time.toTime() ;
  
  /* if(ShowsGroups[tap.ID])
     {
      grps = Object.keys( ShowsGroups[tap.ID]).length; 
        
       Object.values(ShowsGroups[tap.ID]).forEach(element =>  (aud += element.length));
       console.log(""+ aud);     
     }
  */
    
  grps = SectionStatus[tap.ID]["CurrentShows"];
  
var label = createElement("label",{"class":strings.class}, tap.ID),
    label_grps = createElement("label",{"class":strings.class, "id":  "groupsLabel"+tapIDStatus }, "Shows: "+ grps),
    label_aud = createElement("label",{"class":strings.class, "id":  "audLabel"+tapIDStatus }, "  "),
    
    
    labeltimelabel = createElement("label",{"class":strings.class, "id":  "timeTotal"+tapIDStatus }, "Total Time:" ),
    labeltime = createElement("label",{"class":strings.class, "id":  "timeTotal"+tapIDStatus }, totalTime),
    div = createElement("div",{"class":"Attrstatus_"+tap.State, "id":tapIDStatus}),
    labeltimeremaining = createElement("label",{"class":strings.class, "id":  "timeR"+tapIDStatus }, "00:00:00"),
    //button = createElement("button",{"type":"submit","id":"button-"+tapID},LabelText),
    newListItem = createElement("div",{"id":tapID, "class":strings.div_class},[label,label_grps, label_aud, labeltimelabel, labeltime, div, labeltimeremaining]);
  
  DivConfiguration.appendChild(newListItem);  
  
  
  
  
  
  
  
  
}

function adjustShowStructureStatus()
{
  //tapDiv =  document.getElementById(tapIDStatus);; 
  ShowStructure.forEach(function(element) {
    
    
        adjustStructureElement(element, tablestrings, TablesConfiguration);
  
    //ShowStructureString += element.ID + " "; 
    
  
  });
  
}
  
  

function buildShowStructureStatus()
{

  //tapDiv =  document.getElementById(tapIDStatus);; 
  ShowStructure.forEach(function(element) {
    
    
        appendNewStructureElement(element, tablestrings, TablesConfiguration);
  
    //ShowStructureString += element.ID + " "; 
    
  
  });
  
}

// a helper function that creates a list item for a given dream
function appendNewAttrElement(tap, strings, DivConfiguration) {
  
  var tapID = strings.id + tap.ID;
  var tapIDStatus = tapID + "Status"
  var LabelText = tap.ID ; 
  if (tap.State == strings.state) LabelText = tap.ID;
  var grps = 0; 
  var aud = 0; 
  
   if(ShowsGroups[tap.ID])
     {
      grps = Object.keys( ShowsGroups[tap.ID]).length; 
        
       Object.values(ShowsGroups[tap.ID]).forEach(element =>  (aud += element.length));
       console.log(""+ aud);     
     }
    
  
var label = createElement("label",{"class":strings.class}, tap.ID),
    label_grps = createElement("label",{"class":strings.class, "id":  "groupsLabel"+tapIDStatus }, "Grps: "+ grps),
    label_aud = createElement("label",{"class":strings.class, "id":  "audLabel"+tapIDStatus }, "Aud:" + aud),
    
   
    
    labeltime = createElement("label",{"class":strings.class, "id":  "timeTotal"+tapIDStatus }, "00:00:00"),
    div = createElement("div",{"class":"Attrstatus_"+tap.State, "id":tapIDStatus}),
    labeltimeremaining = createElement("label",{"class":strings.class, "id":  "timeR"+tapIDStatus }, "00:00:00"),
    //button = createElement("button",{"type":"submit","id":"button-"+tapID},LabelText),
    newListItem = createElement("div",{"id":tapID, "class":strings.div_class},[label,label_grps, label_aud, labeltime, div, labeltimeremaining]);
  
  DivConfiguration.appendChild(newListItem);
  
  
  tapDiv =  document.getElementById(tapIDStatus);; 
  ShowStructure.forEach(function(element) {
  
    //ShowStructureString += element.ID + " "; 
    
    createElement("br");
    labelClass = "SmalltapLabel"; 
    //console.log(ShowsProgress[0]['State'['ID']])
    if(ShowsProgress[tap.ID])
      {
      if (element.ID == ShowsProgress[tap.ID]['State']['ID'])
        labelClass = "SmalltapLabel_red"; 
        
        labeltimeremaining.innerHTML = ShowsProgress[tap.ID]['State']['TimeRemaining'] ; 
        
      }
    
    var label = createElement("label",{"class":labelClass, "id":"ShowsProgress"+element.ID+tapID}, element.ID);
    //div = createElement("div",{"class":"status_"+tap.State, "id":tapIDStatus}),
    //newListItem = createElement("div",{"id":tapID, "class":strings.div_class},[label,div]);
    tapDiv.appendChild(label);
  
  });
  
  
  
 /* var taptapName = '#button-'+tapID; 
     $(taptapName).click(function(){
       var textContent = $(taptapName).text()  ; 
      if  (textContent == strings.altLabel)
        socket.emit(strings.emitAlt, tap.ID); 
     else  socket.emit(strings.emitBase, tap.ID);
    });
    */
  
  }

function AdjustAttractionState(tap) {
  AdjustAttrElement(tap, tablestrings, DoorsConfiguration);
  }

function buildAttractionState(tap) {
  appendNewAttrElement(tap, tablestrings, DoorsConfiguration);
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

var ShowStructure = {};
var ShowsProgress = {};
var ShowsGroups = {};
var SectionStatus = {}; 

function Rebuild(FullAttractionStateResponse)
{
  
   // DoorsConfiguration.removeChild(child);
  // DoorsConfiguration.innerHTML = '';

//fetch("/FullAttractionState")
 // .then(response => response.json()) 
  // .then(FullAttractionStateResponse => {
  NumberOfShows = FullAttractionStateResponse["NumberOfShows"]; 
   ShowStructure = FullAttractionStateResponse["ShowStructure"]; 
  ShowsProgress = FullAttractionStateResponse["ShowsProgress"]; 
  ShowsGroups = FullAttractionStateResponse["Groups"]; 
  SectionStatus = FullAttractionStateResponse["SectionsManager"]; 
  
  //console.log(ShowStructure); 
  //console.log(ShowsProgress[0]['State'['ID']])
  
  for (i=0; i<NumberOfShows; i++)
    {
      AdjustAttractionState({'ID':i, 'State':'Closed', }); 
    }
  
   adjustShowStructureStatus(); 
  
  
   // });
  //setTimeout(Rebuild, 1000);
}
         

function Build()
{
  
  
 // DoorsConfiguration.removeChild(child);
   DoorsConfiguration.innerHTML = '';
  TablesConfiguration.innerHTML = '';

fetch("/FullAttractionState")
  .then(response => response.json()) 
   .then(FullAttractionStateResponse => {
  NumberOfShows = FullAttractionStateResponse["NumberOfShows"]; 
   ShowStructure = FullAttractionStateResponse["ShowStructure"]; 
  ShowsProgress = FullAttractionStateResponse["ShowsProgress"]; 
  ShowsGroups = FullAttractionStateResponse["Groups"]; 
  
  SectionStatus = FullAttractionStateResponse["SectionsManager"]; 
  //console.log(ShowStructure); 
  //console.log(ShowsProgress[0]['State'['ID']])
  for (i=0; i<NumberOfShows; i++)
    {
      buildAttractionState({'ID':i, 'State':'Closed', }); 
    }
  
   buildShowStructureStatus(); 
  
  
/*
  .then(ConfigurationResponse => {
   ConfigurationResponse.forEach(appendNewTable);*/
  });
  // setTimeout(Rebuild, 0);
}

Build(); 


 
  socket.emit('join-controllers', {"ControllerID":"12"}); 

  socket.on('cacheAttractionState', function(msg) {
    
    Rebuild(msg); 
   // console.log(msg);
  
   });

 socket.on('show-control', function(msg) {
        
   //$().
   console.log(msg);
   
  socket.emit('join-controllers', {"ControllerID":"12"}); 
   
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