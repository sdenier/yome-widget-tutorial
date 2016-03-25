'use strict'

var Reloader = Reloader || {}

Reloader.reloadFile = (path) => {
  var x = document.createElement('script')
  x.setAttribute('src', path + '?rel=' + (new Date().getTime()))
  document.body.appendChild(x)
  setTimeout(() => document.body.removeChild(x), 1000)
}

Reloader.startReloading = (files) => {
  setTimeout(() => {
    console.log('--- reloading ---')
    files.map(Reloader.reloadFile)
  }, 3000)
}

Reloader.startReloading(['build/yome.js'])

function l(x) {
  console.log(x)
  return x
}



var Yome = Yome || {}

Yome.initialState = () => {
  return {
    sides: [1,2,3,4,5,6,7,8].map(() => new Object())
  }
}

Yome.state = Yome.state || Yome.initialState()



Yome.sideCount = (state) => state.sides.length

Yome.sliceTheta = (state) => 2 * Math.PI / Yome.sideCount(state)

Yome.rotate = (theta, point) => {
  const sint = Math.sin(theta), cost = Math.cos(theta)
  return {
    x: (point.x * cost) - (point.y * sint),
    y: (point.x * sint) + (point.y * cost)
  }
}

Yome.radialPoint = (radius, theta) => Yome.rotate(theta, {x: 0, y: radius})

var YOME_SIDE_SIZE = 180

Yome.sidePoints = (state) =>
  state.sides.map((_, i) => Yome.radialPoint(YOME_SIDE_SIZE, i * Yome.sliceTheta(state)))

Yome.pointsToPointsString = (points) =>
  points.map(p => p.x + ',' + p.y).join(' ')

l(Yome.pointsToPointsString(Yome.sidePoints(Yome.state)))



Yome.drawWalls = (state) =>
  <polygon points={Yome.pointsToPointsString(Yome.sidePoints(state))}></polygon>

Yome.svgWorld = (children) =>
  <svg height="500" width="500" viewBox="-250 -250 500 500" preserveAspectRatio="xMidYMid meet">
    {children}
  </svg>

Yome.playArea = (children) =>
  ReactDOM.render(Yome.svgWorld(children), document.getElementById("playarea"))

Yome.clearPlayArea = () =>
  ReactDOM.unmountComponentAtNode(document.getElementById("playarea"))

Yome.playArea(Yome.drawWalls({sides: [1,2,3,4,5,6]}))
// Yome.playArea(Yome.drawWalls({sides: [1,2,3,4,5,6,7]}))
// Yome.playArea(Yome.drawWalls({sides: [1,2,3,4,5,6,7,8]}))

// Yome.clearPlayArea()
