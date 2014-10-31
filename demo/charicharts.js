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

/**
 * Deep extend function created but jashkenas itself
 * https://github.com/jashkenas/underscore/issues/88
 */
function h_deepExtend(target, source) {
  for (var key in source) {
    var original = target[key];
    var next = source[key];
    if (original && next && typeof next === 'object') {
      h_deepExtend(original, next);
    } else {
      target[key] = next;
    }
  }
  return target;
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
Charicharts.Bar = function(options) {
  this._options = h_parseOptions(_.extend({}, Charicharts.Bar.defaults, options));
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  this.call = generateInjector(this.$scope);
  this[Charicharts.Bar.types[this._options.type]]();
  return _.pick(this.$scope, 'on');
};

/**
 * Renders a percentage bar in the target.
 */
Charicharts.Bar.prototype.renderPercentageBar = function() {
  this.$scope.svg = this.call(p_svg).drawResponsive();

  var total = d3.sum(_.pluck(this._options.data, 'value'));
  var x0 = 0;

  var data = _.map(this._options.data,
    function(d) {
      var v = {
        x0: x0,
        x1: d.value * 100 / total,
        color: d.color
      };
      x0 += v.x1;
      return v;
    });

  this.$scope.svg
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
    .attr('height', this._options.height)
    .style('fill', function(d) {
      return d.color;
    });
};

/**
 * Map bar types with it render methods.
 */
Charicharts.Bar.types = {
  percentage: 'renderPercentageBar'
};

/**
 * Defaults bar options.
 */
Charicharts.Bar.defaults = {
  margin: '0,0,0,0',
  type: 'percentage'
};
Charicharts.Chart = function chart(options) {
  this._options = this.parseOptions(options);
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  this.call = generateInjector(this.$scope);
  this.renderChart();

  /*
   * Methods which are going to be available
   * in the chart instance.
   */
  var chartMethods = {
    on: this.$scope.on,
    toggleSerie: _.bind(this.toggleSerie, this),
    addSerie: _.bind(this.addSerie, this)
  };

  return chartMethods;
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.Chart.prototype.renderChart = function() {
  var opts = this._options,
      that = this,
      xaxis, yaxis;

  // Draw svg
  // Main chart wrapper under the given target.
  var svgTranslate = h_getTranslate(opts.margin.left, opts.margin.top);
  this.$scope.svg = this.call(p_svg).draw(svgTranslate);

  // Set scales
  this.$scope.xscale = this.call(p_scale).getXScale();
  this.$scope.yscale = this.call(p_scale).getYScale();

  // Draw axis
  this.call(p_axes).drawY();
  this.call(p_axes).drawX();

  _.each(opts.data, function(serie) {
    that.addSerie(serie);
  });

  // Draw trail (optional)
  // Add a trail line to the chart and trigger a 'moveTrail'
  // event when the user moves the trail.
  if (opts.trail) {
    this.call(p_trail);
  }
};

/**
 * Add the supplied serie to the chart.
 * 
 * @param {Object} serie
 */
Charicharts.Chart.prototype.addSerie = function(serie) {
  if (serie.type === 'line') {
    this.call(p_line).drawLine(serie);
  } else if (serie.type === 'bar') {
    this.call(p_bar).drawBar(serie);
  } else if (serie.type === 'stacked-bar') {
    this.call(p_stacked_bar).drawBar(serie);
  }
};

/**
 * Toggle the supplied serieId.
 * 
 * @param  {Integer} serieId
 */
Charicharts.Chart.prototype.toggleSerie = function(serieId) {
  var el = this.$scope.svg.select('#serie' + serieId);
  if (el.empty()) {return;}
  var active = Number(el.attr('active')) ? 0 : 1;
  el.attr('active', active);

  el.transition()
    .duration(200)
    .style('opacity', el.attr('active'));
};

/**
 * Parse Given Options so it's easier to read them.
 * 
 * @param  {Object} options User options
 * @return {Object} options Parsed options
 */
Charicharts.Chart.prototype.parseOptions = function(options) {
  options = h_deepExtend(_.extend({}, Charicharts.Chart.defaults), options);

  options.margin = _.object(['top', 'right', 'bottom', 'left'],
    options.margin.split(',').map(Number));

  /**
   * Axis labels padding.
   * TODO: => Do this better.
   */
  if (options.yaxis.left.label || options.yaxis.right.label) {
    options.margin.top += Math.abs(options.yaxis.textMarginTop - 30);
  }

  options.fullWidth = options.target.offsetWidth;
  options.fullHeight = options.target.offsetHeight;
  options.width = options.fullWidth - options.margin.left - options.margin.right;
  options.height = options.fullHeight - options.margin.top - options.margin.bottom;

  return options;
};

/**
 * Defaults Chart options.
 */
Charicharts.Chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  /**
   * Series options.
   */
  series: {
    barWidth: 12,
    stackedBarAlign: 'right'
  },
  /**
   * Xaxis Options.
   */
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
  /**
   * Yaxis Options.
   */
  yaxis: {
    scale: 'linear',
    fit: false,
    fullGrid: true,
    ticksMarginTop: 0,
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
/**
 * Pie events:
 *   mouseover - mouseover over the paths
 */
Charicharts.Pie = function pie(options) {
  this._options = h_parseOptions(_.extend({}, Charicharts.Pie.defaults, options));
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  this.load = generateInjector(this.$scope);
  this.init();
  return _.pick(this.$scope, 'on');
};

/**
 * Generate a pie by setting all it parts.
 */
Charicharts.Pie.prototype.init = function() {
  var self = this;
  var opts = this._options;

  // Pie size
  this.$scope.radius = Math.min(opts.fullWidth, opts.fullHeight) / 2;

  // Draw SVG
  this.$scope.svg = this.load(p_svg)
    .draw(h_getTranslate(opts.fullWidth/2, opts.fullHeight/2));

  if (opts.outerBorder) {
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
  var innerPadding = opts.outerBorder ? (1 - opts.outerBorder) : 1;
  var arcRadius = this.$scope.radius * innerPadding;

  this.$scope.arc = d3.svg.arc()
    .innerRadius(arcRadius - (arcRadius * (1 - opts.innerRadius)))
    .outerRadius(arcRadius); 

  // Draw pie
  this.$scope.pieces = this.$scope.svg.selectAll('path')
      .data(this.$scope.pieLayout(opts.data))
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
      .style('opacity', opts.fadeOpacity);
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

  if (opts.innerArrow) {
    this.setInnerArrow();
  }
};

Charicharts.Pie.prototype.setInnerArrow = function() {
  var self = this;
  var opts = this._options;

  var radius = this.$scope.radius * (1 - opts.outerBorder);
  var arrowSize = (radius * opts.innerArrowSize * (1 - opts.innerRadius));
  var diameter = radius * (opts.innerRadius) * 2;

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
  this.$scope.pieces.on('mousemove', function() {
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

    self.$scope.innerArrow
      .attr('x2', x)
      .attr('y2', y);
  }

  function triggerSelect(selection) {
    selection.each(function(d) {
      self.$scope.trigger('mouseover', [d]);
    });
    var centroid = h_getCentroid(selection);
    moveArrow(h_getAngle.apply(this, centroid));
  }

  setTimeout(function() {
    triggerSelect(d3.select(self.$scope.pieces[0][0]));
  }, 0);
};

/**
 * Defaults pie options.
 */
Charicharts.Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 1,
  innerArrow: false,
  innerArrowSize: 0.6
};
var p_axes = ['svg', 'xscale','yscale', 'xaxis', 'yaxis', 'width', 'height', 'fullWidth', 'margin',
  function(svg, xscale, yscale, xaxis, yaxis, width, height, fullWidth, margin) {
    'use strict';

    var getX = function(orient) {
      var opts = orient === 'bottom' ? xaxis.bottom : xaxis.top;

      var axis = d3.svg.axis()
        .scale(xscale)
        .orient(orient)
        .tickFormat(opts.tickFormat);

      // Apply ticks [] if enabled
      xaxis.ticks && axis.ticks.apply(axis, xaxis.ticks);

      // Draw axis
      svg.append('g')
        .attr('class', 'xaxis ' + orient)
        .attr('transform', h_getTranslate(0, orient === 'bottom' ? height : 0))
        .call(axis)
        .selectAll('text')
          .style('text-anchor', 'middle');

      svg.select('.xaxis .domain')
        .attr('d', 'M{0},0V0H{1}V0'.format(-margin.left, fullWidth));

      // Label
      if (opts.label) {
        svg.select('.xaxis').append('text')
          .attr('class', 'label')
          .attr('transform', h_getTranslate(0, 0))
          .attr('y', margin.bottom - 7)
          .attr('x', 0 -margin.left)
          .attr('text-anchor', 'start')
          .text(opts.label);
      }
    };

    var getY = function(orient) {
      var opts = orient === 'left' ? yaxis.left : yaxis.right;

      var axis = d3.svg.axis()
        .scale(yscale)
        .orient('right')
        .tickFormat(opts.tickFormat);

      // Apply ticks [] if enabled
      yaxis.ticks && axis.ticks.apply(axis, yaxis.ticks);

      // Draw axis
      svg.append('g')
        .attr('class', 'yaxis ' + orient)
        .attr('transform', h_getTranslate(orient === 'left' ? 0 : width + margin.right, 0))
        .call(axis)
        .selectAll('text')
          .attr('x', orient === 'left' ? -margin.left : 0)
          .attr('y', yaxis.textMarginTop)
          .style('text-anchor', orient === 'left' ? yaxis.textAnchor : 'end');

      // Grid
      svg.select('.yaxis')
        .selectAll('line')
          .attr('x1', yaxis.fullGrid ? -margin.left : 0)
          .attr('x2', yaxis.fullGrid ? width + margin.right : width)
          // add zeroline class
          .each(function(d) {
            if (d !== 0) {return;}
            d3.select(this).attr('class', 'zeroline');
          });

      // Label
      if (opts.label) {
        svg.select('.yaxis').append('text')
          .attr('class', 'label')
          .attr('transform', h_getTranslate(0, 0))
          .attr('y', yaxis.textMarginTop - 20)
          .attr('x', orient === 'left' ? -margin.left : width + margin.right)
          .attr('text-anchor', orient === 'left' ? 'start' : 'end')
          .text(opts.label);
      }

      svg.select('.yaxis .domain').remove();
    };

    return {
      drawX: function() {
        xaxis.bottom.enabled && getX('bottom');
        xaxis.top.enabled && getX('top');
      },

      drawY: function() {
        yaxis.left.enabled && getY('left');
        yaxis.right.enabled && getY('right');
      }
    };

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
        .attr('class', function(d) {
          return d.value < 0 ? 'bar-negative' : 'bar-positive';
        })
        .attr('x', function(d) {
          // TODO: Linear scale support
          return xscale(d.datetime) - series.barWidth/2;
        })
        .attr('y', function(d) {
          return d.value < 0 ? yscale(0) : yscale(d.value) - 1;
        })
        .attr('width', series.barWidth)
        .attr('height', function(d) {
          return Math.abs(yscale(d.value) - yscale(0));
        })
        .attr('fill', function() {
          return serie.color;
        });
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
      var path = svg.append('path')
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
        .attr('class', 'line')
        .attr('transform', 'translate(0, 0)')
        .attr('stroke', serie.color)
        .attr('d', line.interpolate(serie.interpolation)(serie.values));

      path.on('mousemove', function() {
        console.log('mouse over');
      });
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

    var scalePadding = 1.05;

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
      var extent = d3.extent(valuesArr, function(d) {
        if (d.scrutinized) {
          return d3.sum(_.pluck(d.scrutinized, 'value')) * scalePadding;
        }
        return Number(d.value) * scalePadding;
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
          return d3.sum(_.pluck(d.scrutinized, 'value')) * scalePadding;
        }
        return d.value * scalePadding;
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
        .range([height, 0])
        .nice(); // Extends the domain so that it starts and ends on nice round values.
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
var p_stacked_bar = ['svg', 'xscale', 'yscale', 'trigger', 'series', 'width', 'height',
  function(svg, xscale, yscale, trigger, series, width, height) {

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

        v.total = v.scrutinized[v.scrutinized.length-1].y1;
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

      stackedBar.selectAll('rect')
          .data(function(d) {return d.scrutinized;})
        .enter().append('rect')
          .attr('width', series.barWidth)
          .attr('y', function(d) {return yscale(d.y1);})
          .attr('height', function(d) {return yscale(d.y0) - yscale(d.y1);})
          .style('fill', function(d) {return d.color;})
          .on('mousemove', function(d) {
            trigger('mouseoverStackbar', [d, d3.mouse(this)]);
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
        .attr('transform', translate || h_getTranslate(0, 0));
  }

  function drawResponsive(translate) {
    return d3.select(target)
      .append('svg')
        .attr('width', '100%')
        .attr('height', fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', translate || h_getTranslate(0, 0));
  }

  return {
    drawResponsive: drawResponsive,
    draw: draw
  };
  
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

    var trailLine = trail.append('svg:line')
      .attr('class', 'trail-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -margin.top + 10) // 10px padding
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
