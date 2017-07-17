import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
var d3 = require('d3')

export default class BubbleLine extends Component {
  constructor(props){
    super(props)
    this.updateData = this.updateData.bind(this)
    this.state = {svg: ''};
  }

  updateData(data) {
    let margin = {top: 20, right: 30, bottom: 40, left: 0};
    let height = 100,
        MARGIN = 10,
        startYear = 2007,
        stopYear = 2017,
        MAXBALLOON_SIZE = 40;
    
    let el = ReactDOM.findDOMNode(this),
        containerW = parseInt((window.getComputedStyle(el).width).replace("px", "")),
        containerH = parseInt((window.getComputedStyle(el).height).replace("px", ""));

    var svg = d3.select(el).select("svg")
      .attr("width", containerW)
      .attr("height", containerH);
    

    var x = d3.scaleLinear()
      .domain([startYear, stopYear])
      .range([10, (containerW-margin.left-margin.right)])
      .interpolate(d3.interpolateRound)
    
    let xlabels = []
    for (var index = 0; index < (stopYear-startYear); index++) {
        xlabels.push(startYear+index);
        
    }

    var xAxis = d3.axisBottom(x);
    xAxis.ticks(10);
    xAxis.tickFormat(function (d, i) {
        if(i%4==0) return xlabels[i];
        return "";
      })
      // Add the x-axis.
    svg.selectAll(".xaxis").remove()
    svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + (height - MARGIN) + ")")
      .call(xAxis);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<strong>Frequency:</strong> <span style='color:red'>" + d.value + "</span>";
        })

    svg.call(tip);
    
    svg.selectAll(".bubbles").remove()
    var bubble = svg.selectAll(".bubbles")
      .data(data)
      .enter().append("g")
      .attr("transform", function(d,i) { return "translate("+Math.floor((new Date(data[i][0]) - new Date(data[0][0]))/(1000*60*60*24))+",100)"; })
      bubble.append("circle")
        .attr("class", "bub")
        .attr("fill", "steelblue")
        .attr("r", (d)=>{return d[3]*MAXBALLOON_SIZE})
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);


  }


  componentDidMount() {
    var el = ReactDOM.findDOMNode(this);
    var formatDate = d3.timeFormat("%d-%b-%y");
    var svg = d3.select(el).append("svg");

    if(this.props.renderData){
      this.updateData(this.props.renderData)
    }
  }


  render() {
    const {renderData} = this.props

    return (
      <div className="fullw fullh">
      </div>
    )
  }
}

BubbleLine.propTypes = {
  renderData: React.PropTypes.array.isRequired
}
