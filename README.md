# # ☀️ Sun Intensity Module

A complete solar light intensity monitoring system that measures sunlight levels in lux and logs data over time.

## 📋 Project Overview

This project combines embedded systems with Python data logging to create a real-time sun intensity measurement and recording system. It uses the BH1750 digital light sensor interfaced with an ESP32 microcontroller to measure ambient light intensity and log measurements to both on-board storage and a connected computer.

## 🛠️ Hardware Components

- **Microcontroller**: ESP32 (Development Board)
- **Light Sensor**: BH1750 Digital Light Sensor
  - I2C Interface
  - Measuring Range: 1 - 65535 lux
  - Resolution: 0.5 lux step
  - Digital output
- **Communication**: USB/Serial (for data transfer to PC)
## ☀️ Sun Intensity Module + Live Dashboard

A complete solar light intensity monitoring system that measures sunlight levels in lux and provides a live dashboard with estimated irradiance and PV output.

## Project Overview

This project uses a BH1750 light sensor connected to an ESP32 to measure ambient light (lux). Data can be logged to CSV via `datalog.py` or streamed live to a Node.js dashboard which displays real-time lux, estimated irradiance (W/m²), and estimated PV power (W).

## What's Included

- `final_sun_inten_copy_20260407201555.ino` — ESP32 firmware using the BH1750 and LittleFS
- `datalog.py` — Python serial logger that writes valid lux values to `lux_data.csv`
- `server.js` — Node.js dashboard server (Socket.io + Serial)
- `static/index.html` — Frontend dashboard (Chart.js)
- `package.json` — Node dependencies
- `lux_data.csv` — example logged data


## Energy Estimation

The dashboard converts lux → irradiance using a rough conversion (1 lux ≈ 0.0079 W/m²). Estimated PV power is calculated as:

```
power_W = irradiance_W_per_m2 * panel_area_m2 * panel_efficiency
```

Defaults in `server.js`:
- `PANEL_AREA_M2 = 0.1` m²
- `PANEL_EFFICIENCY = 0.18` (18%)

Override using environment variables when starting the server.

**Note:** This conversion is approximate — for accurate energy estimation use an irradiance sensor (pyranometer) and account for panel angle, temperature, and system losses.

## Python Logger

`datalog.py` connects to the ESP32 over serial, filters non-numeric messages, and appends valid lux readings with timestamps to `lux_data.csv`.

Run:
```bash
python datalog.py
```

Edit `COM_PORT` inside `datalog.py` if necessary.

## Hardware Setup

Connect BH1750 to ESP32 via I2C:

| BH1750 | ESP32 |
|--------|-------|
| VCC    | 3.3V  |
| GND    | GND   |
| SCL    | GPIO22 (SCL) |
| SDA    | GPIO21 (SDA) |

