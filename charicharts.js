/* jshint ignore:start */
!function(context) {
  'use strict';
  var Charicharts = {version: "0.0.0"};
/* jshint ignore:end */
// Class of the svg first-child gro
var SVG_GROUP_CLASS = 'g-main';
Charicharts.chart = function chart(options) {
  this._options = h_parseOptions(_.extend({}, this.constructor.defaults, options));
  _.extend(this, Charicharts.Events(this));
  this.init();
  return this;
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.chart.prototype.init = function() {
  var opts = this._options;
  var inject = generateInjector(this);

  // Draw svg
  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.margin.left, opts.margin.top));

  this.svg = svg;

  // Set scales
  var scales = p_scale(_.pick(opts, 'width', 'height', 'xaxis', 'yaxis', 'data'));
  var xscale = scales[0];
  var yscale = scales[1];

  this.scales = scales;
  this.xscale = xscale;
  this.yscale = yscale;
  this.width = this._options.width;
  this.height = this._options.height;

  // Set axes
  var xaxis, yaxis;
  if (opts.xaxis.display) {
    xaxis = p_axes_getX(xscale,
      _.pick(opts.xaxis, 'orient', 'tickFormat'));
  }

  if (opts.yaxis.display) {
    yaxis = p_axes_getY(yscale,
      _.extend(_.pick(opts.yaxis, 'orient', 'tickFormat'), {width: opts.width}));
  }

  // Draw axis
  if (xaxis) {
    svg.append('g')
      .attr('class', 'xaxis')
      .attr('transform', h_getTranslate(0, opts.height))
      .call(xaxis)
      .selectAll('text')
        .style('text-anchor', 'middle');
  }

  if (yaxis) {
    svg.append('g')
      .attr('class', 'yaxis')
      .attr('transform', h_getTranslate(0, 0))
      .call(yaxis)
      .selectAll('text')
        .attr('x', 0)
        .style('text-anchor', 'start');
  }

  _.each(opts.data, function(serie) {
    if (serie.type === 'line') {
      inject(p_line).drawLine(serie);
    } else if (serie.type === 'bar') {
      inject(p_bar).drawBar(serie);
    }
  });

  if (opts.trail) {
    inject(p_trail);
  }

  svg.selectAll('.domain').remove();
};

/**
 * Defaults Chart options.
 */
