import serial
import csv
import time

# --- CONFIGURATION ---
COM_PORT = 'COM7'  # Change this to your ESP32's port
BAUD_RATE = 115200
FILE_NAME = "lux_data.csv"

# Initialize serial connection
try:
    ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)  # Wait for ESP32 to reset
    print(f"Connected to {COM_PORT}. Logging to {FILE_NAME}...")

    # Open CSV file in append mode
    with open(FILE_NAME, mode='a', newline='') as file:
        writer = csv.writer(file)
        
        # Write header if file is empty
        if file.tell() == 0:
            writer.writerow(["Timestamp", "Lux Value"])

        while True:
            if ser.in_waiting > 0:
                raw_data = ser.readline()
                try:
                    # 1. Clean the incoming string
                    line = raw_data.decode('utf-8', errors='ignore').strip()
                    
                    if line:
                        # 2. Try to convert the data to a number (Lux)
                        # This will FAIL for "BH1750 Initialized" or boot logs
                        lux_value = float(line) 
                        
                        # 3. If it is a number, save it!
                        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
                        print(f"[{timestamp}] Valid Lux Received: {lux_value}")
                        
                        with open(FILE_NAME, mode='a', newline='') as file:
                            writer = csv.writer(file)
                            writer.writerow([timestamp, lux_value])
                            file.flush()

                except ValueError:
                    # This triggers if the line is text (like "Internal Storage Ready")
                    # We print it to console so you see it, but we DON'T save to CSV
                    print(f"System Message: {line}")
                    continue
                except Exception as e:
                    print(f"Error: {e}")

except KeyboardInterrupt:
    print("\nLogging stopped by user.")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'ser' in locals():
        ser.close()