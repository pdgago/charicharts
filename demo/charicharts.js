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
  return 'translate(' + [width, height] + ')';
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
 * Generate a injector for the given context.
 *
 * When calling a module function using the returned function,
 * that module will be able to ask for context properties.
 *
 * Injectors are specially build for the charichart parts, because they
 * need access to so many variables. This makes the code cleaner and more
 * testeable.
 *
 * @param  {Ojbect} ctx Context
 */
var generateInjector = function(ctx) {
  return function(args) {
    var func = args[args.length-1];
    args = args.slice(0, args.length-1).map(function(a) {
      return ctx[a];
    });
    return func.apply(ctx, args);
  };
};
var p_axes = ['svg', 'xscale','yscale', 'opts', function(svg, xscale, yscale, opts) {

  function setAxis(orient) {
    var params = {
      'bottom': {
        axis: 'xaxis',
        translate: h_getTranslate(0, opts.height),
        textAnchor: 'middle',
      },
      'top': {
        axis: 'xaxis',
        translate: h_getTranslate(0, 0),
        textAnchor: 'middle'
      },
      'left': {
        axis: 'yaxis',
        translate: h_getTranslate(0, 0),
        textAnchor: 'start'
      },
      'right': {
        axis: 'yaxis',
        translate: h_getTranslate(opts.width + opts.margin.right, 0),
        textAnchor: 'end'
      }
    };

    var p = params[orient];

    // Set axis
    var axis =  d3.svg.axis()
      .scale(p.axis === 'xaxis' ? xscale : yscale)
      .orient(orient)
      .tickFormat(opts[p.axis][orient].tickFormat);

    if (opts[p.axis].ticks) {
      axis.ticks.apply(this, opts[p.axis].ticks);
    }

    // Draw axis
    var axisG = svg.append('g')
      .attr('class', p.axis + ' ' + orient)
      .attr('transform', p.translate)
      .call(axis);

    // Axis ticks texts
    var axisGTexts = axisG.selectAll('text');
    axisGTexts.style('text-anchor', p.textAnchor);

    if (p.axis === 'yaxis') {
      axisGTexts
        .attr('x', orient === 'left' ? -opts.margin.left : 0)
        .attr('y', opts.yaxis.textMarginTop);
      svg.select('.yaxis .domain').remove();
    }

    // Axis ticks texts
    if (opts[p.axis][orient].label) {
      setLabel(axisG, opts[p.axis][orient].label, orient);
    }
  }

  function setLabel(axisG, label, orient) {
    // 'top' Not supported right now
    if (orient === 'top') {return;}
    var params = {
      'bottom': {
        x: 0 - opts.margin.left,
        y: opts.margin.bottom -7,
        textAnchor: 'start'
      },
      'left': {
        x: -opts.margin.left,
        y: opts.yaxis.textMarginTop - 20,
        textAnchor: 'start'
      },
      'right': {
        x: 0,
        y: opts.yaxis.textMarginTop - 20,
        textAnchor: 'end'
      }
    };

    var p = params[orient];

    axisG.append('text')
      .attr('class', 'label')
      .attr('x', p.x)
      .attr('y', p.y)
      .attr('text-anchor', p.textAnchor)
      .text(label);
  }
  
  function setXDomainFullwidth() {
    svg.selectAll('.xaxis .domain')
      .attr('d', 'M{0},0V0H{1}V0'.format(-opts.margin.left, opts.fullWidth));
  }

  function setYGrid() {
    svg.select('.yaxis')
      .selectAll('line')
        .attr('x1', opts.yaxis.fullGrid ? -opts.margin.left : 0)
        .attr('x2', opts.yaxis.fullGrid ? opts.width + opts.margin.right : opts.width)
        // add zeroline class
        .each(function(d) {
          if (d !== 0) {return;}
          d3.select(this).attr('class', 'zeroline');
        });
  }

  // render first yaxis so the xaxis domain os on top
  opts.yaxis.left.enabled && setAxis('left');
  opts.yaxis.right.enabled && setAxis('right');
  opts.xaxis.top.enabled && setAxis('top');
  opts.xaxis.bottom.enabled && setAxis('bottom');

  if (opts.yaxis.left.enabled || opts.yaxis.right.enabled) {
    setYGrid();
  }

  if (opts.xaxis.top.enabled || opts.xaxis.bottom.enabled) {
    setXDomainFullwidth();
  }
}];
/**
 * Creates a events module for the supplied context.
 */
