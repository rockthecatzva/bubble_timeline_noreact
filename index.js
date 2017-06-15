
document.addEventListener("DOMContentLoaded", function(event) { 

  document.getElementById("submitbutton").onclick = function(event){ 
    event.preventDefault();
    var subred = document.getElementById("subreddit").value;
    var today = new Date();
    var yago = new Date(new Date(today).setMonth(today.getMonth()-12));
    yago.setDate(1);

    //iterate through all start/stop times
    var start, stop, monthdates;
    stop = new Date(today);
    start = new Date(today.setDate(1));
    monthdates = [];
    months = 11

    while(months>=0){
      monthdates.push([start.getTime(), stop.getTime()]);
      start = new Date(new Date(start).setMonth(start.getMonth()-1));
      stop = new Date(new Date(new Date(start).setMonth(start.getMonth()+1)).setDate(0));
      months--;
    }

    //for each month - make an API call
    var baseurl = "https://www.reddit.com/r/news/top/.json?count=20&timestamp:";
 
    Promise.all(monthdates.map((dateset)=>{
        url = baseurl + dateset[0]+".."+dateset[1]
        return fetch(url).then(response => response.json())
    })).then(val => {
        console.log("ALL LOADED!!!", val);
    })


    //calc monthy avgs and other decriptive stats

    //extract timeline data - one array of data that includes: 
    //num_comments, score,  title, url, ups, downs
    

    

  }

});
