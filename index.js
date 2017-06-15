
document.addEventListener("DOMContentLoaded", function(event) { 
  console.log("loaded!")
  
  //var form = document.querySelector("form");
  //console.log(form);

  document.getElementById("submitbutton").onclick = function(event){ 
    event.preventDefault();
    var subred = document.getElementById("subreddit").value;
    console.log('did stuff #1', subred); 

    var today = new Date();
    var yago = new Date(today.setMonth(today.getMonth()-12));
    yago.setDate(1);
    

    console.log(today.getTime(), yago.getTime())

    fetch('https://www.reddit.com/r/news/top/.json?count=20&timestamp:1418515200..1418601600').then(function(response) {
      return response.json();
    }).then(function(dat) {
      console.log(dat.data.children);
    });

  }

});
