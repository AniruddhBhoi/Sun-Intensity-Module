const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Static frontend
app.use(express.static(path.join(__dirname, 'static')));

// Serial port config (adjust COM port if needed) or enable simulation
const SIMULATE = process.env.SIMULATE === '1' || process.env.SIMULATE === 'true';
const COM_PORT = process.env.COM_PORT || 'COM7';
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '115200', 10);

if (!SIMULATE) {
  let port;
  try {
    port = new SerialPort({ path: COM_PORT, baudRate: BAUD_RATE });
  } catch (e) {
    console.error('SerialPort init error:', e.message);
  }

  if (port) {
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', line => {
      const text = line.toString().trim();
      // Try to parse numeric lux value
      const value = parseFloat(text);
      if (!isNaN(value)) {
        const payload = makePayload(value);
        io.emit('lux', payload);
        console.log('Lux ->', payload);
      } else {
        console.log('Msg ->', text);
        io.emit('sys', { message: text });
      }
    });

    port.on('error', err => console.error('Serial error:', err.message));
  }
} else {
  console.log('Simulation mode enabled: emitting fake lux values');
  // emit simulated readings every 2 seconds
  setInterval(() => {
    const lux = simulateLux();
    const payload = makePayload(lux);
    io.emit('lux', payload);
    console.log('Sim Lux ->', payload);
  }, 2000);
}

function makePayload(lux) {
  // Extra derived info
  const classification = classifyLux(lux);
  const suggestedAction = suggestionForLux(lux);
  // Estimate irradiance (W/m2) from lux using a typical conversion for daylight.
  // Approx: 1 lux ≈ 0.0079 W/m2 (varies with spectrum). This is a rough estimate.
  const irradiance = lux * 0.0079;
  // Panel defaults (can be made configurable)
  const panelArea = parseFloat(process.env.PANEL_AREA_M2) || 0.1; // m^2
  const panelEfficiency = parseFloat(process.env.PANEL_EFFICIENCY) || 0.18; // 18%
  const estimatedPowerW = irradiance * panelArea * panelEfficiency; // Watts
  const estimatedEnergyPerHourWh = estimatedPowerW; // Wh per hour ~ W * 1h

  return {
    lux,
    classification,
    suggestedAction,
    irradiance: Math.round(irradiance * 100) / 100,
    estimatedPowerW: Math.round(estimatedPowerW * 100) / 100,
    estimatedEnergyPerHourWh: Math.round(estimatedEnergyPerHourWh * 100) / 100,
    panelArea,
    panelEfficiency,
    timestamp: new Date().toISOString()
  };
}

function classifyLux(lux) {
  if (lux < 10) return 'Very Dark (Night)';
  if (lux < 100) return 'Dim (Indoor)';
  if (lux < 1000) return 'Well-lit (Indoor/Cloudy)';
  if (lux < 10000) return 'Bright (Overcast/Daylight)';
  if (lux < 40000) return 'Sunlit (Direct Sun Low)';
  return 'Very Bright (Direct Sun)';
}

function suggestionForLux(lux) {
  if (lux < 100) return 'Increase exposure / use artificial light';
  if (lux < 10000) return 'Good for plant growth';
  return 'High intensity — consider shading or sunglasses';
}

// Simulation helper: produce plausible day/night cycles and variability
function simulateLux() {
  // base cycles by hour of day
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  // approximate sunlight curve: low at night, peak midday
  const dayFactor = Math.max(0, Math.sin((Math.PI * (h - 6)) / 12)); // peaks at ~12
  const peak = 80000; // peak lux for direct sun
  const base = dayFactor * peak;
  // add noise
  const noise = (Math.random() - 0.5) * 0.1 * base + (Math.random() * 50);
  const lux = Math.max(0, base + noise);
  return Math.round(lux * 100) / 100;
}

io.on('connection', socket => {
  console.log('Client connected', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Dashboard running: http://localhost:${PORT}`));
