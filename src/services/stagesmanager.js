// Assigning to exports will not modify module, must use module.exports
var EventEmitter = require('events');

module.exports = class stagessmanager extends EventEmitter {
  


  constructor(width) {  
    super();
    this.width = width;
  //  "possibly reduce 6min w:
// 10+20+5+18+15+2+10"
    //SLIME(10+22+6+21+16+2+10)
    
     this.Structure = [
                       {id:0, SectionTroupe:"0", "Name":"AssistanceFacilitatorStage", scale:5, NumberOfActors:1}, 
                       {id:1, SectionTroupe:"1", "Name":"WelcomeStage", scale:1, NumberOfActors:1},
                       {id:2, SectionTroupe:"2", "Name":"AcademyWorkshopStage", scale:3, NumberOfActors:1},
                       {id:3, SectionTroupe:"3", "Name":"KeynoteStage", scale:1, NumberOfActors:1},
                       {id:4, SectionTroupe:"4", "Name":"MissionFacilitatorAStage", scale:10, NumberOfActors:1},
                       {id:5, SectionTroupe:"4", "Name":"MissionFacilitatorBStage", scale:10, NumberOfActors:1},
                       {id:6, SectionTroupe:"5", "Name":"AptStage", scale:5, NumberOfActors:1},
                       {id:7, SectionTroupe:"6", "Name":"JanineStage", scale:1, NumberOfActors:1},
                       {id:8, SectionTroupe:"6", "Name":"FinaleStage", scale:1, NumberOfActors:1},
                       {id:9, SectionTroupe:"7", "Name":"AfterPartyStage", scale:1, NumberOfActors:1},
                      
                      ]; 
    
    this.ActiveStages = []; 
    
    
    this.Scale = 0;
    
   this.Structure.forEach(element => {
     this.Scale += element.scale; 
    });
    
    
  }
  getState()
  {
    return  this.Structure ; 
  }
  getScale()
  {
    return this.Scale ;  
  }
  
  reset()
  {
    
    this.tick = 1000; 
  this.CurrentPosition = -1;

    
     this.Structure = {"":{Time:0, CurrentShows:[]},
                        "0 - Arrivals":{Time:15000, CurrentShows:[]},
                       "1 - Welcome":{ Time:4000, CurrentShows:[]}, 
                        "1 - Workshop":{Time:15000, CurrentShows:[]}, 
                      //  "1 - Common":{ Time:2000, TimeC:"00:01:00", CurrentShows:[]}, 
                        "2 - Keynote":{  Time:3000, TimeC:"00:02:00", CurrentShows:[]}, 
                         "2- Orientation":{  Time:2000, TimeC:"00:03:00", CurrentShows:[]}, //3
                         "3 - Missions":{ Time:180000,  TimeC:"00:30:00", CurrentShows:[]}, //21
                         "4 - Ivor":{  Time:5000, TimeC:"00:03:00", CurrentShows:[]},//6
                         "4 - Apt":{  Time:10000, TimeC:"00:12:00", CurrentShows:[]},
                         "5 - Janine":{ Time:2000, TimeC:"00:02:00", CurrentShows:[]},
                         "6 - Action":{ Time:4000, TimeC:"00:04:00", CurrentShows:[]}, 
                         "6 - Basement":{  Time:3000, TimeC:"00:04:00", CurrentShows:[]}, 
                         "Postshow":{  Time:15000, TimeC:"00:15:00", CurrentShows:[]}}; 
    
    
  this.ShowStructure = [{"ID":"0 - Arrivals", Time:15000, TimeC:"00:15:00"},
                   {"ID":"1 - Welcome", Time:4000, TimeC:"00:03:00"}, 
                   {"ID":"1 - Workshop", Time:15000, TimeC:"00:06:00"}, 
                   //{"ID":"1 - Common", Time:2000, TimeC:"00:01:00"}, 
                   {"ID":"2 - Keynote", Time:3000, TimeC:"00:02:00"}, 
                   {"ID":"2- Orientation", Time:2000, TimeC:"00:03:00"}, 
                   {"ID":"3 - Missions",Time:18000,  TimeC:"00:30:00"}, 
                   {"ID":"4 - Ivor", Time:5000, TimeC:"00:03:00"},
                   {"ID":"4 - Apt", Time:10000, TimeC:"00:12:00"},
                   {"ID":"5 - Janine", Time:2000, TimeC:"00:02:00"},
                   {"ID":"6 - Action", Time:4000, TimeC:"00:04:00"}, 
                   {"ID":"6 - Basement", Time:3000, TimeC:"00:04:00"}, 
                   {"ID":"Postshow", Time:15000, TimeC:"00:15:00"}, ]; 
   
  
  }
  
  
  getShowStructure()
  {
    return this.ShowStructure ; 
  }
  getSections()
  {
    return   this.Structure  ; 
  }
  
  
   removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

 removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}
//Usage
  
    //{"ShowID":ShowID,"GroupID":GroupID,"PlayerID":PlayerID}
    
   // myGroups.join( msg); 
  
  join(msg) 
  {
    
   // console.log(JSON.stringify(msg)); 
   // console.log(JSON.stringify(this.Structure)); 
   // console.log(JSON.stringify(this.Structure[msg.Next])); 
   this.Structure[msg.Next]["CurrentShows"].push(msg.ID); 
    
    this.removeItemAll(this.Structure[msg.Prev]["CurrentShows"], msg.ID); 
    
 //   console.log(JSON.stringify(this.Structure)); 
  //this.leave(msg);
      
  }
  leave(msg)
  {
    
    this.removeItemAll(this.Structure[msg.SegmentID]["CurrentShows"], msg.ShowID); 
  }
  

  area() {
    return this.width ** 2;
  }
};