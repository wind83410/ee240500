/*
  Blank Simple Project.c
  http://learn.parallax.com/propeller-c-tutorials 
*/
#include "simpletools.h"                      // Include simple tools
#include "servo.h"
#include "ping.h"

#define RotateStep 190    // for 18 degrees
#define StartAngle 100    // for 0 degree
#define SensorServoPin 16
#define SensorPin 17
#define DataPoints 3
#define StopDistance 8

void sensor_control();                        // the prototype of the function "sensor_control"
void counter();

// outputs
int stop = 0; // for test
int ChangeDir = 0;

int en = 0;
int counts = 0;
int angle[DataPoints] = {};
int data[DataPoints] = {};                             // the received data about distance

void sensor_control() {

  int j=0, toggle=0;
  int sensed = 0, state = 0;

  // angle assignment
  for (int i=0 ; i<DataPoints ; i++) {
    angle[i] = RotateStep * (i+4) + StartAngle;
    data[i] = 80;
  }
  servo_angle(SensorServoPin, angle[0]);  
  pause(1000);
  
  while (1){
    if (j == 0) toggle = 0; // add
    if (j == DataPoints - 1) toggle = 1; // substract
    
    servo_angle(SensorServoPin, angle[j]);
    pause(200);
    data[j] = ping_cm(SensorPin);
    for (int i=0 ; i<DataPoints ; i++)
      if (data[i] < StopDistance)
        sensed++;    
    
    if (sensed >= 2) {
      stop = 1;
      en = 1;
      if (!state)
        cog_run(counter, 128);
      state = 1;
    } else {
      counts = 0;
      state = 0;
      en = 0;
      ChangeDir = 0;
      stop = 0;
    }
    
    if (counts > 50)
      ChangeDir = 1;
    
    sensed = 0;
    
    if (!toggle)
      j++;
    else
      j--;
  }    
}

void counter() {
  while (en) {
    counts++;
    pause(50);
  }
}