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

Yome.drawYome = (state) =>
  <g transform={ 'rotate(' + (Yome.sliceDeg(state) / 2) + ',0,0)' }>
    { Yome.drawWalls(Yome.state) }
    { state.sides.map((_, i) => Yome.sideSlice(state, i)) }
  </g>

Yome.svgWorld = (children) =>
  <svg height="500" width="500" viewBox="-250 -250 500 500" preserveAspectRatio="xMidYMid meet">
    {children}
  </svg>



Yome.playArea = (children) =>
  ReactDOM.render(Yome.svgWorld(children), document.getElementById("playarea"))

Yome.clearPlayArea = () =>
  ReactDOM.unmountComponentAtNode(document.getElementById("playarea"))

// Yome.playArea(Yome.drawYome(Yome.exampleData))

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



Yome.eventHandler = (f) =>
  (e => {
    e.preventDefault()
    f(e.target.value)
    Yome.render()
  })

Yome.changeSideCount = (new_count) => {
  let nArray = Array.apply(null, Array(parseInt(new_count)))
  Yome.state.sides = nArray.map((_,i) => Yome.state.sides[i] || {})
}

Yome.sideOptions = () =>
  ['HexaYome', 'SeptaYome', 'OctaYome'].map(
    (label, v) => <option value={v + 6}>{ label }</option>)

Yome.sideCountInput = state =>
  <div className='top-control'>
    <span> Size of Yome </span>
    <select onChange={ Yome.eventHandler(Yome.changeSideCount) }
            value={ Yome.sideCount(state) }>
      { Yome.sideOptions() }
    </select>
  </div>

// ReactDOM.render(Yome.sideCountInput(Yome.state), document.getElementById('playarea'))


Yome.worldPosition = point => ( {x: point.x + 250, y: point.y + 250} )

Yome.addRemoveWindow = (i) =>
  () => {
    const side = Yome.state.sides[i]
    side.face = side.face ? null : 'window'
  }

Yome.windowControl = (state, side, i) => {
  let theta = Yome.sliceTheta(state) * (i + 1),
      pos = Yome.worldPosition(Yome.radialPoint(200, theta)),
      add = ! side.face
  return <div className='control-holder' style={ {top: pos.y, left: pos.x} }>
      <a className={'window-control-offset ' + (add ? 'add' : 'remove')}
        onClick={ Yome.eventHandler(Yome.addRemoveWindow(i)) }
        href='#'>
        { add ? '+ window' : '- window' }
      </a>
    </div>
}

Yome.windowControls = (state) =>
  state.sides.map((side, i) => Yome.windowControl(state, side, i))


Yome.addRemoveCornerFeature = (side, type) =>
  () => side.corner = (side.corner ? null : type)

Yome.cornerControlClassName = (side, type) =>
  side.corner === type ? 'remove' : (side.corner ? 'hidden' : 'add')

Yome.cornerControlLink = (side, type) =>
  <a className={ Yome.cornerControlClassName(side, type) }
      onClick={ Yome.eventHandler(Yome.addRemoveCornerFeature(side, type)) }
      href='#'>
    { (side.corner ? '- ' : '+ ') + type }
  </a>

Yome.cornerControlLinks = (side) =>
  ['stove-vent', 'zip-door', 'door-frame'].map(
    type => Yome.cornerControlLink(side, type)
  )

Yome.cornerControl = (state, side, i) => {
  let theta = Yome.sliceTheta(state) * (i + 0.5),
      pos = Yome.worldPosition(Yome.radialPoint(220, theta))
  return <div className='control-holder' style={ {top: pos.y, left: pos.x} }>
      <div className='corner-control-offset'>
        { Yome.cornerControlLinks(side) }
      </div>
    </div>
}

Yome.cornerControls = (state) =>
  state.sides.map((side, i) => Yome.cornerControl(state, side, i))



Yome.widget = (state) =>
  <div className='yome-widget'>
    { Yome.sideCountInput(Yome.state) }
    <div className='yome-widget-body'>
      { Yome.windowControls(state) }
      { Yome.cornerControls(state) }
      { Yome.svgWorld(Yome.drawYome(state)) }
    </div>
  </div>

Yome.render = () =>
  ReactDOM.render(Yome.widget(Yome.state), document.getElementById('app'))

Yome.render()
