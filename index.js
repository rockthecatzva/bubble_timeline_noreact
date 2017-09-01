let d3 = require('d3');
var CryptoJS = require("crypto-js");

document.addEventListener("DOMContentLoaded", function (event) {
  let articleCount = 35;
  let selectedYear = 2017;
  this.getElementById("articleCountIndicator").innerHTML = articleCount;
  let start, stop;
  let subreddits = ["news", "politics", "worldnews", "television", "science"];
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let token = "";

  (async () => {
    let url = "https://www.reddit.com/api/v1/access_token";
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
      token =  {headers: {'Authorization': 'bearer ' + data.access_token }};
      //console.log(token);
    } catch (e) {
      console.log("the initial auth request was rejected", e)
    }
  })();



  document.getElementById("close-box").onclick = function (event) {
    d3.select("#tooltip").classed("hidden", true);
  }

  document.getElementById("submitbutton").onclick = function (event) {
    console.log(token);
    event.preventDefault();
    d3.select("#tooltip").classed("hidden", true);//hide the tool tip - otherwise will have old info
    let monthdates, url, months, baseurl, timelineData, endurl;
    
    baseurl = "https://oauth.reddit.com/r/";
    endurl = "/search.json?sort=top&limit=" + articleCount + "&q=timestamp%3A" + (Math.trunc(start.getTime() / 1000)) + ".." + (Math.trunc(stop.getTime() / 1000)) + "&restrict_sr=on&syntax=cloudsearch";

    let p = Promise.all(subreddits.map(sub => {
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


  let updateYearSelected = function (yr) {
    selectedYear = parseInt(yr);
    let ys = document.getElementsByClassName("yearselect");
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

  let yearButtonClick = (e) => {
    e.preventDefault();
    updateYearSelected(e.target.value);
  }

  let articleCountButtonClick = (e) => {
    e.preventDefault();

    if (e.target.value == "plus") {
      if (articleCount < 100) { articleCount++; }
    }
    else {
      if (articleCount > 1) { articleCount--; }
    }

    this.getElementById("articleCountIndicator").innerHTML = articleCount;
  }

  let ys = document.getElementsByClassName("yearselect");
  ys = Array.prototype.slice.call(ys);
  ys.map((e) => { e.onclick = yearButtonClick });

  let ac = document.getElementsByClassName("articleCount");
  ac = Array.prototype.slice.call(ac);
  ac.map((e) => { e.onclick = articleCountButtonClick });

  updateYearSelected(selectedYear);


  let drawTimelines = function (svgTarget, dates, dataSets) {
    let formatDate = d3.timeFormat("%d-%b-%y");
    var svg = d3.select(svgTarget).append("svg");
    let height = 10,
      MAXBALLOON_SIZE = 30,
      ROW_GAP = 100,
      ypos = 40,
      tooltipBuffer = -15,

      margin = { top: 20, right: 30, bottom: 40, left: 100 };


    let containerW = parseInt((window.getComputedStyle(svgTarget).width).replace("px", "")),
      containerH = parseInt((window.getComputedStyle(svgTarget).height).replace("px", ""));

    svg.attr("class", "svg");
    svg.attr("width", containerW)
      .attr("height", containerH);

    var x = d3.scaleTime()
      .domain([(start), (stop)])
      .range([0, containerW - (margin.left + margin.right)]);

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

    //find max among all sets - scale will be consistent for each line
    let alldat = dataSets[0].concat(...dataSets);
    maxval = Math.max.apply(null, alldat.map(d => { return d["score"] }));
    minval = Math.min.apply(null, alldat.map(d => { return d["score"] }));

    document.getElementById("min-val").innerHTML = Math.round(minval / 1000) + "k";
    document.getElementById("max-val").innerHTML = Math.round(maxval / 1000) + "k";

    //draw graph legend
    d3.select("#legend-svg").select("svg").remove();
    var legendGroup = d3.select("#legend-svg").append("svg")
      .attr("width", "160px")
      .attr("height", "50px");

    legendGroup.append("circle")
      .attr("class", "bubble")
      .attr("r", () => { return MAXBALLOON_SIZE })
      .attr("cy", "25px")
      .attr("cx", "117px");

    legendGroup.append("circle")
      .attr("class", "bubble")
      .attr("r", () => { return (minval / maxval) * MAXBALLOON_SIZE })
      .attr("cx", "40px")
      .attr("cy", "25px");

    document.getElementById("hide-box").classList.remove('hidden');

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
        .attr("x1", 0)
        .attr("y1", (ypos + ROW_GAP * setnum))
        .attr("x2", containerW - (margin.right + margin.left))
        .attr("y2", (ypos + ROW_GAP * setnum));

      //add a label for the subreddit
      bubbleGroup.append("foreignObject")
        .attr("y", (ypos + ROW_GAP * setnum) - 15)
        .attr("x", -100)
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
        .attr("r", (d) => { return (d["score"] / maxval) * MAXBALLOON_SIZE })
        .on("click", function (d) {
          d3.selectAll(".bubble-highlight").attr("class", "bubble");
          d3.select(this).attr("class", "bubble-highlight")
          document.getElementById("tool-link").setAttribute("href", d.url);
          document.getElementById("title").innerHTML = d.title;
          document.getElementById("date").innerHTML = (months[new Date(d.date).getMonth()]) + "-" + new Date(d.date).getDate();
          d3.select("#tooltip").classed("hidden", false);

          d3.select("#tooltip")
            .style("left", function () {
              let boxW = document.getElementById('tooltip').clientWidth / 2;
              return (d3.event.pageX - boxW) + "px";
            })
            .style("top", function () {
              let boxH = document.getElementById('tooltip').clientHeight;
              return (d3.event.pageY - boxH + tooltipBuffer) + "px";
            })
            .select("#value").text(Math.round(d.score / 1000) + "k");
        });

    });
  }






});