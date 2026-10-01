// All wiring/code below accounts for the ESP32's key differences from Arduino:
// 3.3V logic (not 5V tolerant), ADC1 vs ADC2, and its ledc-based PWM.
const LESSONS = [
  {
    id: 'blink', icon: '💡', title: 'Blink an LED', sim: 'blink', difficulty: 1,
    summary: 'Same idea as Arduino’s Blink, on GPIO2 — the same pin wired to the onboard LED on most DevKit V1 boards.',
    parts: ['1× LED'],
    wiring: [['GPIO2', 'LED anode'], ['LED cathode', 'GND']],
    code: `const int ledPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
}`,
    note: 'Board select: Tools → Board → ESP32 Arduino → "DOIT ESP32 DEVKIT V1" (or your exact board). Install the "esp32" board package first via Boards Manager.'
  },
  {
    id: 'button', icon: '🔘', title: 'Button-Controlled LED', sim: 'button', difficulty: 1,
    summary: 'Digital input with an internal pull-up, exactly like the Arduino version — GPIO4 is a safe, boot-neutral choice.',
    parts: ['1× pushbutton', '1× LED'],
    wiring: [['GPIO4', 'One leg of the button'], ['Other leg of button', 'GND'], ['GPIO2', 'LED anode → LED cathode → GND']],
    code: `const int buttonPin = 4;
const int ledPin = 2;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  bool pressed = (digitalRead(buttonPin) == LOW);
  digitalWrite(ledPin, pressed ? HIGH : LOW);
}`,
    note: 'Avoid GPIO0, 2, 12, 15 for buttons that might be held during power-up — they’re strapping pins that influence how the chip boots.'
  },
  {
    id: 'pot', icon: '🎚️', title: 'Potentiometer → LED Brightness', sim: 'pot', difficulty: 1,
    summary: 'ESP32’s ADC is 12-bit (0–4095, not 0–1023), and PWM brightness control uses the same analogWrite() call as Arduino on recent ESP32 cores.',
    parts: ['1× 10kΩ potentiometer', '1× LED'],
    wiring: [['3V3', 'Potentiometer outer pin #1'], ['GND', 'Potentiometer outer pin #2'], ['GPIO34', 'Potentiometer wiper (ADC1, input-only pin — perfect for this)'], ['GPIO2', 'LED anode → LED cathode → GND']],
    code: `const int potPin = 34;  // ADC1 channel, input-only
const int ledPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int reading = analogRead(potPin);        // 0–4095 on ESP32
  int brightness = reading / 16;           // scale to 0–255
  analogWrite(ledPin, brightness);
}`,
    note: 'On older ESP32 Arduino cores (before ~2.0.1) analogWrite() isn’t available — use ledcAttach(ledPin, 5000, 8) then ledcWrite(ledPin, brightness) instead.'
  },
  {
    id: 'dht11', icon: '🌡️', title: 'Temperature & Humidity (DHT11)', sim: null, difficulty: 2,
    summary: 'Identical protocol to the Arduino version — the only change is powering it from 3.3V instead of 5V.',
    parts: ['1× DHT11 sensor module'],
    wiring: [['3V3', 'VCC'], ['GND', 'GND'], ['GPIO4', 'DATA']],
    code: `#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  Serial.printf("Humidity: %.1f%%  Temp: %.1fC\\n", h, t);
  delay(2000);
}`,
    note: 'ESP32 boards default to 115200 baud in the Serial Monitor, not 9600 — match it or you’ll see garbage.'
  },
  {
    id: 'pir', icon: '🚶', title: 'Motion Sensor (PIR)', sim: null, difficulty: 1,
    summary: 'Simple digital HIGH/LOW input, same pattern as Arduino.',
    parts: ['1× PIR motion sensor'],
    wiring: [['3V3 or 5V (check your module)', 'VCC'], ['GND', 'GND'], ['GPIO27', 'OUT']],
    code: `const int pirPin = 27;

void setup() {
  pinMode(pirPin, INPUT);
  Serial.begin(115200);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    Serial.println("Motion detected!");
  }
  delay(200);
}`,
    note: 'Many PIR modules tolerate 5V VCC even with a 3.3V logic OUT pin — check your specific module’s datasheet before assuming.'
  },
  {
    id: 'buzzer', icon: '🔊', title: 'Buzzer & tone()', sim: null, difficulty: 1,
    summary: 'tone()/noTone() work on ESP32 Arduino core 2.0.1 and later, exactly like on Arduino.',
    parts: ['1× passive piezo buzzer'],
    wiring: [['GPIO25', 'Buzzer +'], ['GND', 'Buzzer −']],
    code: `const int buzzerPin = 25;

void setup() {}

void loop() {
  tone(buzzerPin, 440);
  delay(500);
  noTone(buzzerPin);
  delay(500);
}`,
    note: 'If your installed core predates 2.0.1, tone() won’t exist — update the ESP32 board package via Boards Manager.'
  },
  {
    id: 'wifiserver', icon: '📡', title: 'Wi-Fi Web Server: Control an LED from Your Phone', sim: null, difficulty: 3,
    summary: 'The signature ESP32 project: the board hosts its own web page. Open its IP address from any phone or laptop on the same Wi-Fi network and click a button to toggle a real LED — no app required.',
    parts: ['1× LED', 'a 2.4GHz Wi-Fi network'],
    wiring: [['GPIO2', 'LED anode → LED cathode → GND']],
    code: `#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const int ledPin = 2;
WebServer server(80);
bool ledOn = false;

void handleRoot() {
  String html = "<html><body style='font-family:sans-serif;text-align:center;padding-top:60px'>";
  html += "<h1>ESP32 LED Control</h1>";
  html += "<p>LED is currently <b>" + String(ledOn ? "ON" : "OFF") + "</b></p>";
  html += "<a href='/toggle'><button style='font-size:24px;padding:14px 28px'>Toggle</button></a>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleToggle() {
  ledOn = !ledOn;
  digitalWrite(ledPin, ledOn);
  handleRoot();
}

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print("."); }
  Serial.println();
  Serial.print("Open this in your browser: http://");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/toggle", handleToggle);
  server.begin();
}

void loop() {
  server.handleClient();
}`,
    note: 'After uploading, open the Serial Monitor at 115200 baud to see the IP address it prints — that’s the URL you open on your phone. Your phone and the ESP32 must be on the same Wi-Fi network (most ESP32 boards only support 2.4GHz, not 5GHz).'
  },
];
