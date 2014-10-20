/* jshint ignore:start */
!function(context) {
  'use strict';
  var Charicharts = {version: "0.0.0"};
/* jshint ignore:end */
// Class of the svg first-child gro
var SVG_GROUP_CLASS = 'g-main';
Charicharts.chart = function chart(options) {
  this._options = h_parseOptions(_.extend(options, this.constructor.defaults));
  _.extend(this, Charicharts.Events(this));
  this.init();
  return this;
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.chart.prototype.init = function() {
  var opts = this._options;

  // Draw svg
  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.margin.left, opts.margin.top));

  // Set scales
  var scales = p_scale(_.pick(opts, 'width', 'height', 'xaxis', 'yaxis', 'data'));
  var xscale = scales[0];
  var yscale = scales[1];

  // Draw axes
};

/**
 * Defaults Chart options.
 */
Charicharts.chart.defaults = {
  margin: '0,0,0,0',
  xaxis: {
    scale: 'time',
    fit: false
  },
  yaxis: {
    scale: 'linear',
    fit: false
  }
};
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
function h_getTranslate(width, height) {
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

  opts.fullWidth = opts.target.offsetWidth;
  opts.fullHeight = opts.target.offsetHeight;
  opts.width = opts.fullWidth - opts.margin.left - opts.margin.right;
  opts.height = opts.fullHeight - opts.margin.top - opts.margin.bottom;

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
  var radius = Math.min(opts.fullWidth, opts.fullHeight) / 2;

  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.fullWidth/2, opts.fullHeight/2));

  svg.append('svg:circle')
    .attr('class', 'outer-circle')
    .attr('fill', 'transparent')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius);

  var pieLayout = d3.layout.pie()
    .value(function(d) {return d.value || 100 / opts.data.length;});

  var arc = d3.svg.arc()
    .innerRadius((radius * 0.90) - (opts.fullWidth * opts.innerRadius))
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
/**
 * Set x/y scales from the supplied options.
 * 
 * @param  {Object} opts
 *   width - range width
 *   height - range height
 *   data - series data. used to set the domains
 * @return {Array} Returns [x,y] scales
 */
function p_scale(opts) {

  var d3Scales = {
    'time': d3.time.scale,
    'linear': d3.scale.linear
  };

  /**
   * Returns time domain from opts.data.
   */
  function getTimeDomain() {
    return d3.extent(opts.data, function(d) {
      return d.datetime;
    });
  }
  
  /**
   * Returns linear domain from 0 to max data value.
   */
  function getLinearAllDomain() {
    return [0, d3.max(opts.data, function(d) {
      return d.value;
    })];
  }

  /**
   * Returns linear domain from min/max data values.
   */
  function getLinearFitDomain() {
    return d3.extent(opts.data, function(d) {
      return d.value;
    });
  }

  /**
   * Get the domain for the supplied scale type.
   * 
   * @param  {String}  scale
   * @param  {Boolean} fit    Fit domain to min/max values
   * @return {Object}  domain D3 domain
   */
  function getDomain(scale, fit) {
    if (scale === 'time') {
      return getTimeDomain();
    }

    if (fit) {
      return getLinearFitDomain();
    } else {
      return getLinearAllDomain();
    }
  }

  function getXScale() {
    var domain = getDomain(opts.xaxis.scale, opts.xaxis.fit);

    return d3Scales[opts.xaxis.scale]()
      .domain(domain)
      .range([0, opts.width]);
  }

  function getYScale() {
    var domain = getDomain(opts.yaxis.scale, opts.yaxis.fit);

    return d3Scales[opts.yaxis.scale]()
      .domain(domain)
      .range([opts.height, 0]);
  }

  return [getXScale(), getYScale()];
}
/* jshint ignore:start */
  if (typeof define === "function" && define.amd) define(Charicharts);
  else if (typeof module === "object" && module.exports) module.exports = Charicharts;
  this.Charicharts = Charicharts;
}.call(window);
/* jshint ignore:end */
