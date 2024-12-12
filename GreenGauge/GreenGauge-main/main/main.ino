// Include libraries
 
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Arduino_JSON.h>
#include "EmonLib.h"  // Include Emon Library
#include <InfluxDbClient.h>
#include <InfluxDbCloud.h>

// Influx Constants

#define INFLUXDB_URL "<URL>
#define INFLUXDB_TOKEN "<TOKEN>"
#define INFLUXDB_ORG "<ORG>"
#define INFLUXDB_BUCKET "<BUCKET>"
#define TZ_INFO "PKT-5"
#define DEVICE "ironbox_final"
 
// Define constants
 
#define SCREEN_WIDTH 128  // OLED display width, in pixels
#define SCREEN_HEIGHT 64  // OLED display height, in pixels
 
// Replace with your own WiFi credentials
 
const char* ssid = "R1";
const char* password = "rpi12345";
 
bool GPIO_State = 0;
const int Led_Pin = 2;
float v1 = 0;
float cur = 0;
float power = 0;
float currentOffset = 1.37;  // Offset to adjust baseline current
String ip = "0.0.0.0";
float ptime = 0;

JSONVar readings;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// OLED Display
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define V1 34
#define I1 35

// Calibration settings
#define CV1 91.65  // Voltage calibration value
#define CI1 18.01  // Updated current calibration value

 
// HTML page stored in program memory
 
 
char html_page[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML>
<html>
<head>
  <title>ESP32 Power Meter</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,">
  <style>
    html {
      font-family: Arial, Helvetica, sans-serif;
      display: inline-block;
      text-align: center;
    }
    h1 {
      font-size: 1.8rem;
      color: white;
    }
    .topnav {
      overflow: hidden;
      background-color: #000;
    }
    body {
      margin: 0;
    }
    .content {
      padding: 50px;
    }
    .card-grid {
      max-width: 800px;
      margin: 0 auto;
      display: grid;
      grid-gap: 2rem;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    .card {
      background-color: white;
      box-shadow: 2px 2px 12px rgba(140,140,140,.5);
      border-radius: 25px;
    }
    .card-title {
      font-size: 1.2rem;
      font-weight: bold;
      color: #034078
    }
    .reading {
      font-size: 1.2rem;
      color: #1282A2;
    }
    #app {
        display: block;
        align-items: center;
        justify-items: center;
    }
    #chart {
        height: 500px; 
        width: 1200px;
    }
    @media only screen and (max-width: 600px) {
        #chart {
            height: 300px; 
            width: 320px;
        }
    }
  </style>

  <!-- Include Vue.js -->
  <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
  <!-- Include Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Include Moment.js and Date Adapter for Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@1.0.0"></script>