var p_events = [function() {

  var events = {};

  // Check for 'c_' cache for unit testing
  var cache = events.c_ || {};

  /**
   * Publish some data on a named topic.
   * 
   * @param  {String} topic The channel to publish on
   * @param  {Array}  args  The data to publish. Each array item is converted
   *                        into an ordered arguments on the subscribed functions. 
   */
  events.trigger = function trigger(topic, args) {
    var subs = cache[topic];
    var len = subs ? subs.length : 0;

    //can change loop or reverse array if the order matters
    while (len--) {
      subs[len].apply(events, args || []);
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
  events.on = function on(topic, callback) {
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
  events.unbind = function unbind(handle, callback) {
    var subs = cache[callback ? handle : handle[0]];
    var len = subs ? subs.length : 0;

    callback = callback || handle[1];

    while (len--) {
      if (subs[len] === callback) {
        subs.splice(len, 1);
      }
    }
  };

  return events;
}];
/**
 * Set X/Y scales.
 */
var p_scale = ['data', 'opts', function(data, opts) {

  var d3Scales = {
    'time': d3.time.scale.utc,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  };

  // Get flatten values.
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
    var extent = d3.extent(valuesArr, function(d) {
      if (d.scrutinized) {
        return d3.sum(_.pluck(d.scrutinized, 'value'));
      }
      return Number(d.value);
    });

    // Positive scale
    if (extent[0] >= 0) {
      return [0, extent[1]];
    }

    // Negative-Positive scale
    var absX = Math.abs(extent[0]);
    var absY = Math.abs(extent[1]);
    var val = (absX > absY) ? absX : absY;
    return [-val, val];
  }

  /**
   * Returns linear domain from min/max data values.
   */
  function getLinearFitDomain() {
    return d3.extent(valuesArr, function(d) {
      if (d.scrutinized) {
        return d3.sum(_.pluck(d.scrutinized, 'value'));
      }
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
      .range([opts.height, 0])
      .nice(); // Extends the domain so that it starts and ends on nice round values.
  }

  var xscale = getXScale();
  var yscale = getYScale();

  return {
    xscale: xscale,
    yscale: yscale
  };
}];
var p_series = ['data', 'svg', 'xscale', 'yscale', 'opts',
  function(data, svg, xscale, yscale, opts) {

    function addLineSerie(serie) {
      var line = d3.svg.line()
        .x(function(d) {
          return xscale(d.datetime);
        })
        .y(function(d) {
          return yscale(d.value);
        });

      svg.append('path')
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
        .attr('class', 'line')
        .attr('transform', 'translate(0, 0)')
        .attr('stroke', serie.color)
        .attr('d', line.interpolate(serie.interpolation)(serie.values));
    }

    function addBarSerie(serie) {
      svg.append('g')
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
        .attr('class', 'bar')
        .selectAll('rect')
        .data(serie.values)
      .enter().append('rect')
        .attr('class', function(d) {
          return d.value < 0 ? 'bar-negative' : 'bar-positive';
        })
        .attr('x', function(d) {
          // TODO: Linear scale support
          return xscale(d.datetime) - opts.series.barWidth/2;
        })
        .attr('y', function(d) {
          return d.value < 0 ? yscale(0) : yscale(d.value) - 1;
        })
        .attr('width', opts.series.barWidth)
        .attr('height', function(d) {
          return Math.abs(yscale(d.value) - yscale(0));
        })
        .attr('fill', function() {
          return serie.color;
        });
    }

    function addStackedBar(serie) {
    }

    _.each(data, function(serie) {
      if (serie.type === 'line') {
        addLineSerie(serie);
      } else if (serie.type ==='bar') {
        addBarSerie(serie);
      } else if (serie.type === 'stacked-bar') {
        addStackedBar(serie);
      }
    });

  }];
/**
 * Get d3 path generator Function for bars.
 *
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_stacked_bar = ['svg', 'xscale', 'yscale', 'trigger', 'series', 'width', 'height', 'on',
  function(svg, xscale, yscale, trigger, series, width, height, on) {

    /**
     * Draw a bar for the given serie.
     */
    function drawBar(serie) {
      serie.values.forEach(function(v) {
        var y0 = 0;

        v.scrutinized.forEach(function(d) {
          d.y0 = y0;
          d.y1 = y0 += Math.max(0, d.value); // Math.max(0, d.value); // negatives to zero
        });

        v.total = v.scrutinized[v.scrutinized.length - 1].y1;
      });

      var stackedBar = svg.selectAll('stacked-bar')
        .data(serie.values)
        .enter().append('g')
        .attr('transform', function(d) {
          var x;

          // Todo => Trick to get a single bar on the right.
          // It's better to have it under Charichart.Bar.
          if (series.stackedBarAlign === 'right') {
            x = width - series.barWidth;
          } else {
            x = xscale(d.datetime);
          }

          return h_getTranslate(x, 0);
        });

      var bars = stackedBar.selectAll('rect')
        .data(function(d) {
          return d.scrutinized;
        })
        .enter().append('rect')
        .attr('id', function(d) {
          return d.id;
        })
        .attr('width', series.barWidth)
        .attr('y', function(d) {
          return yscale(d.y1);
        })
        .attr('height', function(d) {
          return yscale(d.y0) - yscale(d.y1);
        })
        .style('cursor', 'pointer')
        .style('fill', function(d) {
          return d.color;
        })
        .on('mousemove', function(d) {
          trigger('mouseoverStackbar', [d, d3.mouse(this)]);
        });

      // quick thing: refactor this
      on('stackbar-over', function(id) {
        var el = _.filter(bars[0], function(el) {
          return el.id === String(id);
        })[0];
        var centroid = h_getCentroid(d3.select(el));
        d3.select(el).each(function(d) {
          trigger('mouseoverStackbar', [d3.select(el).data()[0], centroid]);
        });
      });

      /**
       * Trigger mouseoverStackbar for the given selection.
       * TODO => This is probably better on the user side, we could
       * return bars array, and the user can do anything he wants.
       * 
       * @param  {Object} selection d3 selection
       */
      function triggerSelect(selection) {
        selection.each(function(d) {
          trigger('mouseoverStackbar', [d, h_getCentroid(selection)]);
        });
      }

      setTimeout(function() {
        triggerSelect(d3.select(_.last(bars[0])));
      }, 0);
    }

    return {
      drawBar: drawBar
    };
  }
];
var p_svg = ['opts', function(opts) {

  function drawSvg() {
    return d3.select(opts.target)
      .append('svg')
        .attr('width', opts.responsive ?  '100%' : opts.fullWidth)
        .attr('height', opts.fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', opts.gmainTranslate);
  }

  var svg = drawSvg();

  return {svg: svg};
}];
/**
 * Add an trail to the supplied svg and trigger events
 * when the user moves it.
 */
var p_trail = ['svg', 'trigger', 'height', 'width', 'xscale', 'margin',
  function(svg, trigger, height, width, xscale, margin) {

    var currentDate;

    var trail = svg.append('g')
      .attr('class', 'trail');

    var markerDef = svg.append('svg:marker')
      .attr('id', 'trailArrow')
      .attr('class', 'trail-arrow')
      .attr('viewBox','0 0 20 20')
      .attr('refX','15')
      .attr('refY','11')
      .attr('markerUnits','strokeWidth')
      .attr('markerWidth','15')
      .attr('markerHeight','11')
      .attr('orient','auto')
      .append('svg:path')
        .attr('d','M 0 0 L 20 10 L 0 20 z')
        .attr('fill', '#777');

    var trailLine = trail.append('svg:line')
      .attr('class', 'trail-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -margin.top + 10) // 10px padding
      .attr('y2', height)
      .attr('marker-start', 'url(#trailArrow)');

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
     * TODO: => support different date units
     */
    function onBrush() {
      var xdomain = xscale.domain();
      var date;

      if (d3.event.sourceEvent) {
        date = xscale.invert(d3.mouse(this)[0]);
      } else {
        date = brush.extent()[0];
      }

      // If the selected date is out of the domain,
      // select the nearest domain date.
      if (Date.parse(date) > Date.parse(xdomain[1])) {
        date = xdomain[1];
      } else if (Date.parse(date) < Date.parse(xdomain[0])) {
        date = xdomain[0];
      }

      if (date.getUTCMinutes() >= 30) {
        date.setUTCHours(date.getUTCHours()+1);
      }

      date.setUTCMinutes(0, 0); // steps to minutes
      date = Date.parse(date);

      if (currentDate === date) {
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
Charicharts.Chart = Chart;

// Chart constructor.
function Chart() {
  this.init.apply(this, arguments);

  return {
    on: this.$scope.on,
    unbind: this.$scope.unbind
  };
}

// Chart parts dependencies.
Chart.modules = [
  p_events,
  p_svg,
  p_scale,
  p_axes,
  p_series,
  // p_trail
];

// Initialize teh Chart.
Chart.prototype.init = function(opts, data) {
  this._opts = this.parseOpts(opts);
  this._data = data;
  loadModules.apply(this, [Chart.modules]);
};

// Method that loadmodules and set the $scope.
function loadModules(modules) {
  var self = this;

  // Set $scope
  this.$scope = {};
  this.$scope.opts = this._opts;
  this.$scope.data = this._data;

  // Generate injector caller
  var caller = generateInjector(this.$scope);

  // Load modules
  _.each(modules, function(module) {
    var defs = caller(module);
    _.extend(self.$scope, defs);
  });
}
Chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  // Series options.
  series: {
    barWidth: 12,
    stackedBarAlign: 'right'
  },
  // Xaxis Options.
  xaxis: {
    scale: 'time',
    fit: false,
    ticks: false,
    top: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    },
    bottom: {
      enabled: true,
      label: false,
      tickFormat: function(d) {return d.getMonth();}
    }  
  },
  // Yaxis Options.
  yaxis: {
    scale: 'linear',
    fit: false,
    fullGrid: true,
    textMarginTop: 0,
    ticks: false,
    left: {
      enabled: true,
      label: false,
      tickFormat: function(d) {return d;}
    },
    right: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    }
  }
};
Chart.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Chart.defaults, opts);
  
  // TODO => Use deep extend to clone defaults and supplied opts.
  o.series = _.extend({}, Chart.defaults.series, o.series);
  o.xaxis = _.extend({}, Chart.defaults.xaxis, o.xaxis);
  o.xaxis.bottom = _.extend({}, Chart.defaults.xaxis.bottom, o.xaxis.bottom);
  o.xaxis.top = _.extend({}, Chart.defaults.xaxis.top, o.xaxis.top);
  o.yaxis = _.extend({}, Chart.defaults.yaxis, o.yaxis);
  o.yaxis.left = _.extend({}, Chart.defaults.yaxis.left, o.yaxis.left);
  o.yaxis.right = _.extend({}, Chart.defaults.yaxis.right, o.yaxis.right);

  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));

  /**
   * Axis labels padding.
   * TODO: => Do this better.
   */
  if (o.yaxis.left.label || o.yaxis.right.label) {
    o.margin.top += Math.abs(o.yaxis.textMarginTop - 30);
  }

  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(o.margin.left, o.margin.top);

  return o;
};

Charicharts.Pie = Pie;

function Pie() {
  this.init.apply(this, arguments);
  return _.omit(this, '$scope', 'call', 'parseOpts', 'render', 'setInnerArrow');
}

Pie.prototype.init = function(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.call = generateInjector(this.$scope);
  this.render();
};

Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 1,
  innerArrow: false,
  innerArrowSize: 0.6
};
Pie.prototype.setInnerArrow = function() {
  var self = this,
      opts = this._opts,
      radius = this.$scope.radius * (1 - opts.outerBorder),
      arrowSize = (radius * opts.innerArrowSize * (1 - opts.innerRadius)),
      diameter = radius * (opts.innerRadius) * 2;

  if (diameter < arrowSize) {
    arrowSize = diameter * 0.5;
  }

  // Define arrow
  this.$scope.svg.append('svg:marker')
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
  this.$scope.innerArrow = this.$scope.svg.append('line')
    .attr('class', 'outer-border')
    .style('stroke', 'transparent')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('marker-end', 'url(#innerArrow)');

  // Set mouse move Event
  this.on('mouseover', function(d) {
    moveArrow(d);
  });

  /**
   * Moves the arrow to the given data object.
   * 
   * @param  {Object} d d3 data object appended to the arc.
   */
  function moveArrow(d) {
    var coords = self.$scope.arc.centroid(d),
        angle = h_getAngle(coords[0], coords[1]),
        cos = Math.cos(angle),
        sin = Math.sin(angle),
        x = radius * cos,
        y = radius * sin;

    if (!x || !y) {return;}

    self.$scope.innerArrow
      .attr('x2', x)
      .attr('y2', y);
  }

  this.moveArrowTo = function(id) {
    self.$scope.pieces.each(function(d) {
      if (d.data.id !== id) {return;}
      self.$scope.trigger('mouseover', [d]);
    });
  };

  // Select automatically first pie piece.
  setTimeout(function() {
    var d = self.$scope.pieces.data()[0];
    self.$scope.trigger('mouseover', [d]);
  }, 0);
};
Pie.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Pie.defaults, opts);

  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));

  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(o.fullWidth/2, o.fullHeight/2);

  return o;
};
Pie.prototype.render = function() {
  var self = this;

  // Pie size
  this.$scope.radius = Math.min(this._opts.fullWidth, this._opts.fullHeight) / 2;

  // Draw SVG
  this.$scope.svg = this.call(p_svg).draw();

  if (this._opts.outerBorder) {
    this.$scope.svg.append('svg:circle')
      .attr('class', 'outer-border')
      .attr('fill', 'transparent')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', this.$scope.radius);
  }

  // Pie layout
  this.$scope.pieLayout = d3.layout.pie()
    .sort(null)
    .value(function(d) {return d.value;});

  // Pie arc
  var innerPadding = this._opts.outerBorder ? (1 - this._opts.outerBorder) : 1;
  var arcRadius = this.$scope.radius * innerPadding;

  this.$scope.arc = d3.svg.arc()
    .innerRadius(arcRadius - (arcRadius * (1 - this._opts.innerRadius)))
    .outerRadius(arcRadius); 

  // Draw pie
  this.$scope.pieces = this.$scope.svg.selectAll('path')
      .data(this.$scope.pieLayout(this._opts.data))
      .enter()
    .append('path')
    .attr('class', 'pie-piece')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', this.$scope.arc);

  // Mouse over event
  this.$scope.pieces.on('mouseover', function(d) {
    // Fade all paths
    self.$scope.pieces
      .style('opacity', self._opts.fadeOpacity);
    // Highlight hovered
    d3.select(this).style('opacity', 1);
    // Triger over event
    self.$scope.trigger('mouseover', [d]);
  });
  
  // Mouse leave event
  this.$scope.svg.on('mouseleave', function(d) {
    self.$scope.pieces
      .style('opacity', 1);
  });

  if (this._opts.innerArrow) {
    this.setInnerArrow();
  }
};
Charicharts.Bar = Bar;

