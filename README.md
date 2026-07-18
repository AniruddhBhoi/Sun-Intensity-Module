# ☀️ Sun Intensity Module

A complete solar light intensity monitoring system that measures sunlight levels in lux and logs data over time.

## 📋 Project Overview & Purpose

This project combines embedded systems with Python data logging to create a real-time sun intensity measurement and recording system. It uses the BH1750 digital light sensor interfaced with an ESP32 microcontroller to measure ambient light intensity and log measurements to both on-board storage and a connected computer. The primary purpose of this project is to provide a reliable, low-cost solution for continuously monitoring and recording solar light intensity. By capturing real-time lux data, this system helps in evaluating potential solar energy yield, analyzing environmental sunlight patterns, and assisting in solar panel placement optimization.

## What's Included

- `final_sun_inten_copy_20260407201555.ino` — ESP32 firmware using the BH1750 and LittleFS
- `datalog.py` — Python serial logger that writes valid lux values to `lux_data.csv`
- `lux_data.csv` — example logged data

## 🛠️ Hardware Components

- **Microcontroller**: ESP32 (Development Board)
- **Light Sensor**: BH1750 Digital Light Sensor
  - I2C Interface
  - Measuring Range: 1 - 65535 lux
  - Resolution: 0.5 lux step
  - Digital output
- **Communication**: USB/Serial (for data transfer to PC)

## Hardware Setup

Connect BH1750 to ESP32 via I2C:

| BH1750 | ESP32 |
|--------|-------|
| VCC    | 3.3V  |
| GND    | GND   |
| SCL    | GPIO22 (SCL) |
| SDA    | GPIO21 (SDA) |

## Python Logger (Lux Reading)

`datalog.py` connects to the ESP32 over serial, filters non-numeric messages, and appends valid lux readings with timestamps to `lux_data.csv`.

Run:
```bash
python datalog.py
```
Edit `COM_PORT` inside `datalog.py` if necessary.
