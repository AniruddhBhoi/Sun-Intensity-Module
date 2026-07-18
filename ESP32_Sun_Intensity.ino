#include <Wire.h>
#include <BH1750.h>
#include "FS.h"       // <--- Add this to fix the 'File' error
#include "LittleFS.h"

BH1750 lightMeter;
const char* filename = "/light_data.csv";

void setup() {
  Serial.begin(115200);
  Wire.begin();

  // 1. Initialize BH1750
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 Initialized");
  }

  // 2. Initialize LittleFS
  if (!LittleFS.begin(true)) {
    Serial.println("An Error has occurred while mounting LittleFS");
    return;
  }
  
  Serial.println("Internal Storage Ready.");

  // 3. Print stored data to Serial Monitor on startup
  // printStoredData();
}

void loop() {
  float lux = lightMeter.readLightLevel();

  if (lux >= 0) {
    File file = LittleFS.open(filename, FILE_APPEND);
    if (!file) {
      Serial.println("Failed to open file for writing");
    } else {
      file.println(lux); 
      Serial.print(" ");
      Serial.println(lux);
      file.close(); 
    }
  }

  delay(10000); 
}

// Fixed function with proper FS handling
void printStoredData() {
  // Use the variable 'filename' (which is "/light_data.csv")
  File file = LittleFS.open(filename, FILE_READ);
  
  if (!file) {
    Serial.println("No data file found yet.");
    return;
  }

  if (file.isDirectory()) {
    Serial.println("Error: light_data.csv is a directory");
    file.close();
    return;
  }

  Serial.println("--- START OF STORED DATA ---");
  while (file.available()) {
    Serial.write(file.read());
  }
  Serial.println("--- END OF STORED DATA ---");
  file.close();
}