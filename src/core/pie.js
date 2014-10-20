Charicharts.pie = function(options) {
  'use strict';
  this._options = _.extend(options, this.constructor.defaults);
  return this;
};

Charicharts.pie.defaults = {
  innerRadius: 22
};