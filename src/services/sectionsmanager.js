// Assigning to exports will not modify module, must use module.exports
var EventEmitter = require('events');

module.exports = class sectionsmanager extends EventEmitter {
  


  constructor(width) {  
    super();
    this.width = width;
    
    this.set();
  }
    
    set(){
      
    this.tick = 1000; 
  this.CurrentPosition = -1;
    
  //  "possibly reduce 6min w:
// 10+20+5+18+15+2+10"
    //SLIME(10+22+6+21+16+2+10)
    
     this.Structure = {"":{Time:0, CurrentShows:[], id:-1},
                        "0 - Arrivals":{Time:15, CurrentShows:[], id:0},
                       "1 - Welcome":{ Time:4, CurrentShows:[], id:1}, 
                        "1 - Workshop A":{Time:5, CurrentShows:[], id:2}, 
                        "1 - Workshop B":{Time:5, CurrentShows:[], id:3}, 
                        "1 - Workshop C":{Time:5, CurrentShows:[], id:4}, 
                        "1 - Common":{ Time:2, CurrentShows:[], id:5},  // 0
                        "2 - Keynote":{  Time:3, CurrentShows:[], id:6}, 
                         "2- Orientation":{  Time:3, CurrentShows:[], id:7}, //3 //2000
                         "3 - Missions A":{ Time:7, CurrentShows:[], id:8}, //21 //180000
                         "3 - Missions B":{ Time:7, CurrentShows:[], id:9}, //21 //180000
                         "3 - Missions C":{ Time:7, CurrentShows:[], id:10}, //21 //180000
                         "4 - Ivor":{  Time:5, CurrentShows:[], id:11},//6
                         "4 - Apt":{  Time:10, CurrentShows:[], id:12},
                         "5 - Janine":{ Time:2, CurrentShows:[], id:13},
                         "6 - Action":{ Time:4, CurrentShows:[], id:14}, 
                         "6 - Basement":{  Time:3, CurrentShows:[], id:15}, 
                         "Postshow":{  Time:15, CurrentShows:[], id:16}}; 
    
    
  this.ShowStructure = [{"ID":"0 - Arrivals", Time:15, troupe:0, stages:[0]},
                   {"ID":"1 - Welcome", Time:4, troupe:1 , stages:[1]}, 
                   {"ID":"1 - Workshop A", Time:5, troupe:2, stages:[2]}, 
                   {"ID":"1 - Workshop B", Time:5, troupe:2, stages:[2]}, 
                   {"ID":"1 - Workshop C", Time:5, troupe:2, stages:[2]}, 
                   {"ID":"1 - Common", Time:2, TimeC:"00:01:00", stages:[]}, // 0
                   {"ID":"2 - Keynote", Time:3, troupe:3, stages:[3]}, 
                   {"ID":"2- Orientation", Time:3, troupe:3, stages:[]},  //3 //2000
                   {"ID":"3 - Missions A",Time:7,  troupe:4, stages:[4,5]}, //21 //180000
                   {"ID":"3 - Missions B",Time:7,  troupe:4, stages:[4,5]}, //21 //180000
                   {"ID":"3 - Missions C",Time:7,  troupe:4, stages:[4,5]}, //21 //180000
                   {"ID":"4 - Ivor", Time:5, troupe:5, stages:[]},
                   {"ID":"4 - Apt", Time:10, troupe:5, stages:[6]},
                   {"ID":"5 - Janine", Time:2, troupe:6, stages:[7]},
                   {"ID":"6 - Action", Time:4, troupe:6, stages:[8]}, 
                   {"ID":"6 - Basement", Time:3, troupe:6, stages:[8]}, 
                   {"ID":"Postshow", Time:15, troupe:7, stages:[9]}, ]; 
    
    
    
    this.Stages =  [];
    this.troupeScene =  [];
    
  //  [[0], [1], [2], [3,4], [5] ];
  var i = 0; 
    this.ShowStructure.forEach(element => {
      
      element.stages.forEach(stageElement => {
          
        if(this.Stages[stageElement] ) {}
        else this.Stages[stageElement] = []; 
          this.Stages[stageElement].push(i);
      
        
      });
    
      
      if(this.troupeScene[element.troupe] )
      {
          
      }
      else this.troupeScene[element.troupe] = []
      this.troupeScene[element.troupe].push(i);
      
      
      
      i++;
});
    console.log( this.troupeScene); 
    
    
    
            this.OldStructure = {"":{Time:0, CurrentShows:[]},
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
    
    
  this.OldShowStructure = [{"ID":"Preshow", Time:15000, TimeC:"00:15:00"},
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
    
    this.set(); 
 
  
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