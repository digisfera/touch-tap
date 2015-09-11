'use strict';

var TouchTap = require('../');

var tapper = document.getElementById('tapper');
var tapMessages = document.getElementById('tapMessages');

new TouchTap(tapper, click);

function click() {
  tapMessages.innerHTML += '<br>Tapped!</br>';
}
