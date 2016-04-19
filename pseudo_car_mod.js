/* Vector object generator:
 * inputs: two point objects, p1 and p2.
 * output: a vector pointing from p2 to p1
 * functions: normalization, calculation of length
 */

function Vector(p1, p2) {
    this.x = p1.x - p2.x;
    this.y = p1.y - p2.y;
    // function for normalization  
    this.normalize = function(){
        var norm = this;
        return {x: norm.x/norm.length(), y: norm.y/norm.length()};
    };

    // function for calculating the length
    this.length = function(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
}

/* point object generator
 * input: the coordinates of a point
 * output: a point object containing the information of position
 * functions: Moving through a vector, specifying an arbitrary direction
 */
function Point(x, y){
    this.x = x;
    this.y = y;
    // function for moving through a vector 
    this.addVector = function(v){
        this.x += v.x;
        this.y += v.y;
    };
    this.direction = null;
}

// line distance between p1 and p2
function lineDistance( point1, point2 )
{
    var xs = 0;
    var ys = 0;
    
    xs = point2.x - point1.x;
    xs = xs * xs;
    
    ys = point2.y - point1.y;
    ys = ys * ys;
    
    return Math.sqrt( xs + ys );
}

function Vrotate (vector, angle) {

    var r = vector.length();
    var theta = 0;

    if (vector.x != 0) {
            theta = Math.atan( vector.y / vector.x ) * 180 / Math.PI;
            if (theta >= 0) {
                if (vector.x < 0)
                    theta += 180;
            } else {
                if (vector.x > 0)
                   theta += 360;
                else
                   theta = 180 + theta;
            }
    } else {
           if (vector.y > 0)
               theta = 90;
           else if (vector.y < 0)
               theta = 270;
           else
               return -1; // inform the undefined state and shut the function
    }

    return new Vector(new Point(r * Math.cos((theta + angle)*Math.PI/180),
                                r * Math.sin((theta + angle)*Math.PI/180)),
                      new Point(0, 0));
        
}

function equation( point1, point2 ) {

    var tanVector = new Vector(point1, point2);
    var value = 0;

    /* norVector: the normal vector of the equation (line).
     * equalTo: the number "c" in the form of "ax+by=c." 
     *          (I do not know how to call that. :P)
     */
    this.norVector = new Vector(new Point(tanVector.y, -tanVector.x), new Point(0, 0));
    
    if (this.norVector.x != 0 && this.norVector.y != 0)
        this.equalsTo = point1.x * this.norVector.x + point1.y * this.norVector.y;
    else if (this.norVector.x == 0) {
        this.norVector.y = 1;
        this.equalsTo = point1.y;
    } else {
        this.norVector.x = 1;
        this.equalsTo = point1.x;
    }

    // Check whether a point is actually on the line or not
    this.IsPassed = function (pS) {
        if (this.norVector.x != 0 && this.norVector.y != 0)
            return (pS.x * this.norVector.x + pS.y * this.norVector.y) ==
                    this.equalsTo ? true : false;
        else if (this.norVector.x == 0)
            return this.equalsTo == pS.y;
        else
            return this.equalsTo == pS.x;
    }
    
    // Check if two points are at the same side of the line
    this.SameSide = function (p1, p2) {
        var jp1 = 0;
        var jp2 = 0;
        
        if (this.IsPassed(p1) || this.IsPassed(p2)) {
            return 2;	// s=2 means that the judgement fails.
        } else {
            if (this.norVector.x != 0 && this.norVector.y != 0) {
                jp1 = (p1.x * this.norVector.x + p1.y * this.norVector.y) >
                       this.equalsTo;
                jp2 = (p2.x * this.norVector.x + p2.y * this.norVector.y) >
                       this.equalsTo;
            } else if (this.norVector.x == 0) {
                jp1 = p1.y > this.equalsTo;
                jp2 = p2.y > this.equalsTo;
            } else {
                jp1 = p1.x > this.equalsTo;
                jp2 = p2.x > this.equalsTo;
            }
            /* If the result is true, two points are really at the same side.
             * The other case shows the opposite.
             */
            if (jp1 == jp2)
               return true;
            else
               return false;
        }
    }

    // Calculate the point of intersection of two lines.
    this.PointOfIntersection = function(eqn) {
         var point = 0;

         if ((eqn.norVector.x == this.norVector.x) &&
             (eqn.norVector.y == this.norVector.y)) {
             return point = null;	// there is no intersection if two lines are parallel.
         } else {			// The algorithm is from linear algebra.
             var det = eqn.norVector.x * this.norVector.y - eqn.norVector.y * this.norVector.x;
             var newX = 0;
             var newY = 0;

             newX = (this.norVector.y * eqn.equalsTo - eqn.norVector.y * this.equalsTo) / det;
             newY = (eqn.norVector.x * this.equalsTo - this.norVector.x * eqn.equalsTo) / det;
             return new Point(newX, newY);
         }
    }
}

function road(startpoint) {

    var origin = new Point(0, 0);
    var w = 120;

    var upVector = new Vector(new Point(0, -w), origin);
    var lVector = new Vector(new Point(-w, 0), origin);
    var rVector = new Vector(new Point(w, 0), origin);
    var dVector = new Vector(new Point(0, w), origin);
    var tmp1, tmp2;

    this.points = [];
    this.vectors = [];
    this.flag = false;    

    var A = [];
    var B = [];
    var f = this.flag;

    this.draw = function (){
        c.save();
        c.beginPath();
        function Drawline(p, v, times){
            var i = 0;
            var end = new Point(p.x, p.y);
            while (i < times) {
                end.addVector(v);
                i++;
            }
            if (f == false) {
                A.push(new Point(p.x, p.y));
                B.push(new Vector(end, p));
            }
            c.moveTo(p.x, p.y)
            c.lineTo(end.x, end.y);
            return end;
        }
    
        tmp2 = tmp1 = Drawline(startpoint, upVector, 2);
        tmp1 = Drawline(tmp1, lVector, 2);
        tmp1 = Drawline(tmp1, upVector, 3);
        tmp1 = Drawline(tmp1, rVector, 3);
        tmp1 = Drawline(tmp1, dVector, 2);
        tmp1 = Drawline(tmp1, rVector, 1);
        tmp1 = Drawline(tmp1, dVector, 1);
        tmp1 = Drawline(tmp1, lVector, 1);
        Drawline(tmp1, dVector, 2)
    
        tmp2.addVector(upVector);
        tmp2 = Drawline(tmp2, upVector, 1);
        tmp2 = Drawline(tmp2, lVector, 1);
        tmp2 = Drawline(tmp2, dVector, 1);
        Drawline(tmp2, rVector, 1);
        c.strokeStyle = "#fff";
        c.stroke();
        c.restore();
        f = true;
        this.vectors = B;
        this.points = A;
        this.flag = f;
    }
};

function DrawMap() {
    
    var i;
    if (car.SensedPoints.length != 0)
        for (i = 0; i < car.SensedPoints.length; i++) {
            c_m.save();
            c_m.fillStyle = "#fff";
            c_m.fillRect(-5 + car.SensedPoints[i].x, -5 + car.SensedPoints[i].y, 10, 10);
            c_m.restore();
       }
};

function Wheel(pivot, x, y){
  this.xPos = x;
  this.yPos = y;
};

function Car(){
  this.wheelRotationStep = 2;
//  this.wheelMaxAngle = 45;
//  this.wheelAngle = 40;

  // the size of the pseudo-car
  this.width = 50;
  this.height = 100;

  this.x = 350;
  this.y = 100;

  /* the origin of plane in which the car is put.
   * the added margins are for shifting the origin on top of the car.
   * [Modified] the origin is located at the center of the car.
   */
  this.pivot = {x: this.x, y: this.y};

  this.frontPivot = {x: 0, y: 0};	// shifted origin

  // [Modified] Wheels are reduced from two pairs to one pair. 
  this.rotation = 90;			// the angle at which the car is rotated counter-clockwise
  this.directionPivot = {x: this.frontPivot.x, y:this.frontPivot.y-50};
  
  this.sensor = {x: this.pivot.x + Math.sin(this.rotation*Math.PI/180) * this.height/2, 
                 y: this.pivot.y - Math.cos(this.rotation*Math.PI/180) * this.height/2};

  // [Modified] The number now equals the half of the height of the car, 100.
  this.rearPivotAbs = {
      x: 100 * Math.cos((this.rotation+90)*Math.PI/180)+this.pivot.x,
      y: 100 * Math.sin((this.rotation+90)*Math.PI/180)+this.pivot.y
    };
  this.tempDirPivot = {x:0, y:0};

  // the position of each wheel
  // [Modified] the wheels are now reduced to one pair
  this.wheels = [];
  this.wheels.push(new Wheel(this.pivot, -this.width/2, 0)); // the left wheel
  this.wheels.push(new Wheel(this.pivot, this.width/2, 0)); // the right wheel
 
  this.SensedPoints = [];

  // Parameters associated with speed
  this.speed = 0;
  this.acceleration = 0.2;

  // define the direction in which the pseudo-car moves
  this.direction = (new Vector(this.directionPivot, this.frontPivot)).normalize();
  // represent the speed of the pseudo-car with the direction vector times the speed
  this.updateDirection = function(){
    this.direction = (new Vector(this.directionPivot, this.frontPivot)).normalize();
    this.direction.x *= this.speed;
    this.direction.y *= this.speed;
  };

  this.updateSensor = function() {
      this.sensor.x = this.pivot.x + Math.sin(this.rotation*Math.PI/180) * this.height/2;
      this.sensor.y = this.pivot.y - Math.cos(this.rotation*Math.PI/180) * this.height/2;
  };

  this.drawWheels = function(){
    for(var i = 0; i < this.wheels.length; i++)
    {
      var o = this.wheels[i];
      /* left rotation: substraction
       * Right rotation: addition
       */
      if(rotateLeft){ 		// the case that the wheels are rotated to the left
        if (this.rotation > 0)
          this.rotation -= this.wheelRotationStep;
        else
          this.rotation = 360 - this.wheelRotationStep;
      }
      if(rotateRight){ 		// the case that the wheels are rotated to the right
        if (this.rotation < 360)
          this.rotation += this.wheelRotationStep;
        else
          this.rotation = 0 + this.wheelRotationStep;
      }
      c.save();
      // Car Rotation
      c.translate(this.pivot.x, this.pivot.y);
      c.rotate(this.rotation*Math.PI/180);
      // Wheel Rotation
      c.translate(o.xPos, o.yPos);

      // [Modified] there are now only two wheels.

      c.fillStyle = 'red';
      c.fillRect(-6, -15, 12, 30);
      c.restore();
    }
    this.directionPivot.x = 50 * Math.cos((this.rotation-90)*Math.PI/180)+this.frontPivot.x;
    this.directionPivot.y = 50 * Math.sin((this.rotation-90)*Math.PI/180)+this.frontPivot.y;
    
    this.updateDirection();
    this.updateSensor();
  };
  this.drawCar = function(){
    this.drawWheels();
    c.save();
    c.translate(this.pivot.x, this.pivot.y);
    c.rotate(this.rotation*Math.PI/180);

    /* Memo about rotation:
     * What is actually rotated is not the image, but the coordinate system. It is the
     * rotation of coordinate system that consequently causes the image drawn in the canvas
     * to rotate. Moreover, the coordinate system is then everlastingly changed after rotated.
     */

    c.fillStyle = 'blue';
    c.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    c.fillStyle = 'yellow';
    c.fillRect(-3, -(this.height/2 + 3), 6, 6);
    c.beginPath();
    
    // [Modified] the lines depending on the deleted rear pivot is omitted.
    c.moveTo(this.frontPivot.x-this.width/2, this.frontPivot.y);  // line connecting the wheels
    c.lineTo(this.frontPivot.x+this.width/2, this.frontPivot.y);
    c.moveTo(this.frontPivot.x, this.frontPivot.y+this.width/2);	// center body line of the car
    c.lineTo(this.frontPivot.x, this.frontPivot.y-this.width);
    
    c.moveTo(this.frontPivot.x, this.frontPivot.y);
    c.strokeStyle="#fff";
    c.stroke();
    c.restore();
  };
   this.sensing = function(road){

       var dir = new Point ( this.height/2*Math.sin(this.rotation*Math.PI/180),
                            -this.height/2*Math.cos(this.rotation*Math.PI/180));
       var v = new Vector(new Point(dir.y, -dir.x), new Point(0, 0));
       var tmp = new Point(this.sensor.x, this.sensor.y);
       var angleStep = 10;
       var i, j, p1, p2, eqnR, eqn;
       var sp;
       var spV, minV, minp;
       var sv, dis;
       var judge;
       var inter, innerPro, v1;
          
       //var A = [];

       tmp.addVector(v);
       if (sense) {
          for (i = 0; i <= 180; i += angleStep) {
              minp = -1;
              tmp = new Point(this.sensor.x, this.sensor.y);
              tmp.addVector(v);
              eqnR = new equation(this.sensor, tmp);
              for (j = 0; j < road.points.length ; j++) {
                  p2 = new Point(road.points[j].x, road.points[j].y);
                  p2.addVector(road.vectors[j]);
                  p1 = road.points[j];
                  judge = eqnR.SameSide(p1, p2);
                  if (judge == 2) {
                      if (eqnR.IsPassed(p1) && eqnR.IsPassed(p2)) {
                          dis = min(lineDistance(p1, this.sensor), lineDistance(p2, this.sensor));
                          sv = new Vector(new Point(V.x * dis, V.y * dis), new Point(0, 0));
                          sp = new Point(this.sensor.x, this.sensor.y);
                          sp.addVector(sv);
                      } else if (eqnR.IsPassed(p1)) {
                          sp = new Point(p1.x, p1.y);
                      } else {
                          sp = new Point(p2.x, p2.y);
                      }
                  } else if (judge == 0) {
                      eqn = new equation(p1, p2);
                      inter = eqnR.PointOfIntersection(eqn);
                      v1 = new Vector(inter, this.sensor);
                      innerPro = v1.x * v.x + v1.y * v.y;
                      if (innerPro >= 0) {
                          sp = inter;
                      } else
                          continue;
                  } else {
                      continue;
                  }
                  if (minp == -1)
                      minp = sp;
                  else {
                      minV = new Vector(minp, this.sensor);
                      spV = new Vector(sp, this.sensor);
                      if (minV.length() > spV.length())
                          minp = sp;
                      else
                          continue;
                  }
              }
              this.SensedPoints.push(minp);
              v = Vrotate(v, angleStep);
          }
          //this.SensedPoints = A;
      }
 }
 this.move = function(){
    if(accelerate)
        car.speed = 1;
    if(decelerate)
        car.speed = -1;

    this.pivot.x += this.direction.x;
    this.pivot.y += this.direction.y;
 
    //console.clear();
    
     var rearPivotAbs = {
      x: 100 * Math.cos((this.rotation+90)*Math.PI/180)+this.pivot.x,
      y: 100 * Math.sin((this.rotation+90)*Math.PI/180)+this.pivot.y
    };
    this.rearPivotAbs = rearPivotAbs;
    
    //console.log(this.pivot, rearPivotAbs, rotation);
    //console.log(rearPivotAbs);
  };
};

/* Memo:
 * document.createElement('The_name_of_the_object'): the string in the paratheses is the name of the created object.
 * canvas.width: setting the width of the object
 * canvas.height: setting the height of the object
 * canvas.getContext('2d') is needed if you want to show something you have drawn.
 * document.body.appendChild(*the_name_of_the_object*) adds the object into the body of the web.
*/

var canvas = document.createElement('canvas');
var w = canvas.width = 600;
var h = canvas.height = 800;
var c = canvas.getContext('2d');
document.body.appendChild(canvas);

var canvas_map = document.createElement('canvas');
var w_m = canvas_map.width = 600;
var h_m = canvas_map.height = 800;
var c_m = canvas_map.getContext('2d');
document.body.appendChild(canvas_map);

document.getElementById('stop').style.display = "block";

// State setting of the pseudo-car
var rotateLeft = false;
var rotateRight = false;
var accelerate = false;
var decelerate = false;
var carBreak = false;
var sense = false;

/* Memo:
 * Document objects represent the html web files loaded in to the browser,
 * so the members of them are associated with the web interface.
 *
 * document.onkeydown:
 * define the ways how the code will react after a button on the 
 * keyboard is pressed.
 *
 * document.onkeyup:
 * define the ways when the opposite happens.
 */

function EventHandler(event) {
  switch(event.gj)
  {
    case 37:
      rotateLeft = true;
      break;
    case 39:
      rotateRight = true;
      break;
    case 38:
      accelerate = true;
      car.speed = 1;
      break;
    case 40:
      decelerate = true;
      car.speed = -1;
      break;
    case 32:
      //carBreak = true;
      accelerate = false;
      decelerate = false;
      rotateRight = false;
      rotateLeft = false;
      car.speed = 0;
      break;
    default:
      accelerate = false;
      decelerate = false;
      rotateRight = false;
      rotateLeft = false;
      car.speed = 0;
      break;
  }
}

document.addEventListener("myEvent", EventHandler, false);

document.getElementById('stop').onmousedown = function(){
   console.log(animationId);
   window.cancelAnimationFrame(animationId);
};

var car = new Car();
var s = new Point(300, 700);
var r = new road(s);
			  
var loop = function(){ 
  c.fillStyle = c_m.fillStyle = 'black';
  c.fillRect(0,0,w,h);
  c_m.fillRect(0,0,w_m,h_m);
  r.draw();
  car.move();
  car.drawCar();
  car.sensing(r);
  DrawMap();
};

(function() {
    var lastTime = 0;
    
    // prefices added before the string "RequestAnimationFrame"
    var vendors = ['webkit', 'moz'];

    /* scan the two members in window object, "window.webkitRequestAnimationFrame" and 
     * "window.mozRequestAnimationFrame," until either of them returns a valid ID for 
     * starting animation.
     */
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

(function animloop(){
  window.animationId = window.requestAnimationFrame(animloop);
  loop();
})();
