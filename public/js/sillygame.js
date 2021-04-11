var gamephrase  = ["this", "is", "a", "sin", "tents", ""]; 

var tryPhrase = 4; 

var pulse = 500; 

var marker = 0; 

var countdown = 5; 



  $(document).ready(function() {   

const GameScene = document.getElementById("PlayThis");
function pulseEvent (marker)
{
  
   value = gamephrase[marker]; 
  if (marker == tryPhrase)
    {
      countdown = 0; 
      GameScene.innerHTML = "Player " + tryPhrase + ":  " + countdown + " " + value; 
      countdown = 5; 
      
    }
  else 
    {
    GameScene.innerHTML = "Player " + tryPhrase + ":  " + countdown + " ."; 
    countdown = countdown-=1; 
      if (countdown < 0)countdown=0; 
      }
 // if (countdown< 0) countdown = 5;
    //setTimeout(pulseEvent, pulse);
}

    
    
  
   var socket = io();
    
    socket.emit("joinsillygame"); 
    socket.on('setPhrase', function(msg) {
    
    tryPhrase = msg.tryPhrase; 
    currentMark = msg.marker; 
      countdown = 0; 
  
   });
  socket.on('phrasePulse', function(msg) {
    
    pulseEvent (msg.marker); 
   // Rebuild(msg); 
   // console.log(msg);
  
   });
    
//setTimeout(pulseEvent, pulse);
  });


