/*
  Blank Simple Project.c
  http://learn.parallax.com/propeller-c-tutorials 
*/
#include "simpletools.h"                      // Include simple tools
#include "fdserial.h"
#include "servo.h"
#include "ping.h"

// parameters
#define PIN_XBEE_RX 0
#define PIN_XBEE_TX 1
#define COMMAND_LEN 4
#define WAIT_TIME   1000

#define RotateStep 190    // for 18 degrees
#define StartAngle 100    // for 0 degree
#define SensorServoPin 16
#define SensorPin 17
#define DataPoints 3
#define StopDistance 8

#define runtime 50			// 0.05s
#define ta 20
#define tb 15
#define CollectionTime 5000	// 5s (at 3s, start countdown)
#define CountdownTime 400	// 5,4...1 -> 0.4s * 5 = 2s	
#define CountdownNumber 5
#define RightWheel 18		// pin -> 14
#define LeftWheel 19 	// pin -> 15
#define FullSpeed 50		// full speed
#define SlowSpeed 50		// slow speed

void xbee_manual();
void DirectionControl();
void sensor_control();
void counter();

volatile fdserial *xbee;

int stop = 0;		// 1 -> stop, 0 -> run
int ChangePath = 0;

int en = 0;
int counts = 0;
int angle[DataPoints] = {};
int data[DataPoints] = {}; // the received data about distance

int main() {
  cog_run(sensor_control, 128);
  xbee_manual();
}

void xbee_manual()                                    // Main function
{
  int com[COMMAND_LEN] = {};
  int i = 0, ex = 0;
  int Fx = 0, Rx = 0, Lx = 0;
  
  xbee = fdserial_open(PIN_XBEE_RX, PIN_XBEE_TX, 0, 9600);    // open XBee and get its ID
  fdserial_rxFlush(xbee);
  putchar(CLS);
  
  while (i<3) {
    com[i] = fdserial_rxChar(xbee);
    i++;
  }
  i--;
  
  while(1)
  {
    switch ((char)com[ex]) {
      case 'F':
        print("command: forward\n");
        if (Fx == 0)
          DirectionControl(1, 0, 0, 0);
        if (ChangePath)
          Fx = 1;
        else
          Fx = 0; 
        break;
      case 'B':
        DirectionControl(0, 1, 0, 0);
        print("command: backward\n");
        break;
      case 'R':
        print("command: turn right\n");
        if (Rx == 0)
          DirectionControl(0, 0, 0, 1);
        else
          print("Something stays in the way. Please change the path.");
        if (ChangePath)
          Rx = 1;
        else
          Rx = 0;
        break;
      case 'L':
        print("command: turn left\n");
        if (Lx == 0)
          DirectionControl(0, 0, 1, 0);
        else
          print("Something stays in the way. Please change the path.");
        if (ChangePath)
          Lx = 1;
        else
          Lx = 0;
        break;
    }
    ex++;
    ex %= COMMAND_LEN;
    if (ex == i) {
      pause(WAIT_TIME);
      break;
   }    
    
    if ((char)com[i] != 'a') {
      i++;
      i %= COMMAND_LEN;
      com[i] = fdserial_rxChar(xbee);
    } else {
      pause(WAIT_TIME);
    }    
  }
  servo_stop();
  return 0;
}

void DirectionControl(int go_ahead, int reverse, int turn_left, int turn_right)
{
	if (reverse) {
		servo_speed(LeftWheel, -FullSpeed); // operation
		servo_speed(RightWheel, 0);
		for (int i = 0; i < ta;i++)
			pause(runtime*1.6);
		servo_speed(LeftWheel, 0); // operation
		servo_speed(RightWheel, -FullSpeed);
		for (int i = 0; i < ta;i++)
			pause(runtime*1.6);
		servo_speed(LeftWheel, -FullSpeed);
		servo_speed(RightWheel, +FullSpeed); // operation
		for (int i = 0; i < ta;i++)
			pause(runtime);		
	}
	else if (turn_left) {
		servo_speed(LeftWheel, 0);
		servo_speed(RightWheel, -FullSpeed); // operation
		for (int i = 0; i < ta;) {
			if (!stop) { // There is not obstacle.
				i++;
				pause(runtime*1.6);
			}
			if (ChangePath) {
				servo_speed(LeftWheel, 0);
				servo_speed(RightWheel, FullSpeed); // operation
				for (int j = i; j > -1 ; j--)
					pause(runtime*1.6);
				break;
			}
		}
     servo_speed(LeftWheel, 0);
     servo_speed(RightWheel, 0);
	}
	else if (turn_right) {
		servo_speed(LeftWheel, FullSpeed);
		servo_speed(RightWheel, 0); // operation
		for (int i = 0; i < ta;) {
			if (!stop) { // There is not obstacle.
				i++;
				pause(runtime*1.6);
			}
			if (ChangePath) {
				servo_speed(LeftWheel, -FullSpeed);
				servo_speed(RightWheel, 0); // operation
				for (int j = i; j > -1 ; j--)
					pause(runtime*1.6);
				break;
			}
		}
     servo_speed(LeftWheel, 0);
     servo_speed(RightWheel, 0);
	}
	else {// go ahead
		servo_speed(LeftWheel, FullSpeed); // operation
		servo_speed(RightWheel, -FullSpeed);
		for (int i = 0; i < ta;) {
			if (!stop) { // There is not obstacle.
				i++;
				pause(runtime);
			}
			if (ChangePath) {
				servo_speed(LeftWheel, -FullSpeed);
				servo_speed(RightWheel, +FullSpeed); // operation
				for (int j = i; j > -1 ; j--)
					pause(runtime);
				break;
			}
		}
     servo_speed(LeftWheel, 0);
     servo_speed(RightWheel, 0);
	}
}

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
      ChangePath = 0;
      stop = 0;
    }
    
    if (counts > 50)
      ChangePath = 1;
    
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
