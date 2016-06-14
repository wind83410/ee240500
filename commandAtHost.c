#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <termios.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <stdbool.h>
#include <limits.h>
#include <sys/select.h>

#define BUFLEN (255)
#define ZDEBUG (1)

void clean_buffer () {
	fflush(stdin);
//	while (getchar() != '\n');
}

int openserial (char *sdevfile) {
	int _serial_d = open(sdevfile, O_RDWR | O_NOCTTY);
	if (_serial_d == -1) perror("Unable to open device\n");
	return _serial_d;
}

int main (int argc, char *argv[]) {
	int serial_d;
	speed_t speed;
	struct termios soptions, soptions_org;

	char command[10];		// commands in a string [Modified]

	unsigned char send_buf[BUFLEN];
	unsigned char recv_buf[BUFLEN];
	int sent_c, recv_c;

	int i = 0;		// index used in loops [Modified]

	//no port specified
	if (argc == 1) {
		printf("Parameter: /dev/ttyUSB0 [command]\n");
		printf("\"/dev/ttyUSB0\" is a USB serial device to support serial control.\n");
		return 1;
	}

	serial_d = openserial(argv[1]);
	if (serial_d == -1) return 1;

	// ----- Begin of setup serial ports
	tcgetattr(serial_d, &soptions_org);
	tcgetattr(serial_d, &soptions);

	speed = B9600; // Speed options: B19200, B38400, B57600, B115200
	cfsetispeed(&soptions, speed);
	cfsetospeed(&soptions, speed);

	// Enable the reciver and set local mode...
	soptions.c_cflag |= ( CLOCAL | CREAD );
	// Setting Parity Checking (8N1)
	soptions.c_cflag &= ~PARENB;
	soptions.c_cflag &= ~CSTOPB;
	soptions.c_cflag &= ~CSIZE;
	soptions.c_cflag |= CS8;

	// Local setting
	//soptions.c_lflag = (ICANON | ECHO | ECHOE); //canonical
	soptions.c_lflag =  ~(ICANON | ECHO | ECHOE | ISIG); //noncanonical

	// Input setting
	//soptions.c_iflag |= (IXON | IXOFF | IXANY); //software flow control
	soptions.c_iflag |= (INPCK | ISTRIP);
	soptions.c_iflag = IGNPAR;

	// Output setting
	soptions.c_oflag = 0;
	soptions.c_oflag &= ~OPOST;

	// Read options
	soptions.c_cc[VTIME] = 0;
	soptions.c_cc[VMIN] = 1; //transfer at least 1 character or block

	// Apply setting
	tcsetattr(serial_d, TCSANOW, &soptions);
	// ----- End of setup serial ports

	while (1) {
		printf("Enter command ('q' to exit): ");
		gets(command);
		clean_buffer();
		if (command[0] == 'q' && command[1] == '\0') {
			printf ("Bye!\n");
			break;
		}
		
		printf("%s\n", command);

		printf("Sending command '%s'...\n", command);
		for (i = 0; i<5 ; i++) {
			printf("command: %c\n", command[i]);
			sent_c = write(serial_d, &(command[i]), 1); // Send command
			tcdrain(serial_d);
			usleep(1000000); // Wait for response
			printf("%d\n", i);
		}
		printf("out of the loop");
		memset(recv_buf, '\0', BUFLEN);
		recv_c = read(serial_d, recv_buf, BUFLEN); // Get response message
		tcdrain(serial_d);
		printf("%s\n\n", recv_buf);
//		i = 0;
	}
	// restore setting and close
	tcsetattr(serial_d, TCSANOW, &soptions_org);
	close(serial_d);
	return 0;
}
