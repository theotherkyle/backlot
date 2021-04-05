// Assigning to exports will not modify module, must use module.exports
var EventEmitter = require('events');

module.exports = class Groups extends EventEmitter {
  


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
    
   // myGroups.join( msg); 
  
  join(msg)
  {
      if(!this.ShowArr[msg.ShowID])
    {
      console.log("creating "+ msg.ShowID); 
        this.ShowArr[msg.ShowID] = {}; 
    }
    
    if(!this.ShowArr[msg.ShowID][msg.GroupID])
    {
      
        console.log("creating "+ msg.GroupID); 
        this.ShowArr[msg.ShowID][msg.GroupID] = []; 
    }
    this.ShowArr[msg.ShowID][msg.GroupID].push(msg.PlayerID); 
    
    console.log(this.ShowArr); 
  }
  leave(msg)
  {
    
     if(this.ShowArr[msg.ShowID])
    {
        if(this.ShowArr[msg.ShowID][msg.GroupID])
    {
      
        console.log(this.removeItemAll(this.ShowArr[msg.ShowID][msg.GroupID], msg.PlayerID));
       if(this.ShowArr[msg.ShowID][msg.GroupID].length ==0)
         {
           delete this.ShowArr[msg.ShowID][msg.GroupID]; 
         }
      
    }
    }
  }
  

  area() {
    return this.width ** 2;
  }
};