import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
var d3 = require('d3')

export default class Histogram extends Component {
  constructor(props){
    super(props)
    this.updateData = this.updateData.bind(this)
  }

  updateData(data, highlight) {
    const {uxCallback} = this.props

    let el = ReactDOM.findDOMNode(this),
        containerW = parseInt((window.getComputedStyle(el).width).replace("px", "")),
        containerH = parseInt((window.getComputedStyle(el).height).replace("px", ""));

    var svg = d3.select(el).select("svg")
      .attr("width", containerW)
      .attr("height", containerH);

    let margin = {top: 20, right: 30, bottom: 40, left: 0};

    var formatCount = d3.format(",.0f");

    var x = d3.scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .range([10, (containerW-margin.left-margin.right)])
      .interpolate(d3.interpolateRound)

    var bins = d3.histogram()
      .domain([x.domain()[0], x.domain()[1]])
      .thresholds(x.ticks(6))
      (data)

    var y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) { return d.length; })])
      .range([(containerH-margin.top-margin.bottom), 15]);

    svg.selectAll(".bar").remove()
    var bar = svg.selectAll(".bar")
      .data(bins)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })

    var callUx = function(tag, data){
          uxCallback(tag, data)
        }

    bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", function(d) { return (containerH-margin.top-margin.bottom) - y(d.length); })
      .attr("class", (d, i)=>{
        //console.log("Histo highlight? ", highlight, d.x0, d.x1, i, (i==bins.length-1 ? (d.x1)+1:d.x1));
        if(highlight){
          if(d.filter((v)=>{return v==highlight}).length){
            return "highlight";
          }
        }
        return "normal";
        })
      .on("click", (d, i)=>{callUx("histogram-click", {"range": [d.x0, (i==bins.length-1 ? (d.x1)+1:d.x1)]})});

    bar.append("text")
      .attr("y", "-0.25em")
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { if(d.length) {return formatCount(d.length)}; });

      svg.selectAll(".axis").remove()
      svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (containerH-margin.top-margin.bottom) + ")")
        .call(d3.axisBottom(x));
    }

    componentWillReceiveProps(nextprop) {
    if((nextprop.renderData)||(nextprop.highLightValue)){
      this.updateData(nextprop.renderData, nextprop.highLightValue)
    }
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

Histogram.propTypes = {
  renderData: PropTypes.array.isRequired,
  highLightValue: PropTypes.number.isRequired,
  uxCallback: PropTypes.func.isRequired
}
