let d3 = require('d3');

document.addEventListener("DOMContentLoaded", function (event) {
  let articleCount = 10;
  let selectedYear = 2017;
  this.getElementById("articleCountIndicator").innerHTML = articleCount;
  let start, stop;
  let subreddits = ["news", "politics", "worldnews", "television", "science"];

  document.getElementById("submitbutton").onclick = function (event) {
    event.preventDefault();
    let monthdates, url, months, baseurl, timelineData, endurl;
    baseurl = "https://www.reddit.com/r/";
    endurl = "/search.json?sort=top&limit=" + articleCount + "&q=timestamp%3A" + (Math.trunc(start.getTime() / 1000)) + ".." + (Math.trunc(stop.getTime() / 1000)) + "&restrict_sr=on&syntax=cloudsearch";

    let p = Promise.all(subreddits.map(sub => {
      url = baseurl + sub + endurl;
      return fetch(url).then(response => response.json().then(dat => {
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
  let drawTimelines = function (svgTarget, dates, dataSets) {

    let formatDate = d3.timeFormat("%d-%b-%y");
    let svg = d3.select(svgTarget).append("svg");
    let margin = { top: 20, right: 30, bottom: 40, left: 100 };
    let height = 10,
      MAXBALLOON_SIZE = 30,
      ROW_GAP = 100,
      ypos = 40;

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
    var bubble, maxval, textbubble;

    dataSets.forEach((data, setnum) => {
      //each set will have its own scale!
      maxval = Math.max.apply(null, data.map(d => { return d["ups"] }));

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
        .attr("r", (d) => { return (d["ups"] / maxval) * MAXBALLOON_SIZE })
        .on("mouseover", function(d) {
					var xPosition = d3.select(this.parentNode);
					var yPosition = d3.select(this);
          console.log("making tool tip", xPosition, yPosition);
					d3.select("#tooltip")
						.style("left", "0px")
						.style("top", "0px")
						.select("#value")
						.text(()=>{
              return Math.round(d.score/1000)+"k";});
					d3.select("#tooltip").classed("hidden", false);
			   })
			   .on("mouseout", function() {
					d3.select("#tooltip").classed("hidden", true);
			   });
    });
  }






});