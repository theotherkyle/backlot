// Timer on process, it works for now but there is a ton of work left to make it a good app. Still, it makes it's VERY specific job, so cool

let min = document.getElementById("min");
let sec = document.getElementById("sec");
let extraSec = document.getElementById("extra-sec");
let extraMin = document.getElementById("extra-min");
let startButton = document.getElementById("start-btn");
let allTime = document.getElementById("all-time");

let secVal = 0;
let minVal = 0;
let counter = 0;
// Function used inside TimeHandler when 15 minutes is reached
function myStopFunction() {
  clearInterval(timer);
  startButton.disabled = false;
  // setTimeout(()=>alert("Finished!"),0)
}

// Main function
function timeHandler() {
  if (counter == 900){
    allTime.style.color = "red";
    myStopFunction();  
    return;
  }
  // update counter each second
  counter++;
  console.log(counter);
  secVal++;
  sec.innerHTML = secVal;
  // Take care of the extra zeroes
  if (secVal > 9) {
    extraSec.style.display = "none";
  }
  if (minVal > 9) { 
    extraMin.style.display = "none";
  }
  // Resets the seconds display an value each minute
  if (secVal == 60) {
    sec.innerHTML = 0;
    extraSec.style.display = "inline";
    minVal++;
    min.innerHTML = minVal; 
    secVal = 0;
  }
}

// Calls the function every second
let timer = function() {
  startButton.disabled = true;
  setInterval(timeHandler, 1000);
}
// Event handler
startButton.addEventListener("click", timer); 



 
