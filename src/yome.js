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

Yome.exampleData = ((state)=>{
  state.sides[0].face = 'window'
  state.sides[0].corner = 'zip-door'
  state.sides[3].face = 'window'
  state.sides[5].corner = 'door-frame'
  state.sides[5].face = 'window'
  state.sides[7].corner = 'stove-vent'
  return state
})(Yome.initialState())


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

Yome.windowPoints = (st) => {
  const theta = Yome.sliceTheta(st),
        indent = theta / 6;
  return [Yome.radialPoint(160, indent),
          Yome.radialPoint(160, theta - indent),
          Yome.radialPoint(100, theta / 2)];
}

Yome.doorPoints = (st) => {
  const indent = Yome.sliceTheta(st) / 8;
  return [Yome.radialPoint(165, indent ),
          Yome.radialPoint(165, -indent),
          Yome.radialPoint(90,  -indent),
          Yome.radialPoint(90, indent)];
}

Yome.pointsToPointsString = (points) =>
  points.map(p => p.x + ',' + p.y).join(' ')

// l(Yome.pointsToPointsString(Yome.sidePoints(Yome.state)))



Yome.drawWalls = (state) =>
  <polygon points={Yome.pointsToPointsString(Yome.sidePoints(state))}></polygon>

Yome.drawWindow = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.windowPoints(st)) }></polygon>

Yome.drawDoor = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.doorPoints(st)) }></polygon>

Yome.drawLine = (line) =>
  <line x1={line.start.x} y1={line.start.y}
        x2={line.end.x} y2={line.end.y}>
  </line>

Yome.drawZipDoor = (st) => {
  const theta   = Yome.sliceTheta(st),
        indent  = 0.15 * (theta / 6),
        lines   = [0,1,2,3,4,5,6,7,8].map((x) => {
          const dist = 170 - (10 * x);
          return {start: Yome.radialPoint(dist, -indent),
                  end:   Yome.radialPoint(dist, indent)}});
  lines.push({start: Yome.radialPoint(180, 0),
              end: Yome.radialPoint(90, 0)});
  return <g>{lines.map(Yome.drawLine)}</g>;
}

Yome.drawStoveVent = (st) => {
  const theta = Yome.sliceTheta(st),
        point = Yome.radialPoint(155, 0);
  return <ellipse cx={point.x} cy={point.y} rx="14" ry="8"
                  key="stove-vent"></ellipse>
}

Yome.itemRenderDispatch = {
  window: Yome.drawWindow,
  'door-frame': Yome.drawDoor,
  'zip-door': Yome.drawZipDoor,
  'stove-vent': Yome.drawStoveVent
}

Yome.itemRender = (type, state) =>
  (Yome.itemRenderDispatch[type] || (x => null))(state)

Yome.sliceDeg = (state) => 360 / Yome.sideCount(state)

Yome.sideSlice = (state, i) => {
  const side = state.sides[i]
  if (side.corner || side.face) {
    return <g transform={ 'rotate(' + (Yome.sliceDeg(state) * i) + ',0,0)' }>
      {Yome.itemRender(side.corner, state)}
      {Yome.itemRender(side.face, state)}
    </g>
  }
}

Yome.svgWorld = (children) =>
  <svg height="500" width="500" viewBox="-250 -250 500 500" preserveAspectRatio="xMidYMid meet">
    {children}
  </svg>

Yome.playArea = (children) =>
  ReactDOM.render(Yome.svgWorld(children), document.getElementById("playarea"))

Yome.clearPlayArea = () =>
  ReactDOM.unmountComponentAtNode(document.getElementById("playarea"))

// Yome.playArea(<g>
//     {Yome.drawStoveVent(Yome.state)}
//     {Yome.drawZipDoor(Yome.state)}
//     {Yome.drawDoor(Yome.state)}
//     {Yome.drawWindow(Yome.state)}
//     {Yome.drawWalls(Yome.state)}
//   </g>)

// Yome.playArea(Yome.sideSlice(Yome.exampleData, 5))
// Yome.playArea(Yome.sideSlice(Yome.exampleData, 0))

// Yome.clearPlayArea()