</head>
<body>
    <div id="app">
        <div class="topnav">
            <h1>MONITORING POWER CONSUMPTION</h1>
        </div>
        <div class="content">
            <div class="card-grid">
                <div class="card">
                    <p class="card-title">Voltage</p>
                    <p class="reading">{{ voltage }} V</p>
                </div>
                <div class="card">
                    <p class="card-title">Current</p>
                    <p class="reading">{{ current }} A</p>
                </div>
                <div class="card">
                    <p class="card-title">Power</p>
                    <p class="reading">{{ power }} Watt</p>
                </div>
                <div class="card">
                    <p class="card-title">Approx. Cost</p>
                    <p class="reading">&#8377; {{ (power*6.15/1000).toFixed(4) }} /hr</p>
                </div>
            </div>
            <div id="chart" style="margin-left: auto; margin-right: auto; margin-top: 50px; align-items: center; justify-content: center; display: flex;">
                <canvas id="sensorChart" height="inherit" width="inherit"></canvas>
            </div>
        </div>
    </div>

    <script>
      var gateway = `ws://${window.location.hostname}/ws`;
      // var gateway = `ws://192.168.147.199/ws`; // Update this with your actual WebSocket address
      var websocket;

      // Vue.js App
      new Vue({
          el: '#app',
          data: {
              voltage: 0,
              current: 0,
              power: 0,
              chart: null,
              chartData: {
                  labels: [],
                  datasets: [
                      {
                          label: 'Voltage (V)',
                          borderColor: 'rgba(54, 162, 235, 1)',
                          data: []
                      },
                      {
                          label: 'Current (A)',
                          borderColor: 'rgba(255, 99, 132, 1)',
                          data: []
                      },
                      {
                          label: 'Power (W)',
                          borderColor: 'rgba(75, 192, 192, 1)',
                          data: []
                      }
                  ]
              }
          },
          mounted() {
              this.initWebSocket();
              this.initChart();
          },
          methods: {
              initWebSocket() {
                  websocket = new WebSocket(gateway);
                  websocket.onopen = this.onOpen;
                  websocket.onclose = this.onClose;
                  websocket.onmessage = this.onMessage;
              },
              onOpen(event) {
                  console.log('Connection opened');
                  websocket.send("getReadings");
              },
              onClose(event) {
                  console.log('Connection closed');
                  setTimeout(this.initWebSocket, 2000);
              },
              onMessage(event) {
                  console.log(event.data);
                  var data = JSON.parse(event.data);
                  this.voltage = data.voltage;
                  this.current = data.current;
                  this.power = data.power;
                  
                  this.updateChart(data);
              },
              initChart() {
                  var ctx = document.getElementById('sensorChart').getContext('2d');
                  this.chart = new Chart(ctx, {
                      type: 'line',
                      data: this.chartData,
                      options: {
                          scales: {
                              x: {
                                  type: 'time',
                                  time: {
                                      unit: 'second',
                                      tooltipFormat: 'HH:mm:ss',
                                      displayFormats: {
                                          second: 'HH:mm:ss' // Display only the time on x-axis
                                      }
                                  }
                              }
                          }
                      }
                  });
              },
              updateChart(data) {
                  var now = new Date();
                  // Push ISO string (full date + time) to labels for Moment.js
                  this.chartData.labels.push(now.toISOString());

                  // Push sensor data into the respective datasets
                  this.chartData.datasets[0].data.push(data.voltage);
                  this.chartData.datasets[1].data.push(data.current);
                  this.chartData.datasets[2].data.push(data.power);

                  // Remove old data to maintain a maximum of 10 data points
                  if (this.chartData.labels.length > 10) {
                      this.chartData.labels.shift();
                      this.chartData.datasets[0].data.shift();
                      this.chartData.datasets[1].data.shift();
                      this.chartData.datasets[2].data.shift();
                  }

                  // Update the chart only if it exists
                  if (this.chart) {
                      this.chart.update();
                  }
              }
          }
      });
    </script>

</body>
</html>
)rawliteral";
 
 
 
String processor(const String& var){
  Serial.println(var);
  return "boom" ;
}
// Function to get sensor readings
 
String getSensorReadings(){  // NO1 
  readings["voltage"] = String(v1);
  readings["current"] =  String(cur);
  readings["power"] = String(power);
  String jsonString = JSON.stringify(readings);
  return jsonString;
}

// Function to notify clients
 
void notifyClients() {
  ws.textAll(getSensorReadings());
}
 
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    //data[len] = 0;
    //String message = (char*)data;
    // Check if the message is "getReadings"
    //if (strcmp((char*)data, "getReadings") == 0) {
      //if it is, send current sensor readings
      String sensorReadings = getSensorReadings();
      Serial.println(sensorReadings);
      notifyClients();
    //}
  }
}
 
// WebSocket event handler
 
void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %sn", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnectedn", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}
// Initialize WebSocket
 
void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}
 
EnergyMonitor emon1;  // Phase 1
 
// Display initialization and data functions
 
 
void disinit() {
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;)
      
      ;  // Don't proceed, loop forever
  }
  // Show initial display buffer contents on the screen --
  // the library initializes this with an Adafruit splash screen.
  Serial.println(F("Display initialised"));
  display.clearDisplay();
  display.display();
  delay(200);  // Pause for 2 seconds
 
  // Clear the buffer
  display.clearDisplay();
  display.setTextSize(1);  // Normal 1:1 pixel scale
  display.setTextColor(SSD1306_WHITE);
 
  display.setCursor(0, 20);
 
  display.println(F("Starting..."));
  display.display();
  delay(5000);
 
 
  //printing the ip address to the screen
  Serial.printf("IP Address %sn",ip);
  
  display.setCursor(0, 48);
  display.print(ip);
  display.display();
 
}
 
 
void disdat(float x , float y) {
 
  display.clearDisplay();
  //delay(1);
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.println(F("I-"));
  display.setCursor(24, 0);
  display.println(x);
  display.setCursor(115, 0);
  display.println("A");
 
 
  display.setCursor(0, 16);
  display.println(F("v-"));
  display.setCursor(24, 16);
  display.println(y);
  display.setCursor(115, 16);
  display.println("V");
 
 
  display.setCursor(1, 32);
  display.println(F("P-"));
  display.setCursor(24, 32);
  display.print(y * x);
  display.setCursor(115, 32);
  display.println("W");
 
  display.setTextSize(1);
  display.setCursor(0, 56);
  display.print(ip);
  display.display();
}
 

