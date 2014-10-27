/* jshint ignore:start */
!function(context) {
  'use strict';
  var Charicharts = {version: "0.0.0"};
/* jshint ignore:end */
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

function h_getCentroid(selection) {
  // get the DOM element from a D3 selection
  // you could also use "this" inside .each()
  var element = selection.node(),
      // use the native SVG interface to get the bounding box
      bbox = element.getBBox();
  var centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
  // return the center of the bounding box
  return centroid;
}

function h_getAngle(x, y) {
  var angle, referenceAngle;
  if (x === 0 || y === 0) {return;}
  referenceAngle = Math.atan(y/x);
  referenceAngle += (referenceAngle < 0) ? Math.PI/2 : 0;

  if (x >= 0 && y >= 0) {
    angle = referenceAngle;
  } else if (x <= 0 && y >= 0) {
     angle = referenceAngle + (Math.PI/2);
  } else if (x <= 0 && y <= 0) {
    angle = referenceAngle + Math.PI;
  } else if (x >= 0 && y <= 0) {
    angle = referenceAngle + 3*(Math.PI/2);
  } else {
    return;
  }

  return angle;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  };
}

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
Charicharts.Chart = function chart(options) {
  // todo => use a deep extend to do this
  this._options = h_parseOptions(_.extend({}, Charicharts.Chart.defaults, options));
  this._options.series = _.extend({}, Charicharts.Chart.defaults.series, options.series);
  this._options.xaxis = _.extend({}, Charicharts.Chart.defaults.xaxis, options.xaxis);
  this._options.yaxis = _.extend({}, Charicharts.Chart.defaults.yaxis, options.yaxis);
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  this.load = generateInjector(this.$scope);
  this.init();
  return _.pick(this.$scope, 'on', 'toggleSerie');
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.Chart.prototype.init = function() {
  var opts = this._options;
  var xaxis, yaxis;

  // Draw svg
  // Main chart wrapper under the given target.
  var svgTranslate = h_getTranslate(opts.margin.left, opts.margin.top);
  this.$scope.svg = this.load(p_svg).draw(svgTranslate);

  // Scales
  // X scale and axis (optional)
  if (opts.xaxis.enabled) {
    this.$scope.xscale = this.load(p_scale).getXScale();
    this.$scope.xaxis = this.load(p_axes_getX).drawAxis();
  }

  // Y scale and axis (optional)
  if (opts.yaxis.enabled) {
    this.$scope.yscale = this.load(p_scale).getYScale();
    this.$scope.yaxis = this.load(p_axes_getY).drawAxis();
  }

  // Draw series.
  // Series supported:
  //   line - simple line with interpolation
  //   bar - simple bar
  //   stacked-bar - desglosed bars (with more than one value for every x point)
  _.each(opts.data, _.bind(function(serie) {
    if (serie.type === 'line') {
      this.load(p_line).drawLine(serie);
    } else if (serie.type === 'bar') {
      this.load(p_bar).drawBar(serie);
    } else if (serie.type === 'stacked-bar') {
      this.load(p_stacked_bar).drawBar(serie);
    }
  }, this));

  // Draw trail (optional)
  // Add a trail line to the chart and trigger a 'moveTrail'
  // event when the user moves the trail.
  // 
  // Requirements:
  //   - xscale
  if (opts.trail && opts.xaxis.enabled) {
    this.load(p_trail);
  }

  // Remove unused stuff (d3 add this automatically)
  this.$scope.svg.selectAll('.domain').remove();

  this.$scope.toggleSerie = _.bind(function(id) {
    var el = this.$scope.svg.select('#serie' + id);
    if (el.empty()) {return;}
    var active = Number(el.attr('active')) ? 0 : 1;
    el.attr('active', active);

    el.transition()
      .duration(200)
      .style('opacity', el.attr('active'));
  }, this);
};

/**
 * Defaults Chart options.
 */
Charicharts.Chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  series: {
    barWidth: 6,
    align: 'left'
  },
  xaxis: {
    scale: 'time',
    fit: false,
    orient: 'bottom',
    enabled: true,
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
    enabled: true,
    orient: 'left',
    textAnchor: 'end',
    textPaddingLeft: 0,
    textMarginTop: 0,
    tickFormat: function(d, i) {
      if (!i) {return;}
      return d;
    }
  }
};
/**
 * Pie events:
 *   mouseover - mouseover over the paths
 */
Charicharts.Pie = function pie(options) {
  // Set options
  this._options = h_parseOptions(_.extend({}, Charicharts.Pie.defaults, options));
  this._options.series = _.extend({}, Charicharts.Pie.defaults.innerArrow, options.innerArrow);
  // Set $scope
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  // Generate loader for the scope
  this.load = generateInjector(this.$scope);
  // Initialize the Pie
  this.init();
  // Return handy stuff to the instance
  return _.pick(this.$scope, 'on');
};

