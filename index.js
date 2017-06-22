let d3 = require('d3');

document.addEventListener("DOMContentLoaded", function (event) {
  let articleCount = 20;
  let selectedYear = 2017;
  this.getElementById("articleCountIndicator").innerHTML = articleCount;
  let start, stop;
  let subreddits = ["news", "politics", "worldnews", "television", "politics"];
  //let subreddits = ["news"];
  let rawdata = [];

  document.getElementById("submitbutton").onclick = function (event) {
    event.preventDefault();
    let monthdates, url, months, baseurl, timelineData, endurl;
    baseurl = "https://www.reddit.com/r/";
    endurl = "/search.json?sort=top&limit=" + articleCount + "&q=timestamp%3A" + (Math.trunc(start.getTime() / 1000)) + ".." + (Math.trunc(stop.getTime() / 1000)) + "&restrict_sr=on&syntax=cloudsearch";

    let p = Promise.all(subreddits.map(sub => {
      url = baseurl + sub + endurl;
      return fetch(url).then(response => response.json().then(dat => { return dat.data.children.map(art => { return { "url": art.data["url"], "score": art.data["score"], "ups": art.data["ups"], "date": art.data["created_utc"], "downs": art.data["downs"], "title": art.data["title"], "comments": art.data["num_comments"] } }) }))
    })).then(val => {
      console.log("ALL LOADED!!!", document.getElementById("svg-header").width);
      document.getElementById("svg-main").innerHTML = "";

      drawTimelines(val[0], document.getElementById("svg-main"), [start, stop]);
      drawScaleLines(document.getElementById("svg-header"), [start, stop])
    })
  }


  let updateYearSelected = function (yr) {
    selectedYear = parseInt(yr);
    let ys = document.getElementsByClassName("yearselect");//.classList.add("greyout");
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
    console.log(start, stop);
  }


  let yearButtonClick = (e) => {
    e.preventDefault();
    updateYearSelected(e.target.value);
  }

  let articleCountButtonClick = (e) => {
    e.preventDefault();
    console.log("number of articles changed");

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
          width = d3.select(svgTarget).node().getBoundingClientRect().width;
          console.log(width);
      svg.attr("width", width);

      var x = d3.scaleTime()
        .domain([new Date(dates[0]), new Date(dates[1])])
        .range([0, width]);

      var xAxis = d3.axisBottom(x)
          .ticks(d3.timeMonths(new Date(dates[0]), new Date(dates[1])).range)
          .tickSize(16, 0)
          .tickFormat(d3.timeFormat("%B"));

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,0)")
        .call(xAxis)
      .selectAll(".tick text")
        .style("text-anchor", "start")
        .attr("x", 6)
        .attr("y", 6);
      /*
        let xlabels = []
        let monthDiff = function(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }

        for (var index = 0; index < monthDiff(new Date(dates[0]), new Date(dates[1])); index++) {
          xlabels.push(startYear + index);
        }
    
        var xAxis = d3.axisBottom(x);
        xAxis.ticks(10);
        xAxis.tickFormat(function (d, i) {
          if (i % 4 == 0) return xlabels[i];
          return "";
        })
        // Add the x-axis.
        svg.selectAll(".xaxis").remove()
        svg.append("g")
          .attr("class", "xaxis")
          .attr("transform", "translate(0," + (height - MARGIN) + ")")
          .call(xAxis);

          */
    
          
  }

  let drawTimelines = function (data, svgTarget, dates) {
    console.log("drawing the timelines");
    //Sort data by ups - largest to smallest - so when drawing the smaller ones will appear on top

    let formatDate = d3.timeFormat("%d-%b-%y");
    let svg = d3.select(svgTarget).append("svg");
    let maxval = Math.max.apply(null, data.map(d=>{return d["ups"]}));
    //console.log(maxval);

    
    
    let margin = { top: 20, right: 30, bottom: 40, left: 0 };
    let height = 100,
      MARGIN = 10,
      MAXBALLOON_SIZE = 30;

    let containerW = parseInt((window.getComputedStyle(svgTarget).width).replace("px", "")),
      containerH = parseInt((window.getComputedStyle(svgTarget).height).replace("px", ""));

    svg.attr("width", containerW)
      .attr("height", containerH);


    var x = d3.scaleLinear()
      .domain([start.getTime()/1000, stop.getTime()/1000])
      .range([10, (containerW - margin.left - margin.right)])
      .interpolate(d3.interpolateRound)

    svg.selectAll(".bubbles").remove()
    var bubble = svg.selectAll(".bubbles")
      .data(data)
      .enter().append("g")
      .attr("transform", function (d, i) {return "translate(" + x(new Date(d["date"])) + ",100)"; });
    
    bubble.append("circle")
      .attr("class", "bub")
      .attr("r", (d) => {return (d["ups"]/maxval) * MAXBALLOON_SIZE });

    bubble.append("text")
      .attr("y", -40)
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text((d) => {
        let date = new Date(d["date"]*1000);
        return ((date.getMonth()+1) +"/"+ (date.getDate()+1));
        });

  
  }
});