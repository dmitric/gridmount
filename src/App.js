import React, { Component } from 'react';
import './App.css';
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      displayColorPickers: true,
      backgroundColor: "#f5f5f5",
      lineColor: "#333333",
      bottomGradientColor:  "#002B5F",
      topGradientColor: "#f5f5f5",
      padding: 50,
      dimensionOfMinLength: 40,
      triangleCount: 16,
      strokeWidth: 1,
      running: false,
    }
  }

  componentWillMount () {
    this.updateDimensions()
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    //const dim = Math.min(width, height)
    const settings = { width: width, height: height }

    if (width < 500) {
      settings.height = width
      settings.padding = 0
    } else {
      settings.padding = 50
    }

    this.setState(settings)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)
    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.incrementRays())
      .on("swipeup", ev => this.decrementRays())
      .on("swipeleft", ev => this.incrementRayLength())
      .on("swiperight", ev => this.decrementRayLength())
      .on("pinchin", ev => { this.incrementRayLength(); this.incrementRays();} )
      .on("pinchout", ev => { this.decrementRayLength(); this.decrementRays();})
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 40 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementDimensionOfMinLength()
    } else if (ev.which === 38 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementDimensionOfMinLength()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementTriangleCount()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementTriangleCount()
    }
  }

  incrementStrokeWidth () {
    this.setState({strokeWidth: Math.min(5, this.state.strokeWidth + 1)})
  }

  decrementStrokeWidth () {
    this.setState({strokeWidth: Math.max(1, this.state.strokeWidth - 1)})
  }

  incrementTriangleCount () {
    this.setState({triangleCount: Math.min(100, this.state.triangleCount + 2) })
  }

  decrementTriangleCount () {
    this.setState({triangleCount: Math.max(1, this.state.triangleCount  -  2) })
  }

  incrementDimensionOfMinLength () {
    this.setState({dimensionOfMinLength: Math.min(100, this.state.dimensionOfMinLength  + 2 ) })
  }

  decrementDimensionOfMinLength () {
    this.setState({dimensionOfMinLength: Math.max(2, this.state.dimensionOfMinLength - 2) })
  }

  incrementRays () {
    this.setState({degreeSpacing: Math.max(5, this.state.degreeSpacing - 5)})
  }

  decrementRays () {
    this.setState({degreeSpacing: Math.min(70, this.state.degreeSpacing + 5)})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `gridmount.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  gcd (a, b) {
    if (a === 0) {
      return b
    }

    return this.gcd(b%a, a)
  }

  commonDivisors (a, b) {
    const n = this.gcd(a, b)
    const results = []

    for (let i=1; i <= Math.sqrt(n); i++) {
      if (n%i === 0) {
        results.push(i)
        if (n/i !== i) {
          results.push(n/i)
        }
      }
    }

    return results.sort((a, b) => {
      return a - b
    })
  }

  generateGrid () {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    const lines = []

    const dim = Math.min(actualHeight, actualWidth)/this.state.dimensionOfMinLength
    
    for (let i = dim; i < actualWidth; i+= dim) {
      lines.push(<line key={`x${i}`} x1={i} x2={i} y1={0} y2={actualHeight} stroke={this.state.lineColor} strokeWidth={this.state.strokeWidth}/>)
    }

    for (let j = dim; j < actualHeight; j+= dim) {
      lines.push(<line key={`y${j}`} x1={0} x2={actualWidth} y1={j} y2={j} stroke={this.state.lineColor} strokeWidth={this.state.strokeWidth}/>)
    }

    return lines  
  }

  generateAngledGrid () {
    const lines = []

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    const dim = Math.min(actualHeight, actualWidth)/this.state.dimensionOfMinLength

    const maxDiff = Math.min(actualHeight, actualWidth) * 2 * (actualWidth > actualHeight ? actualWidth/actualHeight : actualHeight/actualWidth)
    
    let iter = 0;

    for (let i = 0; i <= maxDiff; i += dim) {
      lines.push(
        <line key={`up-${iter}`} id={`up-${iter}`}
              x1={0} y1={i}
              x2={actualWidth} y2={i - actualWidth*Math.tan(Math.PI/4)}
              stroke={this.state.lineColor} strokeWidth={this.state.strokeWidth} />
      )
      iter ++
    }

    iter = 0;

    for (let i = actualHeight; i >= -maxDiff; i -= dim) {
      lines.push(
        <line key={`down-${iter}`} id={`down-${iter}`}
              x1={0} y1={i}
              x2={actualWidth} y2={i + actualWidth*Math.tan(Math.PI/4)}
              stroke={this.state.lineColor} strokeWidth={this.state.strokeWidth} />
      )
      iter ++
    }

    return lines
  }

  generateTriangles () {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    
    const dim = Math.min(actualHeight, actualWidth)/this.state.dimensionOfMinLength

    const wDim = Math.floor(actualWidth/dim)
    const hDim = Math.floor(actualHeight/dim)
    
    const triangles = []

    for (let i=0; i < this.state.triangleCount; i++) {
      const x = this.between(0, wDim) * dim
      const y = this.between(0, hDim + 1) * dim

      const l = this.between(Math.max(1, Math.max(wDim, hDim)/15), Math.max(2, Math.max(wDim, hDim)/4)) * dim

      triangles.push(
        <polygon
          key={`s${i}`}
          fill="url(#gradient)"
          points={`${x+l},${y} ${x},${y-l} ${x-l},${y}`} />)
    }

    return triangles
  }

  render() {

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    return (
      <div className="App">
       { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.lineColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({lineColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.topGradientColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({topGradientColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.bottomGradientColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({bottomGradientColor: color.hex}) } />
            </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={ actualWidth } height={ actualHeight }>

            <defs>
              <linearGradient gradientUnits="objectBoundingBox" id="gradient"
              x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={this.state.topGradientColor} stopOpacity={0} />
                <stop offset="100%" stopColor={this.state.bottomGradientColor} stopOpacity={0.9} />
              </linearGradient>
            </defs>
            
            <rect width={"100%"} height={"100%"} fill={this.state.backgroundColor} /> 

            <g className='canvas'>           
              <g className='grid'>
                {this.generateAngledGrid()}
              </g>
              <g className='triangle'>
                {this.generateTriangles()}
              </g>
            </g>

          </svg>
        </div>
      </div>
    );
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App;
