// Verified against the official Arduino Uno R3 reference design (arduino.cc).
const ARDUINO_UNO_PINS = {
  digital: [
    { id: 'D0', label: '0 (RX)', name: 'Digital Pin 0 — RX', desc: 'UART receive line, shared with the USB-to-serial chip. Avoid using this pin for anything else while uploading code or using Serial.', tags: ['UART', 'Shared with USB'] },
    { id: 'D1', label: '1 (TX)', name: 'Digital Pin 1 — TX', desc: 'UART transmit line, shared with USB serial. Same caveat as D0.', tags: ['UART', 'Shared with USB'] },
    { id: 'D2', label: '2', name: 'Digital Pin 2', desc: 'General digital I/O. Also doubles as external interrupt 0 (INT0) for instantly reacting to a pin change.', tags: ['Digital I/O', 'Interrupt'] },
    { id: 'D3', label: '~3', name: 'Digital Pin 3 (PWM)', desc: 'Digital I/O with PWM (analogWrite) support — great for dimming LEDs or controlling motor speed. Also external interrupt 1.', tags: ['Digital I/O', 'PWM', 'Interrupt'] },
    { id: 'D4', label: '4', name: 'Digital Pin 4', desc: 'General digital I/O, no PWM.', tags: ['Digital I/O'] },
    { id: 'D5', label: '~5', name: 'Digital Pin 5 (PWM)', desc: 'Digital I/O with PWM support.', tags: ['Digital I/O', 'PWM'] },
    { id: 'D6', label: '~6', name: 'Digital Pin 6 (PWM)', desc: 'Digital I/O with PWM support.', tags: ['Digital I/O', 'PWM'] },
    { id: 'D7', label: '7', name: 'Digital Pin 7', desc: 'General digital I/O, no PWM.', tags: ['Digital I/O'] },
    { id: 'D8', label: '8', name: 'Digital Pin 8', desc: 'General digital I/O, no PWM.', tags: ['Digital I/O'] },
    { id: 'D9', label: '~9', name: 'Digital Pin 9 (PWM)', desc: 'Digital I/O with PWM support. Commonly used for servo signal wires.', tags: ['Digital I/O', 'PWM'] },
    { id: 'D10', label: '~10', name: 'Digital Pin 10 (PWM)', desc: 'PWM-capable. Also the SPI Slave Select (SS) line.', tags: ['Digital I/O', 'PWM', 'SPI SS'] },
    { id: 'D11', label: '~11', name: 'Digital Pin 11 (PWM)', desc: 'PWM-capable. Also SPI MOSI (data out).', tags: ['Digital I/O', 'PWM', 'SPI MOSI'] },
    { id: 'D12', label: '12', name: 'Digital Pin 12', desc: 'No PWM. Also SPI MISO (data in).', tags: ['Digital I/O', 'SPI MISO'] },
    { id: 'D13', label: '13', name: 'Digital Pin 13', desc: 'No PWM. Wired to the onboard "L" LED, so it blinks visibly even with nothing connected. Also SPI SCK (clock).', tags: ['Digital I/O', 'Onboard LED', 'SPI SCK'] },
  ],
  analog: [
    { id: 'A0', label: 'A0', name: 'Analog Pin A0', desc: 'Reads a voltage between 0–5V and returns a number 0–1023. Used for potentiometers, light sensors, and more.', tags: ['Analog In', '10-bit ADC'] },
    { id: 'A1', label: 'A1', name: 'Analog Pin A1', desc: 'Analog input, same behavior as A0.', tags: ['Analog In'] },
    { id: 'A2', label: 'A2', name: 'Analog Pin A2', desc: 'Analog input, same behavior as A0.', tags: ['Analog In'] },
    { id: 'A3', label: 'A3', name: 'Analog Pin A3', desc: 'Analog input, same behavior as A0.', tags: ['Analog In'] },
    { id: 'A4', label: 'A4', name: 'Analog Pin A4 — SDA', desc: 'Analog input, and also the I2C data line (SDA) for connecting I2C sensors and displays.', tags: ['Analog In', 'I2C SDA'] },
    { id: 'A5', label: 'A5', name: 'Analog Pin A5 — SCL', desc: 'Analog input, and also the I2C clock line (SCL).', tags: ['Analog In', 'I2C SCL'] },
  ],
  power: [
    { id: 'VIN', label: 'VIN', name: 'VIN', desc: 'Input voltage when powering the board from an external supply (7–12V recommended) instead of USB.', tags: ['Power In'] },
    { id: 'GND1', label: 'GND', name: 'Ground', desc: 'Common ground reference. The Uno has several GND pins — any of them work identically.', tags: ['Ground'] },
    { id: 'V5', label: '5V', name: '5V Output', desc: 'Regulated 5V supply for powering sensors and modules.', tags: ['Power Out'] },
    { id: 'V33', label: '3.3V', name: '3.3V Output', desc: 'Regulated 3.3V supply. Max current draw ~50mA — don’t power motors or many LEDs from this pin.', tags: ['Power Out'] },
    { id: 'RESET', label: 'RESET', name: 'Reset', desc: 'Pulling this pin LOW resets the microcontroller, restarting your program from the top.', tags: ['Control'] },
    { id: 'AREF', label: 'AREF', name: 'Analog Reference', desc: 'Lets you set a custom reference voltage for analogRead() instead of the default 5V. Rarely needed for beginners.', tags: ['Reference'] },
  ]
};