/**
 * Generate a pie by setting all it parts.
 */
Charicharts.Pie.prototype.init = function() {
  // Shortcuts
  var $$ = this.$scope;
  var opts = this._options;

  // Pie size
  $$.radius = Math.min(opts.fullWidth, opts.fullHeight) / 2;

  // Draw SVG
  $$.svg = this.load(p_svg)
    .draw(h_getTranslate(opts.fullWidth/2, opts.fullHeight/2));

  if (opts.outerBorder) {
    $$.svg.append('svg:circle')
      .attr('class', 'outer-border')
      .attr('fill', 'transparent')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', $$.radius);
  }

  // Pie layout
  $$.pieLayout = d3.layout.pie()
    .sort(null)
    .value(function(d) {return d.value;});

  // Pie arc
  var innerPadding = opts.outerBorder ? (1 - opts.outerBorder) : 1;
  var arcRadius = $$.radius * innerPadding;

  $$.arc = d3.svg.arc()
    .innerRadius(arcRadius - (arcRadius * (1 - opts.innerRadius)))
    .outerRadius(arcRadius); 

  // Draw pie
  $$.pieces = $$.svg.selectAll('path')
      .data($$.pieLayout(opts.data))
      .enter()
    .append('path')
    .attr('class', 'pie-piece')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', $$.arc);

  // Mouse over event
  $$.pieces.on('mouseover', function(d) {
    // Fade all paths
    $$.pieces
      .style('opacity', opts.fadeOpacity);
    // Highlight hovered
    d3.select(this).style('opacity', 1);
    // Triger over event
    $$.trigger('mouseover', [d]);
  });
  
  // Mouse leave event
  $$.svg.on('mouseleave', function(d) {
    $$.pieces
      .style('opacity', 1);
  });

  if (opts.innerArrow) {
    this.setInnerArrow();
  }
};

Charicharts.Pie.prototype.setInnerArrow = function() {
  var opts = this._options;
  var $$ = this.$scope;
  var self = this;

  var radius = $$.radius * (1 - opts.outerBorder);
  var arrowSize = (radius * opts.innerArrowSize * (1 - opts.innerRadius));
  var diameter = radius * (opts.innerRadius) * 2;

  if (diameter < arrowSize) {
    arrowSize = diameter * 0.5;
  }

  // Define arrow
  $$.svg.append('svg:marker')
      .attr('id', 'innerArrow')
      .attr('viewBox', '0 {0} {1} {2}'.format(
        -(arrowSize/2), arrowSize, arrowSize))
      .attr('refX', (radius * (1-opts.innerRadius)) + 5)
      .attr('refY', 0)
      .attr('fill', 'white')
      .attr('markerWidth', arrowSize)
      .attr('markerHeight', arrowSize)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,{0}L{1},0L0,{2}'.format(
        -(arrowSize/2), arrowSize, arrowSize/2));

  // Draw arrow
  $$.innerArrow = $$.svg.append('line')
    .attr('class', 'outer-border')
    .style('stroke', 'transparent')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('marker-end', 'url(#innerArrow)');

  // Set mouse move Event
  $$.pieces.on('mousemove', function() {
    var mouse = d3.mouse(this);
    var angle = h_getAngle(mouse[0], mouse[1]);
    moveArrow(angle);
  });

  function moveArrow(angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var x = radius * cos;
    var y = radius * sin;
    if (!x || !y) {return;}

    $$.innerArrow
      .attr('x2', x)
      .attr('y2', y);
  }

  function triggerSelect(selection) {
    selection.each(function(d) {
      $$.trigger('mouseover', [d]);
    });
    var centroid = h_getCentroid(selection);
    moveArrow(h_getAngle.apply(this, centroid));
  }

  setTimeout(function() {
    triggerSelect(d3.select($$.pieces[0][0]));
  }, 0);
};

/**
 * Defaults pie options as static object.
 * @type {Object}
 */
Charicharts.Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 0.2,
  innerArrow: false,
  innerArrowSize: 0.6
};
/**
 * Get xaxis.
 * 
 * @return {d3.svg.axis}
 */
var p_axes_getX = ['xscale', 'xaxis', 'svg', 'height',
  function(xscale, xaxis, svg, height) {
    var axis = d3.svg.axis()
      .scale(xscale)
      .orient(xaxis.orient)
      .tickFormat(xaxis.tickFormat);

    axis.drawAxis = function() {
      var translateY = xaxis.orient === 'bottom' ? height : 0;

      svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform',h_getTranslate(0, translateY))
        .call(axis)
        .selectAll('text')
          .style('text-anchor', 'middle');

      return axis;
    };

    return axis;
}];

/**
 * Get yaxis.
 * 
 * @return {d3.svg.axis}
 */
