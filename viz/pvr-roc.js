/*

Copyright (c) 2011 Recoset <nicolas@recoset.com> <francois@recoset.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


if(this.data == null){
    var aroc = this.staticAlpha.aroc;
    var data = this.staticAlpha.model;
}
else {
    var aroc = this.data.aroc;
    var data = this.data.model;    
}
var thresholds = [];
for(var tt in data) thresholds.push(tt);
thresholds.sort(function(a, b) { return parseFloat(a)-parseFloat(b); });

var maxRecall = 0;
var maxPrecision = 0;
thresholds.forEach(function(tt) {
    if (data[tt].precision>maxPrecision) maxPrecision = data[tt].precision;
    if (data[tt].tpr>maxRecall) maxRecall = data[tt].tpr;
});

var maxInterestingThresh = 0;
var oneLast = true;
thresholds.forEach(function(tt) {
    if (data[tt].precision>0 || data[tt].tpr>0) {
        maxInterestingThresh = tt; 
    } else if (oneLast) {
        maxInterestingThresh = tt;
        oneLast = false;
    }
});

/* Sizing and scales. */
var h = document.body.clientHeight*0.9 - 100,
    w = h*1.333,
    x = pv.Scale.linear(0, maxRecall).range(0, w);
    y = pv.Scale.linear(0, maxPrecision).range(0, h);

/* The root panel. */
var vis = new pv.Panel()
    .width(w)
    .height(h)
    .left((document.body.clientWidth-w)/2)
    .right((document.body.clientWidth-w)/2)
    .bottom((document.body.clientHeight-h));

/* X-axis ticks. */
vis.add(pv.Rule)
    .data(x.ticks())
    .visible(function(d) { return d > 0; })
    .left(x)
    .strokeStyle("#eee")
  .add(pv.Rule)
    .bottom(-5)
    .height(5)
    .strokeStyle("#000")
  .anchor("bottom").add(pv.Label)
    .text(x.tickFormat);

/* Y-axis ticks. */
vis.add(pv.Rule)
    .data(y.ticks())
    .bottom(y)
    .strokeStyle(function(d) { return d ? "#eee" : "#000"})
  .anchor("left").add(pv.Label)
    .text(y.tickFormat);

/* Y-axis label */
vis.add(pv.Label)
    .data(["Precision"])
    .left(-45)
    .bottom(h/2)
    .textAlign("center")
    .textAngle(-Math.PI/2);


//Recall line
dots = vis.add(pv.Dot)
 .data(thresholds.filter(function(x) {return x<=maxInterestingThresh;}))
 .left(function(d) { return x(data[d].tpr)})
 .bottom(function(d) { return y(data[d].precision)})
 .size(2)
 .title(function(d){return d+' (Precision:'+data[d].precision+'  Recall:' + data[d].tpr+")"});

if(!isNaN(parseFloat(thresholds[0])) && isFinite(thresholds[0])) //thresholds are numeric
    dots.add(pv.Line).lineWidth(2);


/* X-axis label */
vis.add(pv.Label)
    .data(["Recall"])
    .left(w/2)
    .bottom(-50)
    .textAlign("center");

vis.render();