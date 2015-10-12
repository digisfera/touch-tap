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
