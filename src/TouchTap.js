'use strict';

var GhostClickBuster = require('./GhostClickBuster');

// Detect a tap using touch events.
// This can be used to prevent the 300ms delay of the click handler on iOS.

// If touch events move more than this number of pixels, the tap is not triggered.
var threshold = 12;

function TouchTap(element, listener, useCapture) {
  this._listener = listener;

  this._touchStarted = false;
  this._startX = null;
  this._startY = null;

  this._ghostClickBuster = new GhostClickBuster();

  this._destructors = [];
  this._destructors.push(createListener(element, 'touchstart', this.handleTouchStart.bind(this), useCapture));
  this._destructors.push(createListener(element, 'touchmove', this.handleTouchMove.bind(this), useCapture));
  this._destructors.push(createListener(element, 'touchend', this.handleTouchEnd.bind(this), useCapture));
  this._destructors.push(createListener(element, 'click', this.dispatchTap.bind(this), useCapture));
}

TouchTap.prototype.destroy = function() {
  while(this._destructors.length > 0) {
    var listenerDestructor = this._destructors.pop();
    listenerDestructor();
  }
};

TouchTap.prototype.handleTouchStart = function(evt) {
  this._touchStarted = true;
  // Store position of touchstart
  this._startX = evt.touches[0].clientX;
  this._startY = evt.touches[0].clientY;
};

TouchTap.prototype.handleTouchMove = function(evt) {
  if(!this._touchStarted) { return; }

  // Abort if touch has moved more than the threshold
  var movedX = evt.touches[0].clientX - this._startX;
  var movedY = evt.touches[0].clientY - this._startY;

  var totalMoved = Math.sqrt(movedX*movedX + movedY*movedY);

  if(totalMoved > threshold) {
    this._clear();
  }
};

TouchTap.prototype._clear = function() {
  this._touchStarted = false;
  this._startX = null;
  this._startY = null;
};

TouchTap.prototype.handleTouchEnd = function(evt) {
  if(!this._touchStarted) { return; }

  // Prevent ghost click
  if (event.type === 'touchend') {
    this._ghostClickBuster.register(this._startX, this._startY);
  }

  // Tap
  this.dispatchTap(evt);

  // Clear touch tracking
  this._clear();
};

TouchTap.prototype.dispatchTap = function(evt) {
  this._listener.call(this.element, evt);
};


function createListener(element, type, listener, useCapture) {
  element.addEventListener(type, listener, useCapture);

  var removeListener = function() {
    element.removeEventListener(type, listener, useCapture);
  };

  return removeListener;
}

module.exports = TouchTap;
