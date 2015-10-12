/**!
 * TouchTap
 * @author  Digisfera
 * @license MIT
 */
 (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TouchTap = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// Time during which clicks will be prevented (in ms)
var timeout = 2500;

// Radius around which clicks will be prevented (in px)
var radius = 25;

function GhostClickBuster() {
  this._clicks = [];

  this._clickListener = this._handleClick.bind(this);
  document.addEventListener('click', this._clickListener, true);
}

GhostClickBuster.prototype.destroy = function() {
  document.removeEventListener('click', this._clickListener, true);
};

GhostClickBuster.prototype.register = function(x, y) {
  this._clicks.push({x: x, y: y});
  var pop = this._clicks.pop.bind(this._clicks);
  setTimeout(pop, timeout);
};

GhostClickBuster.prototype._handleClick = function(evt) {
  var shouldBust = this._clicks.some(function(click) {

    // Ignore the event if it is within radius of a previous one
    var dx = click.x - evt.clientX;
    var dy = click.y - evt.clientY;
    var dist = Math.sqrt(dx*dx + dy*dy);

    return dist < radius;
  });

  if (shouldBust) {
    evt.stopPropagation();
    evt.preventDefault();
  }
};

module.exports = GhostClickBuster;

},{}],2:[function(require,module,exports){
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

},{"./GhostClickBuster":1}]},{},[2])(2)
});