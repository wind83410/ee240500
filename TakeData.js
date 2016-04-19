
    var batch=30;
    var samples=batch;
    var timecycle=0;
    var requestCounter = 0;
    var interval = 0;
    var nodata = 0;

    // the common part of the place where the data are put.
    var serverAddressBase = "xdata.";

    var serverAddress = "xdata.0"; //default file to get from server

    // containers for loaded data
    d1 = [];
    d2 = [];
    d3 = [];
    
    // Pre-pad the arrays with # of samples null values
    for (var i=0; i< samples; ++i) {
        d1.push(null);
        d2.push(null);
        d3.push(null);
    }
    
    // function prototype
    var xmlHttp = createXmlHttpRequestObject();


    // creates XMLHttpRequest Instance
    function createXmlHttpRequestObject(){

      // will store XMLHttpRequest object
      // at here
      var xmlHttp;
      

      /* Memo:
       * the functions, "try" and "catch," are used to test if something you
       * want to do works in a specified environment.
       * Function "try" lets you test a block of codes for error, while
       * function "catch" helps you take measure when an error pops up.
       */

      // To ensure that this program and the browsers are compatible.
      // works all except IE6 and older  
      try
      {
      
	// try to create XMLHttpRequest object
	// this object is resposible for requesting data from the httpd server.
	xmlHttp = new XMLHttpRequest();    
      }
      catch(e)
      {
	// assume IE 6 or older
	try
	{
	  xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	catch(e){ }
      }
      
      // return object or display error
      if (!xmlHttp)
	alert("Error creating the XMLHttpRequest Object");
      else
	return xmlHttp;
    }

    function GetJsonData()
    {
      //debug
      //myDiv = document.getElementById("myDivElement"); 
      //myDiv.innerHTML += "Getting Json Data<br>"; 
      nodata=0;

      if(xmlHttp)
      {
	try
	{
	  xmlHttp.open("Get", serverAddress, false);

          //We use synchronous data transfer, so we don't need this here
	  //xmlHttp.onreadystatechange = handleRequestStateChange;

	  xmlHttp.send(null);
	  try{
		  handleJsonData();
	  }
	  catch(err){
	     if(err=="no data"){
	          //alert('Waiting '+serverAddressBase+requestCounter);
		  //setTimeout(GetJsonData,10); //Try again 10ms later
		  nodata=1; //record status
	     }
	  }
	}
	catch(e)
	{
	  alert("Can't connect to server\n" + e.toString());
	}
      }
    }

    function handleRequestStateChange()
    {
      if (xmlHttp.readyState == 4)
      {
	if(xmlHttp.status == 200|| xmlHttp.status == 0)
	    {
	      try
	      {
		handleJsonData();
	      }
	      catch(e)
	      {
		alert("Error reading the response: " + e.toString());
	      }
	    }
	    else
	    {
	      alert("Problem retrieving data:\n" + xmlHttp.statusText);
	    }
      
      
      }
      
    }

    function handleJsonData()
    {
      var result = xmlHttp.responseText;
      if(result==''){
        //alert('No data from xmlhttprequest object!');
	throw "no data";
      }
      else{
	      try{
		      var jobject = eval("(" + result + ")");
		      var i=0;
		      if(jobject.time>timecycle){
			      timecycle=jobject.time;
			      if(jobject.xarray.length==0){
				throw "no data";
			      }
			      else{
				      for (i=0;i<jobject.xarray.length;i++)
				      {
					  //debug
					  //myDiv.innerHTML += jobject.xarray[i][0] + ", " + jobject.xarray[i][1] + "<br>" ;
					  d1[i]=jobject.xarray[i][0];
					  d2[i]=jobject.xarray[i][1];
					  d3[i]=jobject.xarray[i][2];
					  /*
					  d1.push(jobject.xarray[i][0]); 
					  d2.push(jobject.xarray[i][1]); 
					  d3.push(jobject.xarray[i][2]);
					  */
				      }
			      }
		      }
		      else{
			//Do nothing
		      }
	      }
	      catch(e){
		//Retry; ignore all json errors
	      }
      }
    }

    /*function getGraph(id, d1, d2, d3)
    {
	var graph = new RGraph.Line(id, d1, d2, d3);
	graph.Set('chart.key', ['Xacc', 'Yacc', 'Zacc']);
	graph.Set('chart.xticks', 100);
	graph.Set('chart.gutter', 25);
	graph.Set('chart.background.barcolor1', 'white');
	graph.Set('chart.background.barcolor2', 'white');
	graph.Set('chart.title.xaxis', 'Time >>>');
	graph.Set('chart.title.yaxis', 'Sensor');
	graph.Set('chart.title', 'Sensor activities'+' xdata.'+requestCounter);
	//graph.Set('chart.filled', true);
	//graph.Set('chart.fillstyle', ['#daf1fa', '#faa']);
	graph.Set('chart.colors', ['rgb(169, 222, 244)', 'red', 'blue']);
	graph.Set('chart.linewidth', 1);
	//graph.Set('chart.ylabels.inside', true);
	graph.Set('chart.yaxispos', 'right');
	graph.Set('chart.xaxispos', 'center');
	//graph.Set('chart.ymin', -128);
	//graph.Set('chart.ymax', 128);
	graph.Set('chart.xticks', 25);

	return graph;
    }*/

    /*function drawGraph ()
    {
        //debug
        //myDiv = document.getElementById("myDivElement"); 
        //myDiv.innerHTML += "Request # " + requestCounter + ": <br>"; 

	RGraph.Clear(document.getElementById("cvs"));
	
	//Prepare new file name to get from
	serverAddress=serverAddressBase+requestCounter;
	//alert('Debug'+serverAddress);

        //Save data from json object to the arrays
	GetJsonData();
	//Draw the graph
	var graph = getGraph('cvs', d1, d2, d3);
	graph.Draw();
	if(!nodata){ //Keep the file counter
		requestCounter=(requestCounter+1)%2; //cycle counter
		//alert('Counter changed: '+requestCounter);
	}
	else{
		//alert('Counter keeped: '+requestCounter);
	}
	setTimeout(drawGraph,800);
    } */

    function average(array) {
         
        var total = i = 0;
        var len = array.length;
        while ( i < len ) {
            total += array[i++];
        }
        return total / len;
    
    }
    
    function PolarAngle(X, Y) {

        var col = 0;
         
        if (X != 0) {
            col = Math.atan( Y / X ) * 180 / Math.PI;
            if (col >= 0) {
                if (X < 0)
                    col += 180;
            } else {
                if (X > 0)
                   col += 360;
                else
                   col = 180 - col;
            }
        } else {
           if (Y > 0)
               col = 90;
           else if (Y < 0)
               col = 270;
           else
               col = -1; // inform the undefined state
        }
        return col;
    }
    
    function AzimuthalAngle(X, Y, Z) {
    
        var sq = X * X + Y * Y + Z * Z;
        var polar = Math.sqrt(sq);

        return Math.acos( Z / polar ) * 180 / Math.PI;
    } 

    
    //var GJ = 32;
    function GestureJudge() {
        
        var Xav = Yav = Zav = 0;
        var theta, phi;
        
        Xav = average(d1);
        Yav = average(d2);
        Zav = average(d3);
        theta = PolarAngle(Xav, Yav);
        phi = AzimuthalAngle(Xav, Yav, Zav);
        if (phi <= 10) {
             return 32;
        } else if ( phi <= 40 ) {
            if (theta <= 135 && theta > 45)
                return 38;
            else if (theta <= 225 && theta > 135)
                return 37;
            else if (theta <= 270 && theta > 225)
                return 40;
            else if ((theta <= 45 || theta > 270) && theta >= 0)
                return 39;
        } else
            return -1;
    }


    function GestureWatcher() {

        serverAddress = serverAddressBase + requestCounter;
        GetJsonData();
        var GJ = GestureJudge();
        if(!nodata){ //Keep the file counter
            requestCounter=(requestCounter+1)%2; //cycle counter
        }
        else{
        }
        var evt = document.createEvent("Event");
        evt.initEvent("myEvent",true,true);
        evt.gj = GJ;
        document.dispatchEvent(evt);
        setTimeout(GestureWatcher, 800);
    }
    
    GestureWatcher();
