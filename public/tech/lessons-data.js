// All wiring and code below matches standard, verified Arduino reference circuits.
const LESSONS = [
  {
    id: 'blink', icon: '💡', title: 'Blink an LED', sim: 'blink', difficulty: 1,
    summary: 'The "hello world" of hardware: turn a digital pin on and off. LEDs are polarized (they only work one way around).',
    parts: ['1× LED (any color)', '2× jumper wires'],
    wiring: [
      ['Pin 13', 'LED anode (long leg, +)'],
      ['LED cathode (short leg, −)', 'GND'],
    ],
    code: `const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
}`,
    note: 'Pin 13 is wired straight to the onboard "L" LED too, so you’ll see it confirm your upload even before touching the breadboard.'
  },
  {
    id: 'button', icon: '🔘', title: 'Button-Controlled LED', sim: 'button', difficulty: 1,
    summary: 'Read a digital input. Using INPUT_PULLUP means the pin reads HIGH by default and LOW when the button is pressed — no external resistor needed for the button.',
    parts: ['1× pushbutton', '1× LED', 'jumper wires'],
    wiring: [
      ['Pin 2', 'One leg of the button'],
      ['Other leg of the button', 'GND'],
      ['Pin 8', 'LED anode'],
      ['LED cathode', 'GND'],
    ],
    code: `const int buttonPin = 2;
const int ledPin = 8;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  bool pressed = (digitalRead(buttonPin) == LOW);
  digitalWrite(ledPin, pressed ? HIGH : LOW);
}`,
    note: 'With INPUT_PULLUP, a pressed button reads LOW — that trips people up constantly. The code above already accounts for it.'
  },
  {
    id: 'pot', icon: '🎚️', title: 'Potentiometer → LED Brightness', sim: 'pot', difficulty: 1,
    summary: 'Read a variable voltage with analogRead() (0–1023), then drive an LED’s brightness with analogWrite() PWM (0–255) on a ~PWM pin.',
    parts: ['1× 10kΩ potentiometer', '1× LED'],
    wiring: [
      ['5V', 'Potentiometer outer pin #1'],
      ['GND', 'Potentiometer outer pin #2'],
      ['A0', 'Potentiometer middle pin (wiper)'],
      ['Pin ~9', 'LED anode → LED cathode → GND'],
    ],
    code: `const int potPin = A0;
const int ledPin = 9; // must be a ~PWM pin

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int reading = analogRead(potPin);      // 0–1023
  int brightness = reading / 4;          // scale to 0–255
  analogWrite(ledPin, brightness);
}`,
    note: 'PWM only works on pins marked with a ~ (3, 5, 6, 9, 10, 11 on the Uno).'
  },
  {
    id: 'ldr', icon: '🔆', title: 'Light Sensor (LDR)', sim: null, difficulty: 1,
    summary: 'A photoresistor’s resistance drops in bright light. Pairing it with a fixed resistor makes a voltage divider that analogRead() can measure.',
    parts: ['1× LDR (photoresistor)', '1× 10kΩ resistor'],
    wiring: [
      ['5V', 'LDR leg 1'],
      ['LDR leg 2', 'A0, and 10kΩ resistor to GND'],
    ],
    code: `const int ldrPin = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int light = analogRead(ldrPin);
  Serial.println(light); // higher = brighter
  delay(200);
}`,
    note: 'Open the Serial Monitor (Ctrl+Shift+M) at 9600 baud and cover the LDR with your hand to watch the number drop.'
  },
  {
    id: 'ultrasonic', icon: '📏', title: 'Ultrasonic Distance (HC-SR04)', sim: null, difficulty: 2,
    summary: 'Send a 10µs pulse on Trig, then time how long Echo stays HIGH — that’s the round-trip time of a sound pulse, which converts directly to distance.',
    parts: ['1× HC-SR04 ultrasonic sensor'],
    wiring: [
      ['5V', 'VCC'],
      ['GND', 'GND'],
      ['Pin 9', 'Trig'],
      ['Pin 10', 'Echo'],
    ],
    code: `const int trigPin = 9;
const int echoPin = 10;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.0343 / 2;
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(300);
}`,
    note: 'The math: sound travels ~0.0343 cm/µs. Divide by 2 because the pulse travels to the object and back.'
  },
  {
    id: 'servo', icon: '⚙️', title: 'Servo Motor Sweep', sim: null, difficulty: 2,
    summary: 'Servos take a PWM-like control signal and move to an angle (0–180°) instead of spinning continuously. The Servo library handles the timing for you.',
    parts: ['1× SG90 (or similar) micro servo'],
    wiring: [
      ['Pin 9', 'Servo signal wire (usually orange/yellow)'],
      ['5V', 'Servo power wire (usually red)'],
      ['GND', 'Servo ground wire (usually brown/black)'],
    ],
    code: `#include <Servo.h>
Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  myServo.write(0);
  delay(1000);
  myServo.write(90);
  delay(1000);
  myServo.write(180);
  delay(1000);
}`,
    note: 'Powering more than one servo, or a larger one, from the Uno’s 5V pin can brown out the board — use an external 5V supply with a shared ground for anything beyond a single micro servo.'
  },
  {
    id: 'dht11', icon: '🌡️', title: 'Temperature & Humidity (DHT11)', sim: null, difficulty: 2,
    summary: 'A single data wire carries both temperature and humidity using a timed digital protocol — the DHT library decodes it for you.',
    parts: ['1× DHT11 sensor (module with 3 pins already has the pull-up resistor built in)'],
    wiring: [
      ['5V', 'VCC'],
      ['GND', 'GND'],
      ['Pin 2', 'DATA'],
    ],
    code: `// Library Manager → install "DHT sensor library" (Adafruit)
// and its dependency "Adafruit Unified Sensor"
#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  Serial.print("Humidity: "); Serial.print(h);
  Serial.print("%  Temp: "); Serial.print(t); Serial.println("C");
  delay(2000);
}`,
    note: 'If you’re using a bare 3-pin sensor (not a breakout module), add a 10kΩ pull-up resistor between DATA and 5V.'
  },
  {
    id: 'pir', icon: '🚶', title: 'Motion Sensor (PIR)', sim: null, difficulty: 1,
    summary: 'A PIR sensor outputs a simple HIGH/LOW digital signal when it detects the infrared signature of movement.',
    parts: ['1× PIR motion sensor (HC-SR501 or similar)'],
    wiring: [
      ['5V', 'VCC'],
      ['GND', 'GND'],
      ['Pin 7', 'OUT'],
    ],
    code: `const int pirPin = 7;

void setup() {
  pinMode(pirPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    Serial.println("Motion detected!");
  }
  delay(200);
}`,
    note: 'Most PIR modules have a warm-up period of 30–60 seconds after power-on — ignore false triggers during that window.'
  },
  {
    id: 'buzzer', icon: '🔊', title: 'Buzzer & tone()', sim: null, difficulty: 1,
    summary: 'A passive buzzer needs a square-wave signal to make sound — that’s exactly what tone() generates, at whatever frequency (pitch) you choose.',
    parts: ['1× passive piezo buzzer'],
    wiring: [
      ['Pin 8', 'Buzzer + (red wire)'],
      ['GND', 'Buzzer − (black wire)'],
    ],
    code: `const int buzzerPin = 8;

void setup() {}

void loop() {
  tone(buzzerPin, 440); // A4 note
  delay(500);
  noTone(buzzerPin);
  delay(500);
}`,
    note: 'An active buzzer (has its own built-in oscillator) only needs digitalWrite(HIGH/LOW), not tone() — check your buzzer’s datasheet if tone() sounds wrong.'
  },
  {
    id: 'touch', icon: '👆', title: 'Touch Sensor (TTP223)', sim: null, difficulty: 1,
    summary: 'A capacitive touch module senses the tiny electrical change your finger makes — no mechanical switch involved, so it never wears out.',
    parts: ['1× TTP223 touch sensor module'],
    wiring: [
      ['5V', 'VCC'],
      ['GND', 'GND'],
      ['Pin 4', 'SIG (or OUT)'],
    ],
    code: `const int touchPin = 4;
const int ledPin = 13;

void setup() {
  pinMode(touchPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  bool touched = digitalRead(touchPin);
  digitalWrite(ledPin, touched ? HIGH : LOW);
}`,
    note: 'Most TTP223 modules read HIGH while being touched and LOW when released — the module handles debouncing internally, so no extra code is needed.'
  },
  {
    id: 'rgbled', icon: '🌈', title: 'RGB LED Color Mixing', sim: null, difficulty: 1,
    summary: 'An RGB LED is really three LEDs (red, green, blue) in one case. Mix their PWM brightness levels and you can make almost any color.',
    parts: ['1× RGB LED (common cathode)'],
    wiring: [
      ['Pin ~9', 'Red leg'],
      ['Pin ~10', 'Green leg'],
      ['Pin ~11', 'Blue leg'],
      ['GND', 'Longest leg (common cathode)'],
    ],
    code: `const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  analogWrite(redPin, 255); analogWrite(greenPin, 0); analogWrite(bluePin, 0);
  delay(500);
  analogWrite(redPin, 0); analogWrite(greenPin, 255); analogWrite(bluePin, 0);
  delay(500);
  analogWrite(redPin, 0); analogWrite(greenPin, 0); analogWrite(bluePin, 255);
  delay(500);
  analogWrite(redPin, 255); analogWrite(greenPin, 255); analogWrite(bluePin, 0); // yellow
  delay(500);
}`,
    note: 'Got a common ANODE RGB LED instead? Wire the long leg to 5V instead of GND, and flip the logic — 0 is now full brightness and 255 is off.'
  },
  {
    id: 'sevenseg', icon: '🔢', title: '7-Segment Display', sim: null, difficulty: 2,
    summary: 'A 7-segment display is just 7 LEDs shaped like a figure-eight. Light the right combination and you can show any digit, 0–9.',
    parts: ['1× 7-segment display (common cathode)'],
    wiring: [
      ['Pins 2–8', 'Segments a, b, c, d, e, f, g'],
      ['GND', 'Common cathode pin'],
    ],
    code: `const int segPins[7] = {2, 3, 4, 5, 6, 7, 8}; // a, b, c, d, e, f, g

// Which segments light up for each digit (1 = on)
const byte digits[10][7] = {
  {1,1,1,1,1,1,0}, // 0
  {0,1,1,0,0,0,0}, // 1
  {1,1,0,1,1,0,1}, // 2
  {1,1,1,1,0,0,1}, // 3
  {0,1,1,0,0,1,1}, // 4
  {1,0,1,1,0,1,1}, // 5
  {1,0,1,1,1,1,1}, // 6
  {1,1,1,0,0,0,0}, // 7
  {1,1,1,1,1,1,1}, // 8
  {1,1,1,1,0,1,1}, // 9
};

void showDigit(int d) {
  for (int i = 0; i < 7; i++) digitalWrite(segPins[i], digits[d][i]);
}

void setup() {
  for (int i = 0; i < 7; i++) pinMode(segPins[i], OUTPUT);
}

void loop() {
  for (int d = 0; d <= 9; d++) {
    showDigit(d);
    delay(600);
  }
}`,
    note: 'Got a common ANODE display instead? Flip every 1 and 0 in the digits table — segments light up when pulled LOW instead of HIGH.'
  },
  {
    id: 'joystick', icon: '🕹️', title: 'Analog Joystick', sim: null, difficulty: 2,
    summary: 'A joystick module is really two potentiometers (one per axis) plus a click button — perfect for controlling a game or a robot.',
    parts: ['1× analog joystick module (KY-023 or similar)'],
    wiring: [
      ['5V', 'VCC'],
      ['GND', 'GND'],
      ['A0', 'VRx'],
      ['A1', 'VRy'],
      ['Pin 2', 'SW'],
    ],
    code: `const int xPin = A0;
const int yPin = A1;
const int swPin = 2;

void setup() {
  pinMode(swPin, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(xPin);   // 0–1023, centered around ~512
  int y = analogRead(yPin);
  bool pressed = (digitalRead(swPin) == LOW);
  Serial.print("X: "); Serial.print(x);
  Serial.print("  Y: "); Serial.print(y);
  Serial.print("  Button: "); Serial.println(pressed ? "pressed" : "released");
  delay(200);
}`,
    note: 'The resting center isn’t always exactly 512 on every joystick — read its idle values first and use those as your own "zero" before deciding left/right/up/down.'
  },
  {
    id: 'relay', icon: '🔌', title: 'Relay Module', sim: null, difficulty: 2,
    summary: 'A relay lets a tiny 5V signal switch a completely separate circuit on and off — like a digital pin flipping a light switch with its mind.',
    parts: ['1× 5V relay module', '1× low-voltage DC device to switch (e.g. a battery-powered fan)'],
    wiring: [
      ['5V', 'VCC'],
      ['GND', 'GND'],
      ['Pin 7', 'IN'],
    ],
    code: `const int relayPin = 7;

void setup() {
  pinMode(relayPin, OUTPUT);
}

void loop() {
  digitalWrite(relayPin, HIGH); // energizes the relay on most modules
  delay(2000);
  digitalWrite(relayPin, LOW);
  delay(2000);
}`,
    note: '⚠ Never wire a relay to mains/wall AC power. Only switch low-voltage DC loads (like a battery-powered fan or a small 6V bulb) for safe learning. Many modules are "active LOW" — check yours, since HIGH and LOW may be swapped.'
  },
  {
    id: 'irremote', icon: '📡', title: 'IR Remote Receiver', sim: null, difficulty: 3,
    summary: 'A cheap infrared receiver can "hear" the invisible light pulses from almost any remote control — press a button and see its code appear.',
    parts: ['1× IR receiver module (TSOP38238 or similar)', '1× small IR remote control'],
    wiring: [
      ['5V', 'VCC'],
      ['GND', 'GND'],
      ['Pin 11', 'OUT'],
    ],
    code: `// Library Manager → install "IRremote"
#include <IRremote.hpp>

const int irPin = 11;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(irPin);
}

void loop() {
  if (IrReceiver.decode()) {
    Serial.print("Button code: ");
    Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
    IrReceiver.resume();
  }
}`,
    note: 'Different remotes send different codes for the same button — press each button once, note the code the Serial Monitor prints, then use those codes to react to specific buttons in your own projects.'
  },
];
