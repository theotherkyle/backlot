// Assigning to exports will not modify module, must use module.exports
var EventEmitter = require('events');

module.exports = class ShowSession extends EventEmitter {
  

  
  constructor(ID, Rate) {
    super();
    this.width = ID;
    this.active = true; 
   // this.eventHandler = eh; 
    this.tick = 1000;  
    this.speed = Rate; 
  this.CurrentPosition = -1;
//    this.NextTimeOut = null; 
    
    
  this.Structure = [{"ID":"0 - Arrivals", Time:15, TimeC:"00:15:00"},
                   {"ID":"1 - Welcome", Time:4, TimeC:"00:03:00"}, 
                   {"ID":"1 - Workshop A", Time:5, TimeC:"00:06:00"}, 
                   {"ID":"1 - Workshop B", Time:5, TimeC:"00:06:00"}, 
                   {"ID":"1 - Workshop C", Time:5, TimeC:"00:06:00"}, 
                   {"ID":"1 - Common", Time:2, TimeC:"00:01:00"}, // 0
                   {"ID":"2 - Keynote", Time:3, TimeC:"00:02:00"}, 
                   {"ID":"2- Orientation", Time:3, TimeC:"00:03:00"}, //3 //2000
                   {"ID":"3 - Missions A",Time:7,  TimeC:"00:30:00"}, //21 //180000
                   {"ID":"3 - Missions B",Time:7,  TimeC:"00:30:00"}, //21 //180000
                   {"ID":"3 - Missions C",Time:7,  TimeC:"00:30:00"}, //21 //180000
                   {"ID":"4 - Ivor", Time:5, TimeC:"00:03:00"},
                   {"ID":"4 - Apt", Time:10, TimeC:"00:12:00"},
                   {"ID":"5 - Janine", Time:2, TimeC:"00:02:00"},
                   {"ID":"6 - Action", Time:4, TimeC:"00:04:00"}, 
                   {"ID":"6 - Basement", Time:3, TimeC:"00:04:00"}, 
                   {"ID":"Postshow", Time:15, TimeC:"00:15:00"}, ]; 
    
    
  this.OldStructure = [{"ID":"Preshow", Time:15000, TimeC:"00:15:00"},
                   {"ID":"Welcome", Time:3000, TimeC:"00:03:00"}, 
                   {"ID":"Workshops", Time:6000, TimeC:"00:06:00"}, 
                   {"ID":"Recap", Time:1000, TimeC:"00:01:00"}, 
                   {"ID":"Keynote", Time:2000, TimeC:"00:02:00"}, 
                   {"ID":"Orientation", Time:3000, TimeC:"00:03:00"}, 
                   {"ID":"Missions",Time:30000,  TimeC:"00:30:00"}, 
                   {"ID":"CrossOver", Time:3000, TimeC:"00:03:00"},
                   {"ID":"Mashup", Time:12000, TimeC:"00:12:00"},
                   {"ID":"Travel", Time:2000, TimeC:"00:02:00"},
                   {"ID":"Basement", Time:4000, TimeC:"00:04:00"}, 
                   {"ID":"Hero", Time:4000, TimeC:"00:04:00"}, 
                   {"ID":"Postshow", Time:15000, TimeC:"00:15:00"}, ]; 
    
    // 10+20+5+18+15+2+10
    
    this.CurrentPositionData = {"TimeRemaining":0,  "ElapsedTime":0, "Time":0, "ID":"0"}; 
    
    console.log(`Structure  - ${this.Structure.length}`);
    
    
  }
  
  getShowStructure()
  {
    return this.Structure ; 
  }
  
    //https://blog.logrocket.com/handling-and-dispatching-events-with-node-js/
  ProcessEventHandlers()
  {
    if (this.CurrentPosition > 0)
      this.emit('ShowStateChange', {"ID":this.width, "Prev":this.Structure[this.CurrentPosition-1]["ID"], Next:this.Structure[this.CurrentPosition]["ID"]});
    else 
      this.emit('ShowStateChange', {"ID":this.width,"Prev":"", Next:this.Structure[this.CurrentPosition]["ID"]});
   
      
  }
  
  getState()
  {
    return this.CurrentPositionData ; 
  }
  
  ShowSessionLogger(txt)
  {
  //   console.log(`Session ${this.width}  - ${txt}`); 
  }
  
  

  TickHandle()
  {
    this.CurrentPositionData["ElapsedTime"]  = this.CurrentPositionData["ElapsedTime"]+this.tick ;
    this.CurrentPositionData["TimeRemaining"] = this.CurrentPositionData["TimeRemaining"]-this.tick ;
    if (this.CurrentPositionData["TimeRemaining"] > 0)
    {
      this.ShowSessionLogger(`Tick Click  - ${this.CurrentPositionData["TimeRemaining"]}`);
      
    }
    else 
      {
      //  console.log(`Pausing Click `);
      }
    if(this.active ) setTimeout(this.TickClock, this.tick , this);
  }
    TickClock (arg)
  {
    
    if(arg.active )
      {
    //console.log(`Tick  - ${arg.tick }`);
        arg.TickHandle();
      }
  }
    
  StopClock()
  {
    if (this.NextTimeOut ) clearTimeout(this.NextTimeOut ); 
    this.active = false; 
  }
  StartClock (arg)
  {
    
    //console.log(`StartClock   - ${arg.tick }`);
  
    if(arg.active ) setTimeout(arg.TickClock, arg.tick , arg);
    
  }
  
  endCurrentSection (arg )
  {
      arg.ShowSessionLogger(`endCurrentSection was => ${arg.CurrentPosition}`);
    
    ///this.CurrentPositionData["Time"] = position["Time"]; 
    //this.CurrentPositionData["ID"] = position["ID"]; 
    //this.CurrentPositionData["TimeRemaining"] = 0; 
    if(arg.active) arg.goNextSection(arg) ; 
    
    
  }
  
  StartCurrentSection ()
  {
    //  console.log(`StartCurrentSection was => ${this.CurrentPosition}`);
     var position =  this.Structure [this.CurrentPosition];
     // console.log(` => ${position}`);
    
    this.CurrentPositionData["Time"] = position["Time"] * this.speed ; 
    this.CurrentPositionData["ID"] = position["ID"]; 
    this.CurrentPositionData["TimeRemaining"] =  this.CurrentPositionData["Time"]; 
    
    this.ShowSessionLogger(`StartCurrentSection - Section ${this.CurrentPosition} : ${this.CurrentPositionData["ID"]}  will end in  => ${this.CurrentPositionData["Time"]} Seconds`);
    this.ProcessEventHandlers(); 
    if(this.active) 
      this.NextTimeOut = setTimeout(this.endCurrentSection, this.CurrentPositionData["Time"], this);
    
    
      
//      {"TimeRemaining":0, "Time":"00:00:00", "ID":"00"}; 
    
  }
  

 goNextSection(arg) {
  
    arg.CurrentPosition  += 1; 
   
     // console.log(`goNextSection was => ${arg.CurrentPosition}`);
   if ( arg.CurrentPosition < arg.Structure.length ) {
      arg.StartCurrentSection();
       }
   else 
     {
       this.ShowSessionLogger(`EndShowSession`);
     }
   
  
}
  Go()
  {
    this.ShowSessionLogger("StartShowSession");
    
    
    this.StartShowSession(0); 
  }

 StartShowSession(arg) {
   
    this.CurrentPosition = -1;
    this.CurrentPositionData["ElapsedTime"] = 0; 
   this.goNextSection(this);
   this.StartClock(this);
   
   
 // io.emit('cube-control', cubedirections[arg]);
}



  area() {
    return this.width ** 2;
  }
};