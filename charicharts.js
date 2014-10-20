/* jshint ignore:start */
!function(context) {
  'use strict';
  var Charicharts = {version: "0.0.0"};
/* jshint ignore:end */
/**
 * Creates a events module for the supplied context.
 * 
 * @param {Context} context
 */
Charicharts.Events = function(context) {
  // Check for 'c_' cache for unit testing
  var cache = context.c_ || {};

  /**
   * Publish some data on a named topic.
   * 
   * @param  {String} topic The channel to publish on
   * @param  {Array}  args  The data to publish. Each array item is converted
   *                        into an ordered arguments on the subscribed functions. 
   */
  var trigger = function(topic, args) {
    var subs = cache[topic];
    var len = subs ? subs.length : 0;

    //can change loop or reverse array if the order matters
    while (len--) {
      subs[len].apply(context, args || []);
    }
  };

  /**
   * Register a callback on a named topic.
   * 
   * @param  {String}   topic    The channel to subscribe to
   * @param  {Function} callback The handler event. Anytime something is publish'ed on a 
   *                             subscribed channel, the callback will be called with the
   *                             published array as ordered arguments.
   */
  var on = function(topic, callback) {
    cache[topic] || (cache[topic] = []);
    cache[topic].push(callback);
    return [topic, callback]; // Array
  };

  /**
   * Disconnect a subscribed function for a topic.
   *  
   * @param  {Array}    handle   The return value from a subscribe call.
   * @param  {Function} callback [description]
   */
  var unbind = function(handle, callback) {
    var subs = cache[callback ? handle : handle[0]];
    var len = subs ? subs.length : 0;

    callback = callback || handle[1];

    while (len--) {
      if (subs[len] === callback) {
        subs.splice(len, 1);
      }
    }
  };

  return {
    trigger: trigger,
    on: on,
    unbind: unbind
  };
};
/**
 * Get translate attribute from supplied width/height.
 * 
 * @param  {Integer} width
 * @param  {Integer} height
 */
function h_getTransform(width, height) {
  return 'translate(' + width + ',' + height + ')';
}

/**
 * Parse charichart options.
 * 
 * @param  {Object} opts Options to parse
 * @return {Object}      Parsed options
 */
function h_parseOptions(opts) {
  opts.margin = _.object(['top', 'right', 'bottom', 'left'],
    opts.margin.split(',').map(Number));

  opts.width = opts.target.offsetWidth - opts.margin.left - opts.margin.right;
  opts.height = opts.target.offsetHeight - opts.margin.top - opts.margin.bottom;

  return opts;
}
Charicharts.pie = function pie(options) {
  this._options = h_parseOptions(_.extend(options, this.constructor.defaults));
  _.extend(this, Charicharts.Events(this));
  this.init();
  return this;
};

/**
 * Generate a pie by setting all it parts.
 */
Charicharts.pie.prototype.init = function() {
  var opts = this._options;

  var width = opts.width + opts.margin.left + opts.margin.right;
  var height = opts.height + opts.margin.top + opts.margin.bottom;
  var radius = Math.min(opts.width, opts.height) / 2;

  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('class', 'g-main')
      .attr('transform', h_getTransform(width/2, height/2));

  svg.append('svg:circle')
    .attr('class', 'outer-circle')
    .attr('fill', 'transparent')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius);

  var pieLayout = d3.layout.pie()
    .value(function(d) {return d.value || 100 / opts.data.length;});

  var arc = d3.svg.arc()
    .innerRadius((radius * 0.90) - (opts.width * opts.innerRadius))
    .outerRadius(radius * 0.90);

  svg.selectAll('path')
      .data(pieLayout(opts.data))
      .enter()
    .append('path')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', arc);
};

/**
 * Defaults pie options as static object.
 * @type {Object}
 */
Charicharts.pie.defaults = {
  innerRadius: 0.22,
  margin: '0,0,0,0'
};
/* jshint ignore:start */
  if (typeof define === "function" && define.amd) define(Charicharts);
  else if (typeof module === "object" && module.exports) module.exports = Charicharts;
  this.Charicharts = Charicharts;
}.call(window);
/* jshint ignore:end */
