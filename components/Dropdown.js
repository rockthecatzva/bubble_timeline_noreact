import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class Dropdown extends Component {

  componentDidMount(){
    console.log("Buttons mounted!!", this.props.uxTag, this.props.renderData[0]);
    this.props.uxCallback(this.props.uxTag, this.props.renderData[0])
  }


  render() {
    const { renderData, uxCallback, uxTag} = this.props

    function onSelectItem(e){
      console.log("it worked!!!", e.target.options[e.target.selectedIndex].value);
      let i = e.target.options[e.target.selectedIndex].value;

      uxCallback(uxTag, renderData[i]);
    }

    return (
      <div>
        <select onChange={onSelectItem} >
          {renderData.map((v,i)=>{
            return(<option value={i}>{v["label"]}</option>)
            })}
        </select>


        </div>
      )
    }
  }

  Dropdown.propTypes = {
    renderData: PropTypes.array.isRequired,
    uxCallback: PropTypes.func.isRequired,
    uxTag: PropTypes.string.isRequired
  }
