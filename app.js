// =====================================================
// ALENTRA INSTALLATION DEMO
//
// SIMULATION ONLY.
// This code does not control a real pump, valve,
// balloon, feeding tube, or patient.
// =====================================================


/* ============================= */
/* PH SENSOR                     */
/* ============================= */

const MIN_PH = 1.5;
const MAX_PH = 5.5;

const TIME_TO_INFLATE = 0.5;
const TIME_TO_TRAVEL = 10;
const TIME_TO_DEFLATE = 1;


/*
   These are the same type of simulated
   gastric pH values used in the existing demo.
*/

const values = [];


let samples = 0;
let currentPH = 7;


/* ============================= */
/* INSTALLATION STATE            */
/* ============================= */

let phase = "ready";

let pressure = 0;

let pressureHistory = [0];

let travelIndex = 0;

let inStomach = false;

let pH = 7.0;

let ipH = 0;

let iPressure = 0;

let startPressure = 0;


/* ============================= */
/* ELEMENTS                      */
/* ============================= */

const phValue =
  document.getElementById("phValue");

const phState =
  document.getElementById("phState");

const timestamp =
  document.getElementById("timestamp");

const samplesEl =
  document.getElementById("samples");


const systemStatus =
  document.getElementById("systemStatus");

const installationState =
  document.getElementById("installationState");

const deploymentStatus =
  document.getElementById("deploymentStatus");

const valveStatus =
  document.getElementById("valveStatus");

const balloonStatus =
  document.getElementById("balloonStatus");

const installationStatus =
  document.getElementById("installationStatus");


const pressureValve =
  document.getElementById("pressureValve");

const pressureValue =
  document.getElementById("pressureValue");

const balloonState =
  document.getElementById("balloonState");

const pressureChange =
  document.getElementById("pressureChange");


const packetPhStatus =
  document.getElementById("packetPhStatus");

const packetPosition =
  document.getElementById("packetPosition");

const packetBalloon =
  document.getElementById("packetBalloon");

const packetPressure =
  document.getElementById("packetPressure");

const packetSystem =
  document.getElementById("packetSystem");


const deployButton =
  document.getElementById("deployButton");

const emergencyButton =
  document.getElementById("emergencyButton");


const canvas =
  document.getElementById("pressureChart");

const ctx =
  canvas.getContext("2d");


/* ============================= */
/* SYSTEM STATUS                 */
/* ============================= */

function setSystemStatus(text, active = false) {

  systemStatus.innerHTML =
    `<span></span> ${text}`;

  if (active) {

    systemStatus.style.background = "#fff4e5";
    systemStatus.style.color = "#9a5b00";

    systemStatus
      .querySelector("span")
      .style.background = "#f39c12";

  } else {

    systemStatus.style.background = "#eaf8ef";
    systemStatus.style.color = "#18733a";

    systemStatus
      .querySelector("span")
      .style.background = "#27ae60";
  }
}

/** Adds a random amount of noise between max and min to n */
function addNoise(n, max, min){
  return n+Math.random() * (max - min) + min;
}

function addSmoothNoise(n, lastn, max, min, maxStep){
  let t=n+Math.random() * (max - min) + min;
  if(t-lastn>maxStep){
    return lastn+maxStep;
  } else if(t-lastn < -maxStep){
    return lastn-maxStep;
  }
  return t;
}

function addPressure(p){
  pressureHistory.push(p);
  if (pressureHistory.length > 30){
    pressureHistory.shift();
  }
}

/** The main function to simulate recieving data */
function simulateEntry(){
  if (phase == "deploying"){
    if(iPressure < 10*TIME_TO_INFLATE){
      pressure = pressure + (1.5/(10*TIME_TO_INFLATE));
      pressure = addNoise(pressure, -0.05,0.05);
      addPressure(pressure);
    }else if(iPressure < 10*(TIME_TO_INFLATE+TIME_TO_TRAVEL)){
      pressure = addSmoothNoise(1.5,pressure,-0.25,0.25,0.05)
      addPressure(pressure);
    }else if(iPressure < 10 *(TIME_TO_INFLATE+TIME_TO_TRAVEL+0.5)){
      inStomach = true;
      pH =4.0;
      pressure = pressure+(1.5/(10*TIME_TO_INFLATE));
      pressure = addNoise(pressure, -0.05,0.05);
      addPressure(pressure);
    } else {
      phase = "DEFLATING";
      iPressure = 0;
    }
    iPressure = iPressure+1;
  } else if (phase == "DEFLATING"){
    if(iPressure == 1){
      startPressure = pressure;
    }
    if(pressure > 0){
      pressure = pressure - (startPressure/(10*TIME_TO_DEFLATE));
      pressure = addNoise(pressure, -0.05,0.05);
      if(pressure < 0){
        pressure = 0;
      }
      addPressure(pressure);
    } else {
      phase = "";INSTALLED
    }
    iPressure=iPressure+1;
  } else if (phase == "stopped"){
    if(pressure > 0){
      pressure = pressure - (2.0/(10*TIME_TO_DEFLATE));
      pressure = addNoise(pressure, -0.05,0.05);
      if(pressure < 0){
        pressure = 0;
      }
      addPressure(pressure);
    }
  } else {
    if (pressure == 0){
      addPressure(0);
    }
  }
  if (ipH == 9){
    setPH(readPH());
  }
  ipH = (ipH+1)%10;

  updatePressureUI();
  updatePacket();
  drawPressureChart();
}

