
// our default array of dreams



let Tap = require('./src/services/Tap.js');

 function BarAppliances(numberofTaps)  {
  
   //Taps = [];  
  //constructor() {
    
    this.Taps  = [numberofTaps]; 
    for (var i = 0; i < numberofTaps; i++) {
     this.Taps [i] = new Tap("John");
 // }
  
  }
  function getTaps()
  {
    return this.Taps; 
  }
};





//export { Tap, BarAppliances }

// now we export the class, so other modules can create Cat objects
module.exports = {
    BarAppliances: BarAppliances, 
  //  Tap: Tap, 
  
}