var p_axes_getY = ['yscale', 'yaxis', 'width', 'svg', 'margin',
  function(yscale, yaxis, width, svg, margin) {
    var axis = d3.svg.axis()
      .scale(yscale)
      .orient(yaxis.orient)
      .tickSize(-width)
      .tickFormat(yaxis.tickFormat);

    axis.drawAxis = function() {
      svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', h_getTranslate(0, 0))
        .call(axis)
        .selectAll('text')
          .attr('x', yaxis.paddingLeft)
          .attr('y', yaxis.textMarginTop)
          .style('text-anchor', yaxis.textAnchor);

      svg.select('.yaxis')
        .selectAll('line')
          .attr('x1', yaxis.paddingLeft)
          .attr('x2', width + (margin.right || 0));
    };

    return axis;
}];
/**
 * Get d3 path generator Function for bars.
 */
var p_bar = ['svg', 'xscale', 'yscale', 'height', 'series',
  function(svg, xscale, yscale, height, series) {
    /**
     * Draw a bar for the given serie.
     */
    function drawBar(serie) {
      svg.append('g')
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
        .attr('class', 'bar')
        .selectAll('rect')
        .data(serie.values)
      .enter().append('rect')
        .attr('x', function(d) {return xscale(d.datetime) - series.barWidth/2;})
        .attr('y', function(d) {return yscale(d.value);})
        .attr('width', series.barWidth)
        .attr('fill', function() {return serie.color;})
        .attr('height', function(d) {return height - yscale(d.value);});
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
var p_line = ['svg', 'xscale', 'yscale',
  function(svg, xscale, yscale) {
    var line = d3.svg.line()
      .x(function(d) {
        return xscale(d.datetime);
      })
      .y(function(d) {
        return yscale(d.value);
      });

    /**
     * Draw a line for the given serie
     */
    function drawLine(serie) {
      svg.append('path')
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
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
var p_scale = ['data', 'xaxis', 'yaxis', 'width', 'height',
  function(data, xaxis, yaxis, width, height) {

    var d3Scales = {
      'time': d3.time.scale,
      'ordinal': d3.scale.ordinal,
      'linear': d3.scale.linear
    };

    var valuesArr = _.flatten(_.map(data,
      function(d) {
        return d.values;
      }));

    /**
     * Returns time domain from data.
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
        return Number(d.value);
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
      var domain = getDomain(xaxis.scale, xaxis.fit);

      return d3Scales[xaxis.scale]()
        .domain(domain)
        .range([0, width]);
    }

    function getYScale() {
      var domain = getDomain(yaxis.scale, yaxis.fit);

      return d3Scales[yaxis.scale]()
        .domain(domain)
        .range([height, 0]);
    }

    return {
      getXScale: getXScale,
      getYScale: getYScale
    };
}];
/**
 * Get d3 path generator Function for bars.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_stacked_bar = ['svg', 'yscale', 'xscale', 'trigger', 'series', 'width',
  function(svg, yscale, xscale, trigger, series, width) {
    /**
     * Draw a bar for the given serie.
     */
    function drawBar(serie) {
      var y0 = 0;

      serie.values.forEach(function(value) {
        value.forEach(function(d) {
          d.y0 = y0;
          d.y1 = y0 += Math.max(0, d.value); // negatives to zero
        });
      });

      var stackedBar = svg.selectAll('stacked-bar')
          .data(serie.values)
        .enter().append('g')
          .attr('transform', function(d) {
            var x;
            if (!xscale) {
              x = (series.align === 'right') ? (width-series.barWidth) : 0;
            } else {
              xscale[d.datetime || d.value];
            }
            return h_getTranslate(x, 0);
          });

      stackedBar.selectAll('rect')
          .data(function(d) {return d;})
        .enter().append('rect')
          .attr('width', series.barWidth)
          .attr('y', function(d) {return yscale(d.y1);})
          .attr('height', function(d) {return yscale(d.y0) - yscale(d.y1);})
          .style('fill', function(d) {return d.color;})
          .on('mouseover', function(d) {
            trigger('mouseoverStackbar', [d]);
          });
    }

    return {
      drawBar: drawBar
    };
}];
/**
 * SVG module.
 */
var p_svg = ['fullWidth', 'fullHeight', 'target',
  function(fullWidth, fullHeight, target) {

  /**
   * Draw svg and apply the supplied translate.
   * 
   * @param  {String} translate
   * @return {Svg}    svg
   */
  function draw(translate) {
    return d3.select(target)
      .append('svg')
        .attr('width', fullWidth)
        .attr('height', fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', translate);
  }

  return {
    draw: draw
  };
  
}];
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


    // quickfix: add to event loop so its call event is set.
    setTimeout(function() {
      slider
        .call(brush.extent([new Date(), new Date()]))
        .call(brush.event);
    }, 0);

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
