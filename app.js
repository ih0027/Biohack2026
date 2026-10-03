const values = [6.72, 6.78, 6.75, 6.83, 6.88, 6.84, 6.91, 6.87, 6.82, 6.86, 6.80, 6.84];
let samples = 0;

const phValue = document.getElementById("phValue");
const phState = document.getElementById("phState");
const timestamp = document.getElementById("timestamp");
const packetPh = document.getElementById("packetPh");
const packetTime = document.getElementById("packetTime");
const samplesEl = document.getElementById("samples");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

function stateForPH(ph) {
  if (ph < 3.5) return "STRONGLY ACIDIC";
  if (ph < 6.5) return "ACIDIC";
  if (ph <= 7.5) return "NEUTRAL / SLIGHTLY ACIDIC";
  if (ph <= 8.5) return "SLIGHTLY BASIC";
  return "BASIC";
}

function drawChart() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "#e6eaf0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 20 + i * ((h - 45) / 4);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const min = 6.4, max = 7.1;
  ctx.strokeStyle = "#4f46e5";
  ctx.lineWidth = 3;
  ctx.beginPath();

  values.forEach((v, i) => {
    const x = i * (w - 20) / (values.length - 1) + 10;
    const y = 20 + (max - v) / (max - min) * (h - 55);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#667085";
  ctx.font = "12px system-ui";
  [7.1, 6.9, 6.7, 6.5, 6.4].forEach((v, i) => {
    ctx.fillText(v.toFixed(1), 5, 24 + i * ((h - 55) / 4));
  });
}

function updateReading() {
  const last = values[values.length - 1];
  const next = Math.max(6.45, Math.min(7.05, last + (Math.random() - 0.5) * 0.10));
  values.push(Number(next.toFixed(2)));
  if (values.length > 20) values.shift();

  const ph = values[values.length - 1];
  const now = new Date().toLocaleTimeString();

  phValue.textContent = ph.toFixed(2);
  phState.textContent = stateForPH(ph);
  timestamp.textContent = now;
  packetPh.textContent = ph.toFixed(2);
  packetTime.textContent = now;
  samples++;
  samplesEl.textContent = samples;

  drawChart();
}

drawChart();
updateReading();
setInterval(updateReading, 1000);
