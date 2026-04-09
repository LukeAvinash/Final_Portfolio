/*
  DN1010 Experimental Interaction, Ashley Hi 2026
  Week 11 - Physical Computing
  ESP32-C3 Sensor Servo Example
  When distance is less than 10cm, ultrasonic sensor triggers servo to turn 180º.
  Additional Components: Servo Motor, HC-SR04 Sensor
*/

// ====== Reference Libraries ======
#include <ESP32Servo.h>

// ====== Set Servo ======
#define SERVO_PIN 2

// ====== Set HC-SR04 Sensor ======
#define TRIG_PIN  3
#define ECHO_PIN  4
// *** edit the sensor trigger distance here (in cm)
// *** decreased from 10
#define DISTANCE_THRESHOLD  6

// ====== Create Servo Objects ======
Servo servo;

// ====== Sensor Variables ======
float duration_us, distance_cm;

void setup() {
  // ====== Setup Serial Monitor ======
  Serial.begin(115200);

  // ====== Setup Sensor / Servo ======
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  servo.attach(SERVO_PIN);
  servo.write(0);
}

void loop() {
  // ====== Sensor / Servo Output ======
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  duration_us = pulseIn(ECHO_PIN, HIGH);
  distance_cm = 0.005 * duration_us; //0.017 
  if (distance_cm < DISTANCE_THRESHOLD) {
    servo.write(135); // *** edit the rotation of the servo here (within range: 0 – 180)
  } else {
    servo.write(45); // *** edit the rotation of the servo here (within range: 0 – 180)
  } 
  // ====== Serial Output ======
  Serial.print("Distance: ");
  Serial.print(distance_cm);
  Serial.println(" cm");

  delay(500);
}