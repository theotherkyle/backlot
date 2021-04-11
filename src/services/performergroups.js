// Assigning to exports will not modify module, must use module.exports
var EventEmitter = require('events');

module.exports = class PerformerGroups extends EventEmitter {
  


  constructor(width) {
    super();
    this.width = width;
    this.tick = 1000; 
  this.CurrentPosition = -1;
    this.ShowArr = {}; 
    
  }
  
  getGroups()
  {
    return this.ShowArr ; 
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
  // {"StageName":"AssistanceFacilitatorStage","PerformerID":"2"}
  
    
   // myGroups.join( msg); 
  
  join(msg)
  {
      if(!this.ShowArr[msg.StageName])
    {
      console.log("creating "+ msg.StageName); 
        this.ShowArr[msg.StageName] = {}; 
    }
    
    if(!this.ShowArr[msg.StageName][msg.PerformerID])
    {
      
        console.log("creating "+ msg.PerformerID); 
        this.ShowArr[msg.StageName][msg.PerformerID] = []; 
    }
    this.ShowArr[msg.StageName][msg.PerformerID].push(msg.PerformerID); 
    
    console.log(this.ShowArr); 
  }
  leave(msg)
  {
    
     if(this.ShowArr[msg.StageName])
    {
        if(this.ShowArr[msg.StageName][msg.PerformerID])
    {
      
        console.log(this.removeItemAll(this.ShowArr[msg.StageName][msg.PerformerID], msg.PerformerID));
       if(this.ShowArr[msg.StageName][msg.PerformerID].length ==0)
         {
           delete this.ShowArr[msg.StageName][msg.PerformerID]; 
         }
      
    }
    }
  }
  

  area() {
    return this.width ** 2;
  }
};