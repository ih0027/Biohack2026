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
const MAX_PH = 3.5;


/*
   These are the same type of simulated
   gastric pH values used in the existing demo.
*/

const values = [
  2.42, 2.51, 2.48, 2.57,
  2.61, 2.55, 2.63, 2.58,
  2.52, 2.47, 2.54, 2.50
];


let samples = 0;


/* ============================= */
/* INSTALLATION STATE            */
/* ============================= */

let phase = "ready";

let pressure = 0;

let pressureHistory = [0];

let travelIndex = 0;


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

const deflateButton =
  document.getElementById("deflateButton");

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
  const max = 10;


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


  [10, 8, 6, 4, 2, 0]
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

  deflateButton.disabled =
    true;


  setSystemStatus(
    "DEPLOYING",
    true
  );

  updatePacket();
}


/* ============================= */
/* SIMULATED TRAVEL + PH         */
/* ============================= */

function simulateTravel() {

  if (phase !== "deploying") {
    return;
  }


  /*
     Simulated readings as the tube
     progresses through the demonstration.

     The final readings enter the
     expected gastric range.
  */

  const travelValues = [

    5.9,
    5.4,
    5.0,
    4.7,
    4.3,
    4.0,
    3.8,
    3.6,
    3.4,
    3.1,
    2.8,
    2.6,
    2.5

  ];


  const ph =
    travelValues[
      Math.min(
        travelIndex,
        travelValues.length - 1
      )
    ];


  travelIndex++;


  /*
     Update pH display.
  */

  setPH(ph);


  /*
     Simulated pressure increase.
  */

  pressure += 0.8;

  pressure =
    Math.min(
      pressure,
      8
    );


  pressureHistory.push(
    pressure
  );


  if (
    pressureHistory.length > 30
  ) {
    pressureHistory.shift();
  }


  /*
     Gastric pH detected.
  */

  if (
    ph >= MIN_PH &&
    ph <= MAX_PH
  ) {

    phase = "installed";


    installationState.textContent =
      "Sensor installed — gastric pH detected";

    installationStatus.textContent =
      "Sensor installed";

    deploymentStatus.textContent =
      "Complete";

    valveStatus.textContent =
      "Closed";

    pressureValve.textContent =
      "Closed";


    deflateButton.disabled =
      false;


    setSystemStatus(
      "SENSOR INSTALLED"
    );
  }


  updatePressureUI();

  updatePacket();

  drawPressureChart();
}


/* ============================= */
/* DEFLATE                       */
/* ============================= */

function startDeflation() {

  if (phase !== "installed") {
    return;
  }


  phase = "deflating";


  deflateButton.disabled =
    true;


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

  deflateButton.disabled =
    true;


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

deflateButton.addEventListener(
  "click",
  startDeflation
);

emergencyButton.addEventListener(
  "click",
  emergencyStop
);


/* ============================= */
/* SIMULATION CLOCK               */
/* ============================= */

setInterval(() => {

  if (phase === "deploying") {
    simulateTravel();
  }

  if (phase === "deflating") {
    simulateDeflation();
  }

}, 900);


/* ============================= */
/* INITIAL STATE                  */
/* ============================= */

setPH(
  values[values.length - 1]
);

updatePressureUI();

updatePacket();

drawPressureChart();
