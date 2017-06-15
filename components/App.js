import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TitleLine from '../components/TitleLine'
import BubbleLine from '../components/BubbleLine'

export default class App extends Component {

  componentDidMount(){
    console.log("main is mounted!!");
  }

  render() {

    let moviedata = [["3/12/2000","RAISING THE MAMMOTH",10109,0.89,"RAISING THE MAMMOTH brought in 10.1M P2+ viewers"],
                     ["4/16/2000","WALKING WITH DINOSAURS",11360,1,"WALKING WITH DINOSAURS brought in 11.4M P2+ viewers"],
                     ["3/11/2001","LAND OF THE MAMMOTH",5094,0.45,"LAND OF THE MAMMOTH brought in 5.1M P2+ viewers"],
                     ["7/15/2001","WHEN DINOSAURS ROAMED AMERICA",5030,0.44,"WHEN DINOSAURS ROAMED AMERICA brought in 5M P2+ viewers"],
                     ["1/27/2002","BLUE PLANET",2739,0.24,"BLUE PLANET brought in 2.7M P2+ viewers"],
                     ["8/17/2003","NEFERTITI RESURRECTED",5489,0.48,"NEFERTITI RESURRECTED brought in 5.5M P2+ viewers"]];

    let tvdata = [["3/12/2000","Call of the Wildman",10109,0.79,"RAISING THE MAMMOTH brought in 10.1M P2+ viewers"],
                     ["3/16/2000","Gator Boys",11360,0.95,"WALKING WITH DINOSAURS brought in 11.4M P2+ viewers"],
                     ["5/11/2001","River Monsters",5094,0.35,"LAND OF THE MAMMOTH brought in 5.1M P2+ viewers"],
                     ["7/15/2001","Deadliest Catch",5030,0.44,"WHEN DINOSAURS ROAMED AMERICA brought in 5M P2+ viewers"],
                     ["7/27/2002","My Big Fat Fab Life",2739,0.44,"BLUE PLANET brought in 2.7M P2+ viewers"],
                     ["9/17/2003","Kate Plus 8",5489,0.38,"NEFERTITI RESURRECTED brought in 5.5M P2+ viewers"]];

    return (
      <div>
        <TitleLine />
        <BubbleLine renderData={moviedata} />
        <BubbleLine renderData={tvdata} />
        </div>
      )
    }
  }

  App.propTypes = {
  }
