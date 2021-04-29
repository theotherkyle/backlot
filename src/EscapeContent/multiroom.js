
// Assigning to exports will not modify module, must use module.exports
module.exports = class AdventureBuilding {
  constructor(width) {
    this.width = width;
    
    

 this.BuildingMap = {"FirstFloor":{
                "0":{"name":"CCTV Room", connections:["1"],  "status":"Unlocked"}, 
                "1":{"name":"hallway", connections:["0", "2", "3", "4", "5", "8"]}, 
                "2":{"name":"Room 1", connections:["1"], "status":"Locked"}, 
                "3":{"name":"Room 2", connections:["1"], "status":"Locked"}, 
                "4":{"name":"Room 3", connections:["1"], "status":"Locked"}, 
                "5":{"name":"hallway 2", connections:["1", "6", "7"]}, 
                "6":{"name":"Room 4", connections:["5"], "status":"Locked"}, 
                "7":{"name":"Room 5", connections:["5"], "status":"Locked"}, 
                "8":{"name":"Elevator Room", connections:["1"], "status":"Unlocked"}, 
                }
                  };
    
     this.LocationsMap = [{x:3, y:0, w:1, h:1, name:"CCTV room", color:"brown", doors:"bottom", "status":"Locked"}, 
                          {x:4, y:0, w:6, h:1, name:"hallway", color:"#1c355c", type:"XHallway", doors:{"top":[0,3, 5], "bottom":[0,2,4]}}, 
                          {x:5, y:0, w:1, h:1, name:"Room 1", color:"#4c77ba", doors:"top",  "status":"Locked"},
                          {x:5, y:2, w:1, h:1, name:"Room 2", color:"#4c77ba",doors:"top",  "status":"Locked"},
                          {x:5, y:4, w:2, h:1, name:"Room 3", color:"#4c77ba",doors:"top", "status":"Locked"}, 
                          {x:0, y:5, w:1, h:4, name:"hallway 2", color:"#1c355c", type:"YHallway", doors:{"left":[0,2], "bottom":[5]}},
                          {x:0, y:4, w:1, h:1, name:"Room 4", color:"#4c77ba",doors:"right", "status":"Locked"}, 
                          {x:2, y:4, w:1, h:1, name:"Room 5", color:"#4c77ba",doors:"right", "status":"Locked"}, 
                          {x:3, y:3, w:1, h:1, name:"Elevator Room", color:"brown",doors:"bottom", "status":"Unlocked"}, 
                         
                         
                         
                         ];

    
    this.roomURLs = {
                "0":"0", 
                "1":"1", 
                "2":"2", 
                "3":"3", 
                "4":"4", 
                "5":"5", 
                "6":"6", 
                "7":"7", 
                "8":"8", 
                }
    
  }
  
  getBuildingMap()
  {
    return  {"Connections":this.BuildingMap, "Locations": this.LocationsMap }; 
  }

  area() {
    return this.width ** 2;
  }
  
  retrieveRoomURL(roomID)
  {
    
    console.log("retrieveRoomURL")
    return this.roomURLs[roomID]; 
    
    
  }
};



                   
3