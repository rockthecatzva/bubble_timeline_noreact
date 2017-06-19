
document.addEventListener("DOMContentLoaded", function(event) {
  var articleCount=20;
  var selectedYear=2017;
  this.getElementById("articleCountIndicator").innerHTML = articleCount;
  var start, stop;

  document.getElementById("submitbutton").onclick = function(event){ 
    event.preventDefault();
    //var subred = document.getElementById("subreddit").value;
    //var today = new Date();
    //var yago = new Date(new Date(today).setMonth(today.getMonth()-12));
    //yago.setDate(1);

    var monthdates, url, months, baseurl, rawdata, timelineData;
    //stop = new Date(today);
    //start = new Date(today.setDate(1));
    //monthdates = [];
    //months = 11
    baseurl = "https://www.reddit.com/r/news/search.json?sort=top";
    url = baseurl + "&limit="+articleCount+"&q=timestamp%3A";
    url += (Math.trunc(start.getTime()/1000)) +".."+(Math.trunc(stop.getTime()/1000))+"&restrict_sr=on&syntax=cloudsearch";
    console.log(url)

    var p = new Promise((resolve,reject)=>{
      fetch(url).then(response => resolve(response.json()))

    }).then(val => {
        rawdata = (val.data.children).map((v)=>{return {"url": v.data["url"], "score": v.data["score"], "ups": v.data["ups"], "date": v.data["created_utc"], "downs": v.data["downs"], "title": v.data["title"], "comments": v.data["num_comments"]}});
        console.log("ALL LOADED!!!", rawdata);
        });    
  }

  var yearButtonClick=(e)=>{
    e.preventDefault();
    console.log("button clicked", e.target.value)
    selectedYear=e.target.value;
    start = new Date(selectedYear, 0, 1);
    stop = new Date(selectedYear, 12, 0);
    if(stop>(new Date())){ stop=new Date()};
    console.log(start, stop);

  }

  var articleCountButtonClick=(e)=>{
    e.preventDefault();
    console.log("number of articles changed");
    
    if(e.target.value=="plus"){
      if(articleCount<100){articleCount++;}
    }
    else{
      if(articleCount>0){articleCount--;}
    }
  
    this.getElementById("articleCountIndicator").innerHTML = articleCount;

  }

  var ys = document.getElementsByClassName("yearselect");
  ys = Array.prototype.slice.call(ys);
  ys.map((e)=>{e.onclick=yearButtonClick});

  var ac = document.getElementsByClassName("articleCount");
  ac = Array.prototype.slice.call(ac);
  ac.map((e)=>{e.onclick=articleCountButtonClick});

  });
