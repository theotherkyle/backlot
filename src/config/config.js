


// Assigning to exports will not modify module, must use module.exports
module.exports = class Config {
  constructor() {
    this.config_Rate = 1000; 
   this.config_PulseRate = 15* this.config_Rate ; 

 
  }

};