// InfluxDB client instance with preconfigured InfluxCloud certificate
InfluxDBClient client(INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN, InfluxDbCloud2CACert); 
Point measurementDevice("Measurements");

void updateDB() {
  measurementDevice.clearFields();
  measurementDevice.addField("Voltage", String(readings["voltage"]).toFloat());
  measurementDevice.addField("Current", String(readings["current"]).toFloat());
  measurementDevice.addField("Power", String(readings["power"]).toFloat());

  // Log data for the first sensor
  Serial.print("Writing voltage: ");
  Serial.println(client.pointToLineProtocol(measurementDevice));
  
  if (!client.writePoint(measurementDevice)) {
    Serial.print("InfluxDB write failed: ");
    Serial.println(client.getLastErrorMessage());
  }

}

void setup() {
  
    Serial.begin(115200);
      WiFi.softAP(ssid, password);
 
   disinit();
   disdat(0, 0);
 
   // Connect to Wi-Fi
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
 
  // Print ESP Local IP Address
  ip = WiFi.localIP().toString(); 
  Serial.println(ip);
  initWebSocket();
 
  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", html_page, processor);
  });
 
  // Start server
  server.begin();
 
  
  /*
    Analog attenuation:
 
    ADC_0db: sets no attenuation. ADC can measure up to approximately 800 mV (1V input = ADC reading of 1088).
    ADC_2_5db: The input voltage of ADC will be attenuated, extending the range of measurement to up to approx. 1100 mV. (1V input = ADC reading of 3722).
    ADC_6db: The input voltage of ADC will be attenuated, extending the range of measurement to up to approx. 1350 mV. (1V input = ADC reading of 3033).
    ADC_11db (default): The input voltage of ADC will be attenuated, extending the range of measurement to up to approx. 2600 mV. (1V input = ADC reading of 1575).
 
  */
  analogSetPinAttenuation(V1, ADC_11db);
 
  analogSetPinAttenuation(I1, ADC_11db);
 
  // Phase 1
  emon1.voltage(V1, CV1, 1.732);  // Voltage: input pin, calibration, phase_shift
  emon1.current(I1, CI1);         // Current: input pin, calibration.
  ptime = millis();


  // Add tags to the measurementDevice points
  measurementDevice.addTag("device", DEVICE);
  measurementDevice.addTag("SSID", WiFi.SSID());

  timeSync(TZ_INFO, "pool.ntp.org", "time.nis.gov");

  if (client.validateConnection()) {
    Serial.print("Connected to InfluxDB: ");
    Serial.println(client.getServerUrl());
  } else {
    Serial.print("InfluxDB connection failed: ");
    Serial.println(client.getLastErrorMessage());
  }

}
 
void loop() {
  Serial.println("------------");
  emon1.calcVI(120, 2000);
  float realPower = emon1.realPower;
  float apparentPower = emon1.apparentPower;
  float powerFactor = emon1.powerFactor;
  float supplyVoltage = emon1.Vrms;
  float Irms = emon1.Irms;
  v1 = supplyVoltage;
  cur = Irms - currentOffset;
  if (cur < 0) cur = 0;
  power = cur * supplyVoltage;
  Serial.print("V1: ");
  Serial.print(supplyVoltage);
  Serial.print(", I1: ");
  Serial.println(cur);
  disdat(cur, supplyVoltage);
  getSensorReadings();
  if ((millis() - ptime) > 5000) {
    notifyClients();
    updateDB();
    ptime = millis();
  }
  ws.cleanupClients();
}
