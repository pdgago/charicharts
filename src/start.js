/* jshint ignore:start */
!function(context) {
  // 'use strict';
  var Charicharts = {version: "0.0.0"};
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
      });
    };
  }

/* jshint ignore:end */