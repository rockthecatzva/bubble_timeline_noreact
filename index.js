let d3 = require('d3');

document.addEventListener("DOMContentLoaded", function (event) {
  let articleCount = 10;
  let selectedYear = 2017;
  this.getElementById("articleCountIndicator").innerHTML = articleCount;
  let start, stop;
  let subreddits = ["news", "politics", "worldnews", "television", "science"];
  //let subreddits = ["news"];
  let rawdata = [];
  

  



  document.getElementById("submitbutton").onclick = function (event) {
    event.preventDefault();
    let monthdates, url, months, baseurl, timelineData, endurl;
    baseurl = "https://www.reddit.com/r/";
    endurl = "/search.json?sort=top&limit=" + articleCount + "&q=timestamp%3A" + (Math.trunc(start.getTime() / 1000)) + ".." + (Math.trunc(stop.getTime() / 1000)) + "&restrict_sr=on&syntax=cloudsearch";

    let p = Promise.all(subreddits.map(sub => {
      url = baseurl + sub + endurl;
      return fetch(url).then(response => response.json().then(dat => 
                        { return dat.data.children.map(art => 
                          { return { "url": art.data["url"], 
                                     "score": art.data["score"], 
                                     "ups": art.data["ups"], 
                                     "date": art.data["created_utc"]*1000, 
                                     "downs": art.data["downs"], 
                                     "title": art.data["title"],
                                     //"image": ((art.data.hasOwnProperty("preview")) ? art.data.preview.images[0].source.url : null), 
                                     "comments": art.data["num_comments"] } }) }))
    })).then(val => {
      //console.log("ALL LOADED!!!", document.getElementById("svg-header").width);
      document.getElementById("svg-main").innerHTML = "";
      ///document.getElementById("svg-header").innerHTML = "";
      drawTimelines(document.getElementById("svg-main"), [start, stop], val);
      //drawScaleLines(document.getElementById("svg-header"), [start, stop])
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
      if (articleCount > 0) { articleCount--; }
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

  let drawScaleLines = function (svgTarget, dates) {
    let svg = d3.select(svgTarget).append("svg"),
      width = d3.select(svgTarget).node().getBoundingClientRect().width,
      height = d3.select(svgTarget).node().getBoundingClientRect().height;

    svg.attr("width", width);

    var x = d3.scaleTime()
      .domain([new Date(dates[0]), new Date(dates[1])])
      .range([0, width]);

    var xAxis = d3.axisBottom(x)
      .ticks(d3.timeMonths(new Date(dates[0]), new Date(dates[1])).range)
      .tickSize(12, 0)
      .tickFormat(d3.timeFormat("%B"));

    var bubbleGroup = svg.append("g")
      .attr("class", "x axis")
      .style("font-family", "mainfont")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(xAxis);

    bubbleGroup.selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)
      .attr("y", 6);
  }

  let drawTimelines = function (svgTarget, dates, dataSets) {

    //Sort data by ups - largest to smallest - so when drawing the smaller ones will appear on top
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    let formatDate = d3.timeFormat("%d-%b-%y");
    let svg = d3.select(svgTarget).append("svg");
    let margin = { top: 20, right: 30, bottom: 40, left: 0 };
    let height = 10,
      MARGIN = 10,
      MAXBALLOON_SIZE = 30,
      ROW_GAP = 100,
      ypos = 100;

    let containerW = parseInt((window.getComputedStyle(svgTarget).width).replace("px", "")),
      containerH = parseInt((window.getComputedStyle(svgTarget).height).replace("px", ""));

    svg.attr("class", "svg");
    svg.attr("width", containerW)
      .attr("height", containerH);
    
    
    /*
    var x = d3.scaleLinear()
      .domain([start.getTime(), stop.getTime()])
      .range([10, (containerW - margin.left - margin.right)])
      .interpolate(d3.interpolateRound)
    */
    console.log(start, stop)
    

    var x = d3.scaleTime()
      .domain([(start),(stop)])
      .range([0, containerW]);

    var xAxis = d3.axisBottom(x)
      .ticks(d3.timeMonths((start),(stop)).range)
      .tickSize(12, 0)
      .tickFormat(d3.timeFormat("%B"));

    var bubbleGroup = svg.append("g")
      .attr("class", "x axis")
      .style("font-family", "mainfont")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(xAxis);

    bubbleGroup.selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)
      .attr("y", 6);




    svg.selectAll(".bubbles").remove()
    var bubble, maxval, textbubble;

    dataSets.forEach((data, setnum) => {
      //each set will have its own scale!
      maxval = Math.max.apply(null, data.map(d => { console.log(); return d["ups"] }));

      //draw the horizontal axis for each data set
      svg.append("line")
        .attr("class", "horiz-line")
        .attr("x1", 0)
        .attr("y1", (ypos + ROW_GAP * setnum))
        .attr("x2", containerW)
        .attr("y2", (ypos + ROW_GAP * setnum));

      //add a label for the subreddit
      svg.append("foreignObject")
        .attr("y", (ypos + ROW_GAP * setnum)-45)
        .attr("x", 8)
        .attr("text-anchor", "left")
        .html((d,i) => {
          return ("<span class='subreddit-label'>/"+subreddits[setnum]+":</span>");
        });

      let onRollOver = function (d, i) {
        let t = d3.select(this.parentNode)
        t.selectAll("g > .textbubble").attr("class", "textbubble show");
        t.selectAll("g > .bubble").attr("class", "bubble-highlight");
        console.log(t);
      }

      let onRollOff = function (d, i) {
        let t = d3.select(this.parentNode)
        t.select("g > .textbubble").attr("class", "textbubble hide");
        t.selectAll("g > .bubble-highlight").attr("class", "bubble");
      }

      bubble = svg.selectAll(".bubbles")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(" + x(d["date"]) + "," + (ypos + ROW_GAP * setnum) + ")"; });

      bubble.append("circle")
        .attr("class", "bubble")
        .attr("r", (d) => { return (d["ups"] / maxval) * MAXBALLOON_SIZE })
        .on("mouseover", onRollOver)
        .on("mouseout", onRollOff);

      let t = bubble.append("text")
        .attr("class", "textbubble hide")//.attr("class", "textbubble hide")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dx", 20)
        .attr("text-anchor", "left")
        .text((d) => {
          let date = new Date(d["date"]);
          let bubbleObj = (months[date.getMonth()]) + "-" + (date.getDate() + 1) + " " + d["title"];
          /*
          let bubbleObj = "<table class='bubcontainer'>";
          bubbleObj+= "<tr><td class='bubdate'>"+ (months[date.getMonth()]) + "-" + (date.getDate() + 1) + "</td> <td class='bubpoints'>"; 
          bubbleObj+= Math.round(d["score"]/1000)+"k points</td></tr>";
          bubbleObj+="<tr class='bubtext'><td colspan='2'>" + d["title"] + "</td></tr>";
          bubbleObj+= "</table>";
          */
          //let bubbleObj = " this is a <tspan>test</tspan> system";

          return bubbleObj;
        });


    });
  }






});