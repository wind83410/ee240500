/*
  Blank Simple Project.c
  http://learn.parallax.com/propeller-c-tutorials 
*/
#include "simpletools.h"                      // Include simple tools
#include "fdserial.h"

#define PIN_XBEE_RX 0
#define PIN_XBEE_TX 1
#define COMMAND_LEN 4
#define WAIT_TIME   1000

void xbee_manual();

volatile fdserial *xbee;

int main() {
  xbee_manual();
}

void xbee_manual()                                    // Main function
{
  int com[COMMAND_LEN] = {};
  int i = 0, ex = 0;
  
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
        /*call the function that makes the car move forward*/
        print("command: forward\n");
        break;
      case 'B':
        /*call the function that makes the car move backward*/
        print("command: backward\n");
        break;
      case 'R':
        /*call the function that makes the car turn right by 90 degrees*/
        print("command: turn right\n");
        break;
      case 'L':
        /*call the function that makes the car turn left by 90 degrees*/
        print("command: turn left\n");
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
  return 0;
}