function Bar() {
  this.init.apply(this, arguments);
  return _.omit(this, '$scope', 'call', 'parseOpts', 'render');
}

Bar.prototype.init = function(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.call = generateInjector(this.$scope);
  this.render(this._opts.type);
};

Bar.defaults = {
  margin: '0,0,0,0',
  type: 'percentage'
};
Bar.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Bar.defaults, opts);
  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));
  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(0, 0);
  o.responsive = true;
  return o;
};
/**
 * Renders a percentage bar in the target.
 *
 * @param {String} type String type
 */
Bar.prototype.render = function(type) {
  var self = this;

  // Map bar types with it render methods.
  var types = {
    percentage: renderPercentageBar,
    stacked: renderStackedBar
  };

  function renderPercentageBar() {
    self.$scope.svg = self.call(p_svg).draw();

    var total = d3.sum(_.pluck(self._opts.data, 'value'));
    var x0 = 0;

    var data = _.map(self._opts.data,
      function(d) {
        var v = {
          x0: x0,
          x1: d.value * 100 / total,
          color: d.color
        };
        x0 += v.x1;
        return v;
      });

    self.$scope.svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', function(d, i) {
        return d.x0 + '%';
      })
      .attr('y', 0)
      .attr('width', function(d) {
        return d.x1 + '%';
      })
      .attr('height', self._opts.height)
      .style('fill', function(d) {
        return d.color;
      });
  }

  function renderStackedBar() {
  } 

  var renderMethod = types[type];
  renderMethod();
};
/* jshint ignore:start */
  if (typeof define === "function" && define.amd) define(Charicharts);
  else if (typeof module === "object" && module.exports) module.exports = Charicharts;
  this.Charicharts = Charicharts;
}.call(window);
/* jshint ignore:end */
