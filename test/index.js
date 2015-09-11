'use strict';

var TouchTap = require('../');

var tapper = document.getElementById('tapper');
var destroyer = document.getElementById('destroyer');
var tapMessages = document.getElementById('tapMessages');

var tap = new TouchTap(tapper, click);
new TouchTap(destroyer, function() {
  tap.destroy();
});

function click() {
  tapMessages.innerHTML += '<br>Tapped!</br>';
}
