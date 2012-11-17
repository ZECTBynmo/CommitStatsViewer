//////////////////////////////////////////////////////////////////////////
// PunchCardGraph - Client Side
//////////////////////////////////////////////////////////////////////////
//
// Draws a punch card plot similar to the one created by GitHub
// 
/* ----------------------------------------------------------------------
                                                    Object Structures
-------------------------------------------------------------------------
	
*/
//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var BORDER_WIDTH = 30;

//////////////////////////////////////////////////////////////////////////
// Constructor
function PunchCardGraph( userInfo ) {
	var _this = this;

	this.canvas = document.getElementById( "mainCanvas" );
	this.context = this.canvas.getContext("2d");
	this.commits = userInfo.commitTimes;
	this.histogram = [];		// numCommits[day][hour]
	this.amplitudes = [];
	this.maxHistogramValue = 0;
	this.toolTip = new ToolTip( "a", false );

	// Setup our tooltip
	this.canvas.onmousemove = function(event) {
		var parentOffset = $("#mainCanvas").parent().offset(); 

		var xChunk = (_this.canvas.width - BORDER_WIDTH) / 24,
			yChunk = (_this.canvas.height - BORDER_WIDTH) / 7;

        var xLoc = event.pageX - parentOffset.left,
        	yLoc = event.pageY - parentOffset.top + BORDER_WIDTH/2;

    	var iDay = Math.floor( (yLoc - BORDER_WIDTH) / yChunk ),
    		iHour = Math.floor( (xLoc - BORDER_WIDTH) / xChunk );

        if( xLoc > BORDER_WIDTH && xLoc < _this.canvas.width - BORDER_WIDTH && yLoc > BORDER_WIDTH && yLoc < _this.canvas.height - BORDER_WIDTH )
        	_this.toolTip.Show( event, _this.histogram[iDay][iHour] );
    	else
    		_this.toolTip.Hide( event );
	}

	// Initialize our amplutudes and histogram arrays
	this.initData();

	// Create our histogram
	this.createHistogram();

	// Calculate our amplitudes
	this.calculateAmplitudes();

	// Draw ourselves
	this.draw();

} // end PunchCardGraph()


//////////////////////////////////////////////////////////////////////////
// Main drawing function
PunchCardGraph.prototype.draw = function() {
	var context = this.context,
		canvas = this.canvas;

	// Draw our background border lines
	context.beginPath();
	context.moveTo( BORDER_WIDTH, 0 );
	context.lineTo( BORDER_WIDTH, canvas.height - BORDER_WIDTH );
	context.lineTo( canvas.width, canvas.height - BORDER_WIDTH );
	context.lineTo( BORDER_WIDTH, canvas.height - BORDER_WIDTH );
	context.moveTo( BORDER_WIDTH, 0 );
	context.stroke();
	context.closePath();

	// Place our day of the week labels
	var dayTextSpacing = ( canvas.height - BORDER_WIDTH ) / 7, 
		xDayLabels = 0;

	context.fillText( "Sun", xDayLabels, dayTextSpacing * 0 + dayTextSpacing/2 + 4 );
	context.fillText( "Mon", xDayLabels, dayTextSpacing * 1 + dayTextSpacing/2 + 4 );
	context.fillText( "Tue", xDayLabels, dayTextSpacing * 2 + dayTextSpacing/2 + 4 );
	context.fillText( "Wed", xDayLabels, dayTextSpacing * 3 + dayTextSpacing/2 + 4 );
	context.fillText( "Thu", xDayLabels, dayTextSpacing * 4 + dayTextSpacing/2 + 4 );
	context.fillText( "Fri", xDayLabels, dayTextSpacing * 5 + dayTextSpacing/2 + 4 );
	context.fillText( "Sat", xDayLabels, dayTextSpacing * 6 + dayTextSpacing/2 + 4 );

	// Place our hour legend
	context.fillText( "Hour", canvas.width/2, canvas.height );

	// Place our hour labels
	var hourLabelSpacing = ( canvas.width - BORDER_WIDTH ) / 24;
	for( var iHour=0; iHour<24; ++iHour ) {
		var xLoc = BORDER_WIDTH + iHour*hourLabelSpacing + hourLabelSpacing/2 - 3,
			labelText= iHour > 11 ? iHour - 12: iHour;
		context.fillText( labelText, xLoc, canvas.height - 15 );
	}

	// Draw circles at each location to reflect our amplitudes
	for( var iDay=0; iDay<7; ++iDay ) {
		for( var iHour=0; iHour<24; ++iHour ) {
			var amplitude = parseFloat( this.amplitudes[iDay][iHour] );

			var xLoc = BORDER_WIDTH + iHour*hourLabelSpacing + hourLabelSpacing/2,
				yLoc = dayTextSpacing * iDay + dayTextSpacing/2,
				radius = hourLabelSpacing/2 * amplitude;

			context.beginPath();
			context.globalAlpha = amplitude;
			context.fillStyle = "rgb(255, 255, 255, +" + 0.5 +")";
			context.arc( xLoc, yLoc, radius, 0, 2 * Math.PI, false );
			context.fill();
		}
	}

} // end PunchCardGraph.draw()


/////////////////////////////////////////////////////////////////////////
// Initializes our histogram and amplitudes after creation
PunchCardGraph.prototype.initData = function() {
	for( var iDay=0; iDay<7; ++iDay ) {
		var newHistDay = [],
			newAmpDay = [];

		for( var iHour=0; iHour<24; ++iHour ) {
			newHistDay.push( 0 );
			newAmpDay.push( 0 );
		}

		this.histogram[iDay] = newHistDay;
		this.amplitudes[iDay] = newAmpDay;
	}
} // end PunchCardGraph.initData()


//////////////////////////////////////////////////////////////////////////
// Create a histogram for a set of commit times
PunchCardGraph.prototype.createHistogram = function() {
	this.clearHistogram();

	for( var iCommit=0; iCommit<this.commits.length; ++iCommit ) {
		var time = new Date( this.commits[iCommit] );

		var hour = time.getHours(),
			day = time.getDay();

		this.histogram[day][hour]++;

		// If this is a new max for the histogram, record it
		if( this.histogram[day][hour] > this.maxHistogramValue )
			this.maxHistogramValue = this.histogram[day][hour];
	}
} // end PunchCardGraph.createHistogram()


//////////////////////////////////////////////////////////////////////////
// Calculate amplitudes for each location in the graph
PunchCardGraph.prototype.calculateAmplitudes = function() {
	for( var iDay=0; iDay<7; ++iDay ) {
		for( var iHour=0; iHour<24; ++iHour ) {
			this.amplitudes[iDay][iHour] = this.histogram[iDay][iHour] / this.maxHistogramValue;
		}
	}
} // end PunchCardGraph.calculateAmplitudes()


//////////////////////////////////////////////////////////////////////////
// Clears out the histogram data
PunchCardGraph.prototype.clearHistogram = function() {
	for( var iDay=0; iDay<7; ++iDay ) {
		if( typeof(this.histogram[iDay]) == "unefined" ) {
			this.histogram.push( [] );
		}

		var thisDay = this.histogram[iDay];

		for( var iHour=0; iHour<24; ++iHour ) {
			if( typeof(thisDay[iHour]) == "unefined" )
				thisday.push( 0 );
			else
				thisDay[iHour] = 0;
		}
	}
} // end PunchCardGraph.clearHistogram()