var lines;
var canvas;
var context;
var xhrequest;
var largestValueIndex = 0;
var smallestValueIndex = 0;
var total = 0;
var data = {};

//CONSTANT DECLARATIONS
const RADIUS = 100;
const LINEENDPOINT = 40;
const TEXTENDPOINT = 60;

//cleaner code: using named function
document.addEventListener("DOMContentLoaded", init);

function init() {
    canvas = document.querySelector("#canvas1");
    context = canvas.getContext("2d");
    canvas = document.querySelector("#canvas2");
    lines = canvas.getContext("2d");
    xhrequest = new XMLHttpRequest();
    xhrequest.open("GET", "browsers.json");
    xhrequest.addEventListener("load", gotResponse);
    xhrequest.send(null);
}

function gotResponse() {
    if (xhrequest.status === 200 || xhrequest.status === 300) {
        try {
            data = JSON.parse(xhrequest.responseText);
            calcTotalMinMax();
            showPie();

        } catch (e) {
            JSONParseError();
            console.log("name:" + e.name + "\nmessage:" + e.message)
        }
        showLines();
    } else {
        JSONLoadError();
    }
}

function JSONLoadError() {
    alert("Failed to load JSON")
}

function JSONParseError() {
    alert("JSON parse error: corrupt or invalid JSON")
}

function calcTotalMinMax() {
    var length = data.segments.length;
    for (var i = 0; i < length; i++) {
        total += data.segments[i].value;
        if (data.segments[i].value < data.segments[smallestValueIndex].value) {
            smallestValueIndex = i;

        } else if (data.segments[i].value > data.segments[largestValueIndex].value) {
            largestValueIndex = i;
        }
    }
}


function setDefaultStyles() {
    //set default styles for canvas
    context.strokeStyle = "#333"; //colour of the lines
    context.lineWidth = 3;
    context.font = "bold 16pt Arial";
    context.fillStyle = "#900"; //colour of the text
    context.textAlign = "left";
}

function showPie() {

    //clear the canvas
    //context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.width;
    //set the styles in case others have been set
    setDefaultStyles();
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var radius = 100;
    var currentAngle = 0;

    //set variable using constant valuyes
    var radius = RADIUS;
    var lineEndPoint = LINEENDPOINT;
    var textEndPoint = TEXTENDPOINT;
    var bigSliceStartingAngle = data.segments[0].value * (Math.PI * 2) / total;
    var bigSliceEndAngle = (data.segments[0].value + data.segments[1].value) * (Math.PI * 2) / total;


    context.moveTo(cx, cy);
    context.beginPath();
    context.fillStyle = data.segments[1].color;
    context.arc(cx, cy, radius * 1.2, bigSliceStartingAngle, bigSliceEndAngle, false);
    context.lineTo(cx, cy);
    context.fill();
    for (var i = 0; i < data.segments.length; i++) {

        if (data.segments[i].value == largestValueIndex) {
            radius = 120;
        } else if (data.segments[i].value == smallestValueIndex) {
            radius = 80;
        } else {
            radius = 100;
        }
        var pct = data.segments[i].value / total;
        var colour = data.segments[i].color;



        var endAngle = currentAngle + (pct * (Math.PI * 2));
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = colour;
        context.arc(cx, cy, radius, currentAngle, endAngle, false);
        context.lineTo(cx, cy);
        context.fill();

        //Now draw the lines that will point to the values
        context.save();
        context.translate(cx, cy); //make the middle of the circle the (0,0) point
        context.strokeStyle = "#0CF";
        context.lineWidth = 1;
        context.beginPath();
        //angle to be used for the lines
        var midAngle = (currentAngle + endAngle) / 2; //middle of two angles
        context.moveTo(0, 0); //this value is to start at the middle of the circle
        //to start further out...
        var dx = Math.cos(midAngle) * (0.8 * radius);
        var dy = Math.sin(midAngle) * (0.8 * radius);
        context.moveTo(dx, dy);
        //ending points for the lines
        var dx = Math.cos(midAngle) * (radius + 40); //30px beyond radius
        var dy = Math.sin(midAngle) * (radius + 40);
        context.lineTo(dx, dy);
        context.stroke();
        //put the canvas back to the original position
        context.font = "10px Arial";
        context.textAlign = "center";
        context.fillStyle = "black";
        context.fillText(data.segments[i].label, dx, dy);
        context.restore();

        //update the currentAngle
        currentAngle = endAngle;
    }
}

function showLines(ev) {
    //highlight the clicked button
    if (ev) {
        highlightButton(ev.currentTarget);
    }
    //clear the canvas
    lines.clearRect(0, 0, canvas.width, canvas.height);
    //set the styles in case others have been set
    setDefaultStyles();
    var numPoints = data.segments.length; //how many points to draw on the line.
    var offsetX = 30; //space away from left edge of canvas to start drawing.
    var offsetY = 300; //bottom edge of the graph
    var spaceBetweenPoints = ((canvas.width - offsetX) / numPoints);
    //how far apart to make each x value.
    var graphHeight = 300;
    //use the percentage to calculate the height of the next point on the line
    //values[0] is the moveTo point.
    //values[1] is the first lineTo point.
    var x = 0 + offsetX;
    var y = offsetY - (graphHeight * (data.segments[0].value / total));
    lines.moveTo(x, y);
    lines.beginPath();
    for (var i = 0; i < data.segments.length; i++) {
        var pct = data.segments[i].value / total;
        console.log(pct);
        console.log(data.segments[i]);

        y = offsetY - (graphHeight * (data.segments[i].value / total));
        lines.lineTo(x, y);
        console.log(pct, y, total);
        //for the first point the moveTo and lineTo values are the same
        //to add labels take the same x position but go up or down 30 away from the y value
        //use the percentage to decide whether to go up or down. 20% or higher write below the line
        var lbl = Math.round(pct * 100).toString();
        if (pct <= .2) {
            lines.fillText(lbl, x, y - 30);
        } else {
            lines.fillText(lbl, x, y + 30);
        }
        x = x + spaceBetweenPoints; //move the x value for the next point
    }
    lines.stroke();
    //now draw the x and y lines for the chart
    lines.strokeStyle = "#999";
    lines.lineWidth = 1;
    lines.beginPath();
    lines.moveTo(offsetX, canvas.height - graphHeight);
    lines.lineTo(offsetX, graphHeight);
    lines.lineTo(canvas.width - offsetX, graphHeight);
    lines.stroke();
}
