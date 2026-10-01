// Based on the widely-used ESP32 DOIT DevKit V1 (30-pin) board. Exact silkscreen
// layout varies slightly by manufacturer, but chip-level pin behavior below
// (ADC channels, strapping pins, reserved flash pins) is true of every ESP32.
const ESP32_PINS = {
  digital: [
    { id: 'G2', label: '2', name: 'GPIO2', desc: 'Usable I/O. Wired to the onboard LED on most DevKit V1 boards. Also a strapping pin (must be LOW or floating at boot) and ADC2 channel 2.', tags: ['Digital I/O', 'Onboard LED', 'Strapping', 'ADC2'] },
    { id: 'G4', label: '4', name: 'GPIO4', desc: 'Usable I/O, ADC2 channel 0 (unavailable while Wi-Fi is active).', tags: ['Digital I/O', 'ADC2'] },
    { id: 'G5', label: '5', name: 'GPIO5', desc: 'Usable I/O, default VSPI CS. Strapping pin — must be HIGH at boot.', tags: ['Digital I/O', 'SPI CS', 'Strapping'] },
    { id: 'G12', label: '12', name: 'GPIO12', desc: 'ADC2 channel 5. Strapping pin — must be LOW at boot, or the chip can fail to start (it sets flash voltage).', tags: ['Digital I/O', 'ADC2', 'Strapping ⚠'] },
    { id: 'G13', label: '13', name: 'GPIO13', desc: 'Usable I/O, ADC2 channel 4.', tags: ['Digital I/O', 'ADC2'] },
    { id: 'G14', label: '14', name: 'GPIO14', desc: 'Usable I/O, ADC2 channel 6.', tags: ['Digital I/O', 'ADC2'] },
    { id: 'G15', label: '15', name: 'GPIO15', desc: 'ADC2 channel 3. Strapping pin — affects boot log verbosity.', tags: ['Digital I/O', 'ADC2', 'Strapping'] },
    { id: 'G16', label: '16', name: 'GPIO16', desc: 'General-purpose I/O, free of special boot behavior — a safe default choice.', tags: ['Digital I/O'] },
    { id: 'G17', label: '17', name: 'GPIO17', desc: 'General-purpose I/O, free of special boot behavior.', tags: ['Digital I/O'] },
    { id: 'G18', label: '18', name: 'GPIO18', desc: 'Default VSPI clock (SCK).', tags: ['Digital I/O', 'SPI SCK'] },
    { id: 'G19', label: '19', name: 'GPIO19', desc: 'Default VSPI data-in (MISO).', tags: ['Digital I/O', 'SPI MISO'] },
    { id: 'G21', label: '21', name: 'GPIO21', desc: 'Default I2C data line (SDA).', tags: ['Digital I/O', 'I2C SDA'] },
    { id: 'G22', label: '22', name: 'GPIO22', desc: 'Default I2C clock line (SCL).', tags: ['Digital I/O', 'I2C SCL'] },
    { id: 'G23', label: '23', name: 'GPIO23', desc: 'Default VSPI data-out (MOSI).', tags: ['Digital I/O', 'SPI MOSI'] },
    { id: 'G25', label: '25', name: 'GPIO25', desc: 'ADC1 channel + one of two true analog outputs (DAC1) on the ESP32.', tags: ['Digital I/O', 'ADC1', 'DAC'] },
    { id: 'G26', label: '26', name: 'GPIO26', desc: 'ADC1 channel + the second true analog output (DAC2).', tags: ['Digital I/O', 'ADC1', 'DAC'] },
    { id: 'G27', label: '27', name: 'GPIO27', desc: 'ADC1 channel, general-purpose I/O.', tags: ['Digital I/O', 'ADC1'] },
    { id: 'G32', label: '32', name: 'GPIO32', desc: 'ADC1 channel — safe to use even while Wi-Fi is active.', tags: ['Digital I/O', 'ADC1'] },
    { id: 'G33', label: '33', name: 'GPIO33', desc: 'ADC1 channel — safe to use even while Wi-Fi is active.', tags: ['Digital I/O', 'ADC1'] },
    { id: 'G34', label: '34 (VP)', name: 'GPIO34', desc: 'Input-only — cannot drive an output or use an internal pull-up. ADC1 channel.', tags: ['Input only', 'ADC1'] },
    { id: 'G35', label: '35 (VN)', name: 'GPIO35', desc: 'Input-only. ADC1 channel.', tags: ['Input only', 'ADC1'] },
    { id: 'G36', label: '36', name: 'GPIO36 (SVP)', desc: 'Input-only. ADC1 channel.', tags: ['Input only', 'ADC1'] },
    { id: 'G39', label: '39', name: 'GPIO39 (SVN)', desc: 'Input-only. ADC1 channel.', tags: ['Input only', 'ADC1'] },
    { id: 'TX0', label: 'TX0 (1)', name: 'GPIO1 — TX0', desc: 'UART0 transmit, shared with the USB-to-serial chip. Avoid using during upload/Serial.', tags: ['UART', 'Shared with USB'] },
    { id: 'RX0', label: 'RX0 (3)', name: 'GPIO3 — RX0', desc: 'UART0 receive, shared with USB serial.', tags: ['UART', 'Shared with USB'] },
  ],
  reserved: [
    { id: 'G6', label: '6–11', name: 'GPIO6–11', desc: 'Wired internally to the module’s SPI flash chip. Never use these — doing so can crash the board or corrupt flash.', tags: ['⚠ Do not use'] },
  ],
  power: [
    { id: 'EN', label: 'EN', name: 'Enable / Reset', desc: 'Pulling this LOW resets the chip. Equivalent to the Uno’s RESET pin.', tags: ['Control'] },
    { id: 'V33', label: '3V3', name: '3.3V', desc: 'The ESP32’s actual logic and supply voltage. All GPIOs are 3.3V logic and are NOT 5V tolerant — connecting a 5V signal can damage the chip.', tags: ['Power', '⚠ Not 5V tolerant'] },
    { id: 'VIN', label: 'VIN / 5V', name: 'VIN', desc: 'Raw 5V input (from USB or an external supply), feeding the onboard 3.3V regulator.', tags: ['Power In'] },
    { id: 'GND', label: 'GND', name: 'Ground', desc: 'Common ground — the board has several GND pins.', tags: ['Ground'] },
  ]
};
