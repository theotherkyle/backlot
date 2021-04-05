
 class Tap {

  constructor(name) {
    this.name = name;
     this.tapState = 'closed';
  }

  sayHi() {
    alert(this.name);
  }
  
   Open() {
    this.tapState = 'open';
  }
  
   
   Close() {
     this.tapState = 'closed';
  }
  
  
  getState()
  {
    return this.tapState ; 
  }
  

}

//export { Tap, BarAppliances }

// now we export the class, so other modules can create Cat objects
module.exports = {
    Tap: Tap, 
  //  Tap: Tap, 
  
}