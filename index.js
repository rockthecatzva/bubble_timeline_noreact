var d3 = require('d3');
var CryptoJS = require("crypto-js");

document.addEventListener("DOMContentLoaded", function (event) {
  var articleCount = 35;
  var selectedYear = 2017;
  this.getElementById("articleCountIndicator").innerHTML = articleCount;
  var start, stop;
  var subreddits = ["news", "politics", "worldnews", "television", "science"];

  var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var token = "";

  (async () => {
    var url = "https://www.reddit.com/api/v1/access_token";
    try {
      var response = await fetch(url, {
        method: "post",
        headers: {
          'Authorization': "Basic " + CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse("TGuKx4Fkfb7ivQ:")),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "grant_type=https://oauth.reddit.com/grants/installed_client&device_id=DO_NOT_TRACK_THIS_DEVICE"
      });

      var data = await response.json();
      token = { headers: { 'Authorization': 'bearer ' + data.access_token } };
      
    } catch (e) {
      console.log("the initial auth request was rejected", e)
    }
  })();


  document.getElementById("submitbutton").onclick = function (event) {
    console.log(token);
    event.preventDefault();
    d3.select("#tooltip").classed("hidden", true);//hide the tool tip - otherwise will have old info
    var monthdates, url, months, baseurl, timelineData, endurl;

    baseurl = "https://oauth.reddit.com/r/";
    endurl = "/search.json?sort=top&limit=" + articleCount + "&q=timestamp%3A" + (Math.trunc(start.getTime() / 1000)) + ".." + (Math.trunc(stop.getTime() / 1000)) + "&restrict_sr=on&syntax=cloudsearch";

    var p = Promise.all(subreddits.map(sub => {
      url = baseurl + sub + endurl;
      return fetch(url, token).then(response => response.json().then(dat => {
        return dat.data.children.map(art => {
          return {
            "url": art.data["url"],
            "score": art.data["score"],
            "ups": art.data["ups"],
            "date": art.data["created_utc"] * 1000,
            "downs": art.data["downs"],
            "title": art.data["title"],
            "domain": art.data["domain"],
            "image": ((art.data.hasOwnProperty("preview")) ? art.data.preview.images[0].source.url : null),
            "comments": art.data["num_comments"]
          }
        })
      }))
    })).then(val => {
      document.getElementById("svg-main").innerHTML = "";
      drawTimelines(document.getElementById("svg-main"), [start, stop], val);
    })
  }


  var updateYearSelected = function (yr) {
    selectedYear = parseInt(yr);
    var ys = document.getElementsByClassName("yearselect");
    ys = Array.prototype.slice.call(ys);
    ys.forEach(function (element) {
      if (element.value != selectedYear) {
        element.classList.add("greyout");
      }
      else {
        element.classList.remove("greyout");
      }
    }, this);

    start = new Date(selectedYear, 0, 1);
    stop = new Date(selectedYear, 12, 0);
    if (stop > (new Date())) { stop = new Date() };
  }

  var yearButtonClick = (e) => {
    e.preventDefault();
    updateYearSelected(e.target.value);
  }

  var articleCountButtonClick = (e) => {
    e.preventDefault();

    if (e.target.value == "plus") {
      if (articleCount < 100) { articleCount++; }
    }
    else {
      if (articleCount > 1) { articleCount--; }
    }

    this.getElementById("articleCountIndicator").innerHTML = articleCount;
  }

  var ys = document.getElementsByClassName("yearselect");
  ys = Array.prototype.slice.call(ys);
  ys.map((e) => { e.onclick = yearButtonClick });

  var ac = document.getElementsByClassName("articleCount");
  ac = Array.prototype.slice.call(ac);
  ac.map((e) => { e.onclick = articleCountButtonClick });

  updateYearSelected(selectedYear);


  var drawTimelines = function (svgTarget, dates, dataSets) {
    var formatDate = d3.timeFormat("%d-%b-%y");
    var svg = d3.select(svgTarget).append("svg");
    const height = 10,
      maxCirc = 30,
      minCirc = 4,
      ROW_GAP = 100,
      ypos = 40,
      tooltipBuffer = -15,

      margin = { top: 100, right: 60, bottom: 40, left: 60 };


    var containerW = parseInt((window.getComputedStyle(svgTarget).width).replace("px", "")),
      containerH = parseInt((window.getComputedStyle(svgTarget).height).replace("px", ""));

    svg.attr("class", "svg");
    svg.attr("width", containerW)
      .attr("height", containerH);

    var x = d3.scaleTime()
      .domain([(start), (stop)])
      .range([margin.left, containerW - (margin.right + margin.left)]);
    //find max among all sets - scale will be consistent for subreddit 
    var maxval = d3.max(dataSets.map(s => {
      return d3.max(s, d => d.score);
    }));

    var minval = d3.min(dataSets.map(s => {
      return d3.min(s, d => d.score);
    }));

    var y = d3.scaleLinear()
      .domain([minval, maxval])
      .range([minCirc, maxCirc]);
    
    var xAxis = d3.axisBottom(x)
      .ticks(d3.timeMonths((start), (stop)).range)
      .tickSize(12, 0)
      .tickFormat(d3.timeFormat("%B"));

    var bubbleGroup = svg.append("g")
      .attr("class", "bubble-group")
      .attr("transform", "translate(" + (margin.left) + ", " + margin.top + ")");

    var axisgroup = bubbleGroup.append("g")
      .attr("class", "x axis")
      .style("font-family", "mainfont")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(xAxis);

    svg.selectAll(".bubbles").remove()
    var bubble, maxval, textbubble, minval;



    document.getElementById("min-val").innerHTML = Math.round(minval / 1000) + "k";
    document.getElementById("max-val").innerHTML = Math.round(maxval / 1000) + "k";

    //draw graph legend
    d3.select("#legend-svg").select("svg").remove();
    var legendGroup = d3.select("#legend-svg").append("svg")
      .attr("width", "160px")
      .attr("height", "50px");

    legendGroup.append("circle")
      .attr("class", "bubble")
      .attr("r", () => { return maxCirc })
      .attr("cy", "25px")
      .attr("cx", "117px");

    legendGroup.append("circle")
      .attr("class", "bubble")
      .attr("r", () => { return minCirc })
      .attr("cx", "40px")
      .attr("cy", "25px");

    document.getElementById("hide-box").classList.remove('hidden');

    console.log(svg)
    dataSets.forEach((data, setnum) => {
      //each set will have its own scale!
      //maxval = Math.max.apply(null, data.map(d => { return d["ups"] }));

      //Sort data by ups - largest to smallest - so when drawing the smaller ones will appear on top
      data = data.sort((a, b) => {
        if (a["score"] < b["score"]) return 1;
        if (a["score"] > b["score"]) return -1;
        return 0;
      });

      //draw the horizontal axis for each data set
      bubbleGroup.append("line")
        .attr("class", "horiz-line")
        .attr("x1", margin.left)
        .attr("y1", (ypos + ROW_GAP * setnum))
        .attr("x2", containerW - (margin.right + margin.left))
        .attr("y2", (ypos + ROW_GAP * setnum));

      //add a label for the subreddit
      bubbleGroup.append("foreignObject")
        .attr("y", (ypos + ROW_GAP * setnum) - 15)
        .attr("x", -60)
        .attr("text-anchor", "left")
        .html((d, i) => {
          return ("<span class='subreddit-label'>/" + subreddits[setnum] + ":</span>");
        });


      bubble = bubbleGroup.selectAll(".bubbles")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(" + x(d["date"]) + "," + (ypos + ROW_GAP * setnum) + ")"; });

      bubble.append("circle")
        .attr("class", "bubble")
        .attr("r", (d) => { return y(d["score"])})
        .on("click", function (d) {
          d3.selectAll(".bubble-highlight").attr("class", "bubble");
          d3.select(this).attr("class", "bubble-highlight");

          console.log(svg);
          var foWidth = 200,
              foHeight = 200,
              tip = {
                w: 20,
                h: 20,
              };
          
          d3.selectAll(".foreignOb").remove();
    
          
          var fo = svg.append('foreignObject')
                      .attr("class", "foreignOb");

          var closefo = function(){d3.selectAll('.foreignOb').remove()};
          
            var div = fo.append('xhtml:div')
            .append('div')
            .attr("id", "tooltip");
            
            div.append("div")
              .attr("class","close-row")
              .html('<button id="close-box" class="btn btn-clear float-right"></button>')
              .on("click", function(){d3.selectAll(".foreignOb").remove()});
            
            div.append("p")
              .attr("class","top-row")
              .html('<span class="float-left date">'+months[new Date(d.date).getMonth()]+' '+new Date(d.date).getDate()+'</span><span class="float-right score">'+Math.round(d.score/1000)+'k</span>');

            div.append('p')
            .attr('class', 'title')
            .html(d.title);

            
          fo.attr("width", foWidth);
          var foHeight = document.getElementById("tooltip").clientHeight,
              ytrans = ROW_GAP*setnum+ypos-foHeight+margin.top;
          fo.attr('height', foHeight);
      
          fo.attr("transform", "translate("+x(d.date)+margin.left+","+ytrans+")");
          
          fo.append('path')
          .attr('d', function(d) { 
            var x = 100, y = 100;
            return 'M ' + x +' '+ y + ' l 4 4 l -8 0 z';
          });

          



        });




    });
  }






});