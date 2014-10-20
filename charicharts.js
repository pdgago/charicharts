!function(window) {
  'use strict';
  var charicharts = {version: '3.4.13'};
charicharts.pie = function() {
};
  if (typeof define === 'function' && define.amd) define(charicharts);
  else if (typeof module === 'object' && module.exports) module.exports = charicharts;
  this.charicharts = charicharts;
}(window);