Charicharts.chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  xaxis: {
    scale: 'time',
    fit: false,
    orient: 'bottom',
    display: true,
    tickFormat: function(d) {
      if (d instanceof Date) {
        return d.getHours();
      }
      return d;
    }    
  },
  yaxis: {
    scale: 'linear',
    fit: false,
    display: true,
    orient: 'left',
    tickFormat: function(d) {
      return d;
    }
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
/**
 * Generate a injector to the given context.
 *
 * When calling a function using inject(), that function
 * will be able to ask for context variables.
 *
 * Injectors are specially build for the charichart parts, because they
 * need access to many variables. This makes the code cleaner and more
 * testeable.
 *
 * @param  {Ojbect} ctx Context
 */
var generateInjector = function(ctx) {
  return function inject(args) {
    var func = args[args.length-1];
    args = args.slice(0, args.length-1).map(function(a) {
      return ctx[a];
    });
    return func.apply(ctx, args);
  };
};
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
 * Get xaxis
 * 
 * @param  {Object} xscale D3 scale
 * @param  {Object} opts   Axis options
 *   orient - axis ticks orientation
 *   tickFormat - Function
 *   width - svg width
 * @return {d3.svg.axis}
 */
function p_axes_getX(xscale, opts) {
  return d3.svg.axis()
    .scale(xscale)
    .orient(opts.orient)
    .tickFormat(opts.tickFormat);
}

/**
 * Get xaxis
 * 
 * @param  {Object} xscale D3 scale
 * @param  {Object} opts   Axis options
 *   orient - axis ticks orientation
 *   tickFormat - Function
 *   width - svg width
 * @return {d3.svg.axis}
 */
function p_axes_getY(yscale, opts) {
  return d3.svg.axis()
    .scale(yscale)
    .orient(opts.orient)
    .tickSize(-opts.width)
    .tickFormat(opts.tickFormat);
}
/**
 * Get d3 path generator Function for bars.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_bar = ['scales', 'svg', 'height', function(scales, svg, height) {

  /**
   * Draw a bar for the given serie.
   */
  function drawBar(serie) {
    svg.append('g')
      .attr('class', 'bar')
      .selectAll('rect')
      .data(serie.values)
    .enter().append('rect')
      .attr('x', function(d) {return scales[0](d.datetime);})
      .attr('y', function(d) {return scales[1](d.value);})
      .attr('width', 10)
      .attr('fill', function() {return serie.color;})
      .attr('height', function(d) {return height - scales[1](d.value);});
  }

  return {
    drawBar: drawBar
  };
}];
/**
 * Get d3 path generator Function for lines.
 * 
 * The returned function will take our data and generate the
 * necessary SVG path commands.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_line = ['scales', 'svg', function p_line(scales, svg) {
    var line = d3.svg.line()
      .x(function(d) {
        return scales[0](d.datetime);
      })
      .y(function(d) {
        return scales[1](d.value);
      });

    /**
     * Draw a line for the given serie
     */
    function drawLine(serie) {
      svg.append('path')
        .attr('id', serie.id)
        .attr('class', 'line')
        .attr('transform', 'translate(0, 0)')
        .attr('stroke', serie.color)
        .attr('d', line.interpolate(serie.interpolation)(serie.values));
    }

    return {
      drawLine: drawLine
    };
}];
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
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  };

  var valuesArr = _.flatten(_.map(opts.data,
    function(d) {
      return d.values;
    }));

  /**
   * Returns time domain from opts.data.
   */
  function getTimeDomain() {
    return d3.extent(valuesArr, function(d) {
      return d.datetime;
    });
  }
  
  /**
   * Returns linear domain from 0 to max data value.
   */
  function getLinearAllDomain() {
    return [0, d3.max(valuesArr, function(d) {
      return d.value;
    })];
  }

  /**
   * Returns linear domain from min/max data values.
   */
  function getLinearFitDomain() {
    return d3.extent(valuesArr, function(d) {
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
/**
 * Add an trail to the supplied svg and trigger events
 * when the user moves it.
 */
var p_trail = ['svg', 'trigger', 'height', 'width', 'xscale',
  function(svg, trigger, height, width, xscale) {

    var currentDate;

    var trail = svg.append('g')
      .attr('class', 'trail');

    var trailLine = trail.append('svg:line')
      .attr('class', 'trail-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', height);

    var brush = d3.svg.brush()
      .x(xscale)
      .extent([0, 0]);

    var slider = svg.append('g')
      .attr('transform', h_getTranslate(0,0))
      .attr('class', 'trail-slider')
      .call(brush);

    slider.select('.background')
      .attr('height', height)
      .attr('width', width)
      .style('cursor', 'pointer');

    svg.selectAll('.extent,.resize').remove();

    brush.on('brush', onBrush);

    /**
     * Triggered when the user mouseover or clicks on
     * the slider brush.
     */
    function onBrush() {
      var xdomain = xscale.domain();
      var date;

      if (d3.event.sourceEvent) {
        date = xscale.invert(d3.mouse(this)[0]);
      } else {
        date = brush.extent()[0];
      }

      if (Date.parse(date) > Date.parse(xdomain[1])) {
        date = xdomain[1];
      }

      if (Date.parse(date) < Date.parse(xdomain[0])) {
        date = xdomain[0];
      }

      if ((date.getMinutes()) >= -30) {
        date.setHours(date.getHours());
      }

      date.setMinutes(0, 0);

      if (Date.parse(currentDate) === Date.parse(date)) {
        return;
      }

      currentDate = date;
      var xtrail = Math.round(xscale(date)) - 1;

      moveTrail(xtrail);
      trigger('moveTrail', [date]);
    }

    /**
     * Move the trail to the given x position.
     * 
     * @param  {integer} x
     */
    function moveTrail(x) {
      trailLine
        .attr('x1', x)
        .attr('x2', x);
    }
}];
/* jshint ignore:start */
  if (typeof define === "function" && define.amd) define(Charicharts);
  else if (typeof module === "object" && module.exports) module.exports = Charicharts;
  this.Charicharts = Charicharts;
}.call(window);
/* jshint ignore:end */
