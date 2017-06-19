
document.addEventListener("DOMContentLoaded", function(event) {
  var articleCount=20;
  var selectedYear=2017;
  this.getElementById("articleCountIndicator").innerHTML = articleCount;
  var start, stop;
  var subreddits = ["news", "politics", "worldnews", "television", "The_Donald", "politics"];
  //var subreddits = ["news"];
  var rawdata = [];

  document.getElementById("submitbutton").onclick = function(event){ 
    event.preventDefault();
    var monthdates, url, months, baseurl, timelineData, endurl;
    baseurl = "https://www.reddit.com/r/";
    endurl = "/search.json?sort=top&limit="+articleCount+"&q=timestamp%3A"+(Math.trunc(start.getTime()/1000)) +".."+(Math.trunc(stop.getTime()/1000))+"&restrict_sr=on&syntax=cloudsearch";

    var p= Promise.all(subreddits.map((sub)=>{
        url = baseurl + sub + endurl;
        console.log(url);
        return fetch(url).then(response => response.json().then(dat=>{return dat.data.children}))
    })).then((val) => {
      console.log("ALL LOADED!!!", val);
        return (val).map((v)=>{console.log(v)});
        
        })
    

  

    /*
    var p = new Promise((resolve,reject)=>{
      fetch(url).then(response => resolve(response.json()))

    }).then(val => {
        rawdata = (val.data.children).map((v)=>{return {"url": v.data["url"], "score": v.data["score"], "ups": v.data["ups"], "date": v.data["created_utc"], "downs": v.data["downs"], "title": v.data["title"], "comments": v.data["num_comments"]}});
        //console.log("ALL LOADED!!!", rawdata);
        }); */   
  }


  var updateYearSelected = function(yr){
    selectedYear=parseInt(yr);
    var ys = document.getElementsByClassName("yearselect");//.classList.add("greyout");
    ys = Array.prototype.slice.call(ys);
    ys.forEach(function(element) {
      if(element.value!=selectedYear) {
        element.classList.add("greyout");
      }
      else{
        element.classList.remove("greyout");
      }
    }, this);

    start = new Date(selectedYear, 0, 1);
    stop = new Date(selectedYear, 12, 0);
    if(stop>(new Date())){ stop=new Date()};
    console.log(start, stop);  
  }


  var yearButtonClick=(e)=>{
    e.preventDefault();
    updateYearSelected(e.target.value);
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


  updateYearSelected(selectedYear);
  });
