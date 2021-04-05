// Assigning to exports will not modify module, must use module.exports
var EventEmitter = require('events');

module.exports = class sectionsmanager extends EventEmitter {
  


  constructor(width) {
    super();
    this.width = width;
    this.tick = 1000; 
  this.CurrentPosition = -1;
    
     this.Structure = {"":{Time:0, CurrentShows:[]},
                        "Preshow":{Time:15000, CurrentShows:[]},
                       "Welcome":{ Time:3000, CurrentShows:[]}, 
                        "Workshops":{Time:6000, CurrentShows:[]}, 
                        "Recap":{ Time:1000, TimeC:"00:01:00", CurrentShows:[]}, 
                        "Keynote":{  Time:2000, TimeC:"00:02:00", CurrentShows:[]}, 
                         "Orientation":{  Time:3000, TimeC:"00:03:00", CurrentShows:[]}, 
                         "Missions":{ Time:30000,  TimeC:"00:30:00", CurrentShows:[]}, 
                         "CrossOver":{  Time:3000, TimeC:"00:03:00", CurrentShows:[]},
                         "Mashup":{  Time:12000, TimeC:"00:12:00", CurrentShows:[]},
                         "Travel":{ Time:2000, TimeC:"00:02:00", CurrentShows:[]},
                         "Basement":{ Time:4000, TimeC:"00:04:00", CurrentShows:[]}, 
                         "Hero":{  Time:4000, TimeC:"00:04:00", CurrentShows:[]}, 
                         "Postshow":{  Time:15000, TimeC:"00:15:00", CurrentShows:[]}}; 
    
  this.ShowStructure = [{"ID":"Preshow", Time:15000, TimeC:"00:15:00"},
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
                   {"ID":"Postshow", Time:15000, TimeC:"00:15:00"}]; 
    
  }
  
  reset()
  {
    
    this.tick = 1000; 
  this.CurrentPosition = -1;
    
     this.Structure = {"":{Time:0, CurrentShows:[]},
                        "Preshow":{Time:15000, CurrentShows:[]},
                       "Welcome":{ Time:3000, CurrentShows:[]}, 
                        "Workshops":{Time:6000, CurrentShows:[]}, 
                        "Recap":{ Time:1000, TimeC:"00:01:00", CurrentShows:[]}, 
                        "Keynote":{  Time:2000, TimeC:"00:02:00", CurrentShows:[]}, 
                         "Orientation":{  Time:3000, TimeC:"00:03:00", CurrentShows:[]}, 
                         "Missions":{ Time:30000,  TimeC:"00:30:00", CurrentShows:[]}, 
                         "CrossOver":{  Time:3000, TimeC:"00:03:00", CurrentShows:[]},
                         "Mashup":{  Time:12000, TimeC:"00:12:00", CurrentShows:[]},
                         "Travel":{ Time:2000, TimeC:"00:02:00", CurrentShows:[]},
                         "Basement":{ Time:4000, TimeC:"00:04:00", CurrentShows:[]}, 
                         "Hero":{  Time:4000, TimeC:"00:04:00", CurrentShows:[]}, 
                         "Postshow":{  Time:15000, TimeC:"00:15:00", CurrentShows:[]}}; 
    
 
  this.ShowStructure = [{"ID":"Preshow", Time:15000, TimeC:"00:15:00"},
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
                   {"ID":"Postshow", Time:15000, TimeC:"00:15:00"}]; 
  
  
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
   this.Structure[msg.Next]["CurrentShows"].push(msg.ID); 
    
    this.removeItemAll(this.Structure[msg.Prev]["CurrentShows"], msg.ID); 
    
    //console.log(JSON.stringify(this.Structure)); 
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