const simulateId = setInterval(simulateEntry, 100);

/* ============================= */
/* PH LOGIC                      */
/* ============================= */

function stateForPH(ph) {

  if (ph < MIN_PH) {
    return "BELOW EXPECTED GASTRIC RANGE";
  }

  if (ph > MAX_PH) {
    return "ABOVE EXPECTED GASTRIC RANGE";
  }

  return "WITHIN EXPECTED GASTRIC RANGE";
}


function setPH(ph) {

  currentPH = ph;

  values.push(ph);

  if (values.length > 20) {
    values.shift();
  }

  const now =
    new Date().toLocaleTimeString();

  phValue.textContent =
    ph.toFixed(2);

  phState.textContent =
    stateForPH(ph);

  timestamp.textContent =
    now;

  samples++;

  samplesEl.textContent =
    samples;
}


function readPH() {
  if (!inStomach){
    pH = addSmoothNoise(7.0,pH,0.5,-.5,.25);
    return pH;
  } else {
    pH = addSmoothNoise(3.0,pH,0.25,-.25,.25);
    return pH;
  }
}


/* ============================= */
/* INSTALLATION PACKET           */
/* ============================= */

function updatePacket() {

  packetPressure.textContent =
    pressure.toFixed(1);


  if (phase === "ready") {

    packetPhStatus.textContent =
      "WAITING";

    packetPosition.textContent =
      "NOT DETECTED";

    packetBalloon.textContent =
      "DEFLATED";

    packetSystem.textContent =
      "READY";
  }


  if (phase === "deploying") {

    packetPhStatus.textContent =
      "SCANNING";

    packetPosition.textContent =
      "TRAVELING";

    packetBalloon.textContent =
      "INFLATED";

    packetSystem.textContent =
      "DEPLOYING";
  }


  if (phase === "installed") {

    packetPhStatus.textContent =
      "GASTRIC RANGE";

    packetPosition.textContent =
      "DETECTED";

    packetBalloon.textContent =
      "INFLATED";

    packetSystem.textContent =
      "SENSOR INSTALLED";
  }


  if (phase === "deflating") {

    packetPhStatus.textContent =
      "GASTRIC RANGE";

    packetPosition.textContent =
      "INSTALLED";

    packetBalloon.textContent =
      "DEFLATING";

    packetSystem.textContent =
      "PRESSURE DROPPING";
  }


  if (phase === "complete") {

    packetPhStatus.textContent =
      "GASTRIC RANGE";

    packetPosition.textContent =
      "INSTALLED";

    packetBalloon.textContent =
      "DEFLATED";

    packetSystem.textContent =
      "INSTALLATION COMPLETE";
  }


  if (phase === "stopped") {

    packetPhStatus.textContent =
      "PAUSED";

    packetPosition.textContent =
      "UNKNOWN";

    packetBalloon.textContent =
      "STOPPED";

    packetSystem.textContent =
      "EMERGENCY STOP";
  }
}


/* ============================= */
/* PRESSURE DISPLAY              */
/* ============================= */

function updatePressureUI() {

  pressureValue.textContent =
    pressure.toFixed(1);


  if (pressure > 0.5) {

    balloonState.textContent =
      "Inflated";

    balloonStatus.textContent =
      "Inflated";

  } else {

    balloonState.textContent =
      "Deflated";

    balloonStatus.textContent =
      "Deflated";
  }
}


/* ============================= */
/* PRESSURE GRAPH                */
/* ============================= */

function drawPressureChart() {

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(
    0,
    0,
    w,
    h
  );


  const min = 0;
  const max = 4;


  /*
     Grid
  */

  ctx.strokeStyle =
    "#e6eaf0";

  ctx.lineWidth = 1;


  for (let i = 0; i <= 5; i++) {

    const y =
      20 +
      i * ((h - 55) / 5);

    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(w, y);

    ctx.stroke();
  }


  /*
     Axis labels
  */

  ctx.fillStyle =
    "#667085";

  ctx.font =
    "12px system-ui";


  [4, 3.2, 2.4, 1.6, 0.8, 0]
    .forEach((v, i) => {

      const y =
        24 +
        i * ((h - 55) / 5);

      ctx.fillText(
        v,
        5,
        y
      );

    });


  if (pressureHistory.length < 2) {
    return;
  }


  /*
     Pressure line
  */

  ctx.strokeStyle =
    "#4f46e5";

  ctx.lineWidth = 3;

  ctx.beginPath();


  pressureHistory.forEach(
    (value, i) => {

      const x =
        i *
        (w - 20) /
        Math.max(
          pressureHistory.length - 1,
          1
        ) + 10;


      const y =
        20 +
        ((max - value) /
        (max - min)) *
        (h - 55);


      if (i === 0) {

        ctx.moveTo(x, y);

      } else {

        ctx.lineTo(x, y);

      }

    }
  );


  ctx.stroke();
}


/* ============================= */
/* DEPLOY                       */
/* ============================= */

function startDeployment() {

  if (
    phase !== "ready" &&
    phase !== "stopped"
  ) {
    return;
  }


  phase = "deploying";

  travelIndex = 0;

  pressure = 0;

  pressureHistory = [0];


  deploymentStatus.textContent =
    "Active";

  valveStatus.textContent =
    "Open";

  pressureValve.textContent =
    "Open";

  installationStatus.textContent =
    "Searching";

  installationState.textContent =
    "Deploying — monitoring pH";


  deployButton.disabled =
    true;



  setSystemStatus(
    "DEPLOYING",
    true
  );

  updatePacket();
}


/* ============================= */
/* DEFLATE                       */
/* ============================= */

function startDeflation() {

  if (phase !== "installed") {
    return;
  }


  phase = "deflating";




  installationState.textContent =
    "Deflating — monitoring pressure";

  installationStatus.textContent =
    "Deflating";

  valveStatus.textContent =
    "Releasing";

  pressureValve.textContent =
    "Releasing";

  pressureChange.textContent =
    "Pressure dropping";


  setSystemStatus(
    "DEFLATING",
    true
  );


  updatePacket();
}


/* ============================= */
/* PRESSURE DROP                 */
/* ============================= */

function simulateDeflation() {

  if (phase !== "deflating") {
    return;
  }


  pressure -= 1;


  pressure =
    Math.max(
      pressure,
      0
    );


  pressureHistory.push(
    pressure
  );


  if (
    pressureHistory.length > 30
  ) {
    pressureHistory.shift();
  }


  updatePressureUI();


  /*
     Pressure has dropped to the
     simulated deflated state.
  */

  if (pressure <= 0.2) {

    pressure = 0;

    phase = "complete";


    installationState.textContent =
      "Installation complete";

    installationStatus.textContent =
      "Complete";

    valveStatus.textContent =
      "Closed";

    pressureValve.textContent =
      "Closed";

    pressureChange.textContent =
      "Pressure stabilized";


    setSystemStatus(
      "INSTALLATION COMPLETE"
    );


    updatePacket();
  }


  drawPressureChart();
}


/* ============================= */
/* EMERGENCY STOP                */
/* ============================= */

function emergencyStop() {

  if (phase === "complete") {
    return;
  }


  phase = "stopped";


  deploymentStatus.textContent =
    "Stopped";

  valveStatus.textContent =
    "Closed";

  pressureValve.textContent =
    "Closed";

  installationStatus.textContent =
    "Paused";

  installationState.textContent =
    "Emergency stop — simulation paused";

  pressureChange.textContent =
    "Stopped";


  deployButton.disabled =
    false;


  setSystemStatus(
    "EMERGENCY STOP",
    true
  );


  updatePacket();
}


/* ============================= */
/* BUTTONS                       */
/* ============================= */

deployButton.addEventListener(
  "click",
  startDeployment
);


emergencyButton.addEventListener(
  "click",
  emergencyStop
);


/* ============================= */
/* SIMULATION CLOCK               */
/* ============================= */
/*
setInterval(() => {

  if (phase === "deploying") {
    simulateTravel();
  } else {
    setPH(readPH());
  }

  if (phase === "deflating") {
    simulateDeflation();
  }

}, 900);
*/

/* ============================= */
/* INITIAL STATE                  */
/* ============================= */

setPH(
  values[values.length - 1]
);

updatePressureUI();

updatePacket();

drawPressureChart();
