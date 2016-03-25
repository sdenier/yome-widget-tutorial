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
