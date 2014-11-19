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
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
/* jshint ignore:start */
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if (!initializing && this.init) {
        return this.init.apply(this, arguments);
      }
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
}).call(window);
/* jshint ignore:end */
/**
 * Constructor Class. All charicharts constructors extends this Class.
 */
var CClass = Class.extend({

  init: function(opts, data) {
    // Set scope
    this.$scope = {
      opts: this.parseOptions(opts),
      data: data
    };

    // Set events module into the $scope.
    _.extend(this.$scope, charichartsEvents());

    this._loadModules(this._modules);
    return this.getInstanceProperties();
  },

  _loadModules: function() {
    // Generate injector
    var caller = this._generateInjector(this.$scope);

    // Load modules
    for (var i = 0; i < this.modules.length; i++) {
      _.extend(this.$scope, new this.modules[i](this.$scope));
    }
  },

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
  _generateInjector: function(ctx) {
    return function(args) {
      var func = args[args.length-1];
      args = args.slice(0, args.length-1).map(function(a) {
        return ctx[a];
      });
      return func.apply(ctx, args);
    };
  }

});
/**
 * Creates a events module.
 */
var charichartsEvents = function() {

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
};
/**
 * Part Class. All charicharts parts extends this Class.
 */
var PClass = Class.extend({

  _coreSubscriptions: [{
    'Scope/emit': function(obj) {
      _.extend(this, obj);
    }
  }],

  init: function($scope) {
    this._loadModules($scope);

    // Subscribe
    _.each(_.union(this._coreSubscriptions,
      this._subscriptions), this._subscribe, this);

    // Initialize P Module
    return this.initialize();
  },

  /**
   * Load dependencies modules.
   */
  _loadModules: function($scope) {
    for (var i = this.deps.length - 1; i >= 0; i--) {
      this[this.deps[i]] = $scope[this.deps[i]];
    }

    this.on = $scope.on;
    this.trigger = $scope.trigger;
  },

  /**
   * Subscribe to module events.
   */
  _subscribe: function(subscription) {
    _.each(subscription, _.bind(function(callback, name) {
      this.on(name, _.bind(callback, this));
    },this));
  },

  /**
   * Update scope variables in every PClass child
   * for the given objects.
   * 
   * @param  {Array} objs
   */
  emit: function(objs) {
    this.trigger('Scope/emit', [objs]);
  }

});
var p_axes = PClass.extend({

  deps: [
    'svg',
    'opts',
    'xscale',
    'yscale'
  ],

  _subscriptions: [{
    'Scale/update': function(data) {
    }
  }],

  initialize: function() {
    if (this.opts.yaxis.left.enabled) {
      this._setAxis('left');
    }

    if (this.opts.yaxis.right.enabled) {
      this._setAxis('right');
    }

    if (this.opts.xaxis.top.enabled) {
      this._setAxis('top');
    }

    if (this.opts.xaxis.bottom.enabled) {
      this._setAxis('bottom');
    }

    if (this.opts.yaxis.left.enabled || this.opts.yaxis.right.enabled) {
      this._setYGrid();
    }

    if (this.opts.xaxis.top.enabled || this.opts.xaxis.bottom.enabled) {
      this._setXDomainFullwidth();
    }
  },

  _setAxis: function(orient) {
    var params = {
      'bottom': {
        axis: 'xaxis',
        translate: h_getTranslate(0, this.opts.height),
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
        translate: h_getTranslate(this.opts.width + this.opts.margin.right, 0),
        textAnchor: 'end'
      }
    };

    var p = params[orient];

    // Set axis
    var axis = d3.svg.axis()
      .scale(p.axis === 'xaxis' ? this.xscale : this.yscale)
      .orient(orient)
      .tickFormat(this.opts[p.axis][orient].tickFormat);

    if (this.opts[p.axis].ticks) {
      axis.ticks.apply(this, this.opts[p.axis].ticks);
    }

    // Draw axis
    var axisG = this.svg.append('g')
      .attr('class', p.axis + ' ' + orient)
      .attr('transform', p.translate)
      .call(axis);

    // Axis ticks texts
    var axisGTexts = axisG.selectAll('text');
    axisGTexts.style('text-anchor', p.textAnchor);

    if (p.axis === 'yaxis') {
      axisGTexts
        .attr('x', orient === 'left' ? -this.opts.margin.left : 0)
        .attr('y', this.opts.yaxis.textMarginTop);
      this.svg.select('.yaxis .domain').remove();
    }

    // // Axis ticks texts
    if (this.opts[p.axis][orient].label) {
      this._setLabel(axisG, this.opts[p.axis][orient].label, orient);
    }
  },

  _setXDomainFullwidth: function() {
    this.svg.selectAll('.xaxis .domain')
      .attr('d', 'M{0},0V0H{1}V0'.format(-this.opts.margin.left, this.opts.fullWidth));
  },

  _setYGrid: function() {
    this.svg.select('.yaxis')
      .selectAll('line')
        .attr('x1', this.opts.yaxis.fullGrid ? -this.opts.margin.left : 0)
        .attr('x2', this.opts.yaxis.fullGrid ? this.opts.width + this.opts.margin.right : this.opts.width)
        // add zeroline class
        .each(function(d) {
          if (d !== 0) {return;}
          d3.select(this).attr('class', 'zeroline');
        });    
  },

  _setLabel: function(axisG, label, orient) {
    // 'top' Not supported right now
    if (orient === 'top') {return;}
    var params = {
      'bottom': {
        x: 0 - this.opts.margin.left,
        y: this.opts.margin.bottom -7,
        textAnchor: 'start'
      },
      'left': {
        x: -this.opts.margin.left,
        y: this.opts.yaxis.textMarginTop - 20,
        textAnchor: 'start'
      },
      'right': {
        x: 0,
        y: this.opts.yaxis.textMarginTop - 20,
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
  },

  getScopeParams: function() {
    return {};
  }

});
var p_pieInnerArrow = ['opts', 'svg', 'on', 'trigger', 'pieArc', 'piePieces',
  function(opts, svg, on, trigger, pieArc, piePieces) {

    function setArrow() {
      var radius = opts.radius * (1 - opts.outerBorder),
          diameter = radius * (opts.innerRadius) * 2,
          arrowSize;

      if (diameter < arrowSize) {
        arrowSize = diameter * 0.5;
      } else {
        arrowSize = radius * opts.innerArrowSize * (1 - opts.innerRadius);
      }

      // Define arrow
      svg.append('svg:marker')
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
      var innerArrow = svg.append('line')
        .attr('class', 'outer-border')
        .style('stroke', 'transparent')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('marker-end', 'url(#innerArrow)');

      on('mouseover', function(d) {
        arrowPosition(d);
      });

      /**
       * Move arrow to the given d object.
       */
      function arrowPosition(d) {
        var coords = pieArc.centroid(d),
            angle = h_getAngle(coords[0], coords[1]),
            cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = radius * cos,
            y = radius * sin;

        if (!x || !y) {return;}

        innerArrow
          .attr('x2', x)
          .attr('y2', y);
      }

      // Select automatically first pie piece.
      setTimeout(function() {
        var d = piePieces.data()[0];
        trigger('mouseover', [d]);
      }, 0);
    }

    /**
     * Move arrow to the given data object id.
     */
    function moveArrowTo(id) {
      piePieces.each(function(d) {
        if (d.data.id !== id) {return;}
        trigger('mouseover', [d]);
      });
    }

    if (opts.innerArrow) {
      setArrow();
      return {
        moveArrowTo: moveArrowTo
      };
    }
  }];
var p_pie = ['opts', 'svg', 'data', 'trigger', function(opts, svg, data, trigger) {

  // Render outerborder
  if (opts.outerBorder) {
    svg.append('svg:circle')
      .attr('class', 'outer-border')
      .attr('fill', 'transparent')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', opts.radius);
  }

  // Pie layout
  var pieLayout = d3.layout.pie()
    .sort(null)
    .value(function(d) {return d.value;});

  // Pie arc
  var innerPadding = opts.outerBorder ? (1 - opts.outerBorder) : 1;
  var arcRadius = opts.radius * innerPadding;

  var pieArc = d3.svg.arc()
    .innerRadius(arcRadius - (arcRadius * (1 - opts.innerRadius)))
    .outerRadius(arcRadius); 

  // Draw pie
  var piePieces = svg.selectAll('path')
      .data(pieLayout(data))
      .enter()
    .append('path')
    .attr('class', 'pie-piece')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', pieArc);

  // Mouse over event
  piePieces.on('mouseover', function(d) {
    // Fade all paths
    piePieces.style('opacity', opts.fadeOpacity);
    // Highlight hovered
    d3.select(this).style('opacity', 1);
    // Triger over event
    trigger('mouseover', [d]);
  });
  
  // Mouse leave event
  svg.on('mouseleave', function(d) {
    piePieces.style('opacity', 1);
  });

  return {
    pieArc: pieArc,
    piePieces: piePieces
  };
}];
/**
 * Set X/Y scales.
 */
var p_scale = PClass.extend({

  deps: [
    'data',
    'opts'
  ],

  _subscriptions: [{
    /**
     * Triggered when the serie gets updated with new data.
     * @param  {Object} data Single data object
     */
    'Serie/update': function(data) {
      // Update data
      this._dataFlattened = data;

      // Update scales
      this.xscale = this._getXScale();
      this.yscale = this._getYScale();

      // Emit them to all scopes
      this.emit({
        xscale: this.xscale,
        yscale: this.yscale
      });

      this.trigger('Scale/update', []);
    }
  }],

  _d3Scales: {
    'time': d3.time.scale.utc,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  },

  initialize: function() {
    this._dataFlattened = this._getFlattenedData();
    this.xscale = this._getXScale();
    this.yscale = this._getYScale();

    return {
      xscale: this.xscale,
      yscale: this.yscale
    };
  },

  /**
   * Get this.data flattened of all series.
   * Handy when we need to get the extent.
   */
  _getFlattenedData: function() {
    return _.flatten(_.map(this.data, function(d) {
      return d.values;
    }));
  },

  /**
   * Returns the xscale.
   */
  _getXScale: function() {
    var domain = this._getDomain(this.opts.xaxis.scale, this.opts.xaxis.fit);
    return this._d3Scales[this.opts.xaxis.scale]()
      .domain(domain)
      .range([0, this.opts.width]);
  },

  /**
   * Returns the yscale.
   */
  _getYScale: function() {
    var domain = this._getDomain(this.opts.yaxis.scale, this.opts.yaxis.fit);

    return this._d3Scales[this.opts.yaxis.scale]()
      .domain(domain)
      .range([this.opts.height, 0])
      .nice(); // Extends the domain so that it starts and ends on nice round values.
  },

  _getDomain: function(scale, fit) {
    if (scale === 'time') {
      return this._getTimeDomain();
    }

    if (fit) {
      return this._getLinearFitDomain();
    } else {
      return this._getLinearAllDomain();
    }
  },

  _getTimeDomain: function() {
    return d3.extent(this._dataFlattened, function(d) {
      return d.datetime;
    });
  },

  _getLinearAllDomain: function() {
    var extent = d3.extent(this._dataFlattened, function(d) {
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
  },

  _getLinearFitDomain: function() {
    return d3.extent(this._dataFlattened, function(d) {
      if (d.scrutinized) {
        return d3.sum(_.pluck(d.scrutinized, 'value'));
      }
      return d.value;
    });
  }

});
var p_series = PClass.extend({

  deps: [
    'data',
    'svg',
    'xscale',
    'yscale',
    'opts'
  ],

  _subscriptions: [{
  }],

  initialize: function() {
    var self = this;

    for (var i = 0; i < this.data.length; i++) {
      this._addSerie(this.data[i]);
    }

    return {
      updateSerie: _.bind(this.updateSerie, this)
    };
  },

  _addSerie: function(serie) {
    if (serie.type === 'line') {
      this._addLineSerie(serie);
    } else if (serie.type ==='bar') {
      this._addBarSerie(serie);
    } else if (serie.type === 'stacked-bar') {
      this._addStackedSerie(serie);
    } else if (serie.type === 'area') {
      this._addAreaSerie(serie);
    }
  },

  _addLineSerie: function(serie, el, update) {
    var self = this;

    var line = d3.svg.line()
      .x(function(d) {
        return self.xscale(d.datetime);
      })
      .y(function(d) {
        return self.yscale(d.value);
      });

    if (update) {
      el
        .attr('d', line.interpolate('linear'))
        .attr('transform', 'translate(0,0)');
      return;
    }

    this.svg.append('path')
      .datum(serie.values)
      .attr('type', 'line')
      .attr('id', 'serie' + serie.id)
      .attr('active', 1)
      .attr('class', 'line')
      .attr('transform', 'translate(0, 0)')
      .attr('stroke', serie.color)
      .attr('d', line.interpolate(serie.interpolation));
  },

  _getSerieById: function(id) {
    return this.svg.select('#serie' + id);
  },

  updateSerie: function(id) {
    var el = this._getSerieById(id);
    var data = el.datum();

    // comunicate through events,
    this.trigger('Serie/update', [data]);

    console.log(this.xscale.domain());

    if (el.attr('type') === 'line') {
      this._addLineSerie(false, el, true);
    }
  }

});
var p_svg = PClass.extend({

  deps: [
    'opts'
  ],

  initialize: function() {
    this.svg = this.drawSvg();

    return {
      svg: this.svg
    };
  },

  drawSvg: function() {
    return d3.select(this.opts.target)
      .append('svg')
        .attr('width', this.opts.responsive ?  '100%' : this.opts.fullWidth)
        .attr('height', this.opts.fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', this.opts.gmainTranslate);    
  }

});
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

Charicharts.Chart = CClass.extend({

  modules: [
    p_svg,
    p_scale,
    p_axes,
    p_series,
    // p_trail
  ],

  /**
   * What is going to be returned to the chart instance.
   * @return {Object} Chart properties
   */
  getInstanceProperties: function() {
    return {
      updateSerie: this.$scope.updateSerie,
      on: this.$scope.on,
      unbind: this.$scope.unbind
    };
  },

  defaults: {
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
        tickFormat: function(d) {
          return d;
        }
      },
      bottom: {
        enabled: true,
        label: false,
        tickFormat: function(d) {
          return d.getMonth();
        }
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
        tickFormat: function(d) {
          return d;
        }
      },
      right: {
        enabled: false,
        label: false,
        tickFormat: function(d) {
          return d;
        }
      }
    }
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);
    
    // TODO => Use deep extend to clone defaults and supplied options.
    o.series = _.extend({}, this.defaults.series, o.series);
    o.xaxis = _.extend({}, this.defaults.xaxis, o.xaxis);
    o.xaxis.bottom = _.extend({}, this.defaults.xaxis.bottom, o.xaxis.bottom);
    o.xaxis.top = _.extend({}, this.defaults.xaxis.top, o.xaxis.top);
    o.yaxis = _.extend({}, this.defaults.yaxis, o.yaxis);
    o.yaxis.left = _.extend({}, this.defaults.yaxis.left, o.yaxis.left);
    o.yaxis.right = _.extend({}, this.defaults.yaxis.right, o.yaxis.right);

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
  }

});
Charicharts.Pie = Pie;

// Pie constructor.
function Pie() {
  this.init.apply(this, arguments);
  var methods = {};

  if (this._opts.innerArrow) {
    methods.moveArrowTo = this.$scope.moveArrowTo;
  }

  return methods;
}

// Initialize
Pie.prototype.init = function(opts, data) {
  this._opts = this.parseOpts(opts);
  this._data = data;
  h_loadModules.apply(this, [Pie.modules]);
};

// Pie parts dependencies
Pie.modules = [
  // p_events,
  p_svg,
  p_pie,
  p_pieInnerArrow
];

Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 1,
  innerArrow: false,
  innerArrowSize: 0.6
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
  o.radius = Math.min(o.fullWidth, o.fullHeight) / 2;

  return o;
};
/* jshint ignore:start */
  if (typeof define === 'function' && define.amd) {
    define(Charicharts);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = Charicharts;
  }
  this.Charicharts = Charicharts;
}.call(window);
/* jshint ignore:end */
