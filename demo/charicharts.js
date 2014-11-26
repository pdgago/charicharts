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

    return _.extend(this.getInstanceProperties(), {
      on: this.$scope.on,
      unbind: this.$scope.unbind
    });
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
    this.status = new StatusClass();

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
var StatusClass = Class.extend({

  init: function(attrs) {
    this.attributes = {};
    return this;
  },

  get: function(attr) {
    return this.attributes[attr];
  },

  set: function(attrs) {
    _.extend(this.attributes, attrs);
  },

  toJSON: function() {
    return _.clone(this.attributes);
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
    /**
     * Updates the axes when the scale has been updated.
     */
    'Scale/update': function() {
      // update the series
      this.axis
        .transition()
        .duration(500)
        .ease('linear')
        .call(this.a.scale(this.xscale).orient('bottom'));
    }
  }],

  initialize: function() {
    console.log(this.status);
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
      this._addBottomDomain();
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

    if (orient === 'bottom') {
      this.a = axis;
      this.axis = axisG;
    }

    // Axis ticks texts
    var axisGTexts = axisG.selectAll('text');
    axisGTexts.style('text-anchor', p.textAnchor);

    if (p.axis === 'yaxis') {
      axisGTexts
        .attr('x', orient === 'left' ? -this.opts.margin.left : 0)
        .attr('y', this.opts.yaxis.textMarginTop);
    }

    this.svg.select('.yaxis .domain').remove();
    this.svg.select('.xaxis .domain').remove();

    // // Axis ticks texts
    // if (this.opts[p.axis][orient].label) {
    //   this._setLabel(axisG, this.opts[p.axis][orient].label, orient);
    // }
  },

  _addBottomDomain: function() {
    this.svg.selectAll('.xaxis')
      .append('path')
      .attr('class', 'xaxis-domain')
      .attr('d', 'M{0},0H{1}'.format(-this.opts.margin.left, this.opts.fullWidth));
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
  }

});
/**
 * Pie Inner Arrow
 * ---------------
 * Add an inner arrow into the scope pie.
 * 
 */
var p_pie_inner_arrow = PClass.extend({

  deps: [
    'opts',
    'svg',
    'path',
    'arc'
  ],

  _subscriptions: [{
    'Pie-piece/mouseover': function(d) {
      this._moveArrow(d);
    }
  }, {
    'Pie/updated': function() {
      this._update();
    }
  }],

  initialize: function() {
    if (!this.opts.innerArrow) {return;}
    var self = this;
    this._drawArrow();

    // Move arrow to first piece onload
    setTimeout(function() {
      var d = self.path.data()[0];
      self.moveArrowToId(d.data.id);
    }, 0);

    return {
      moveArrowToId: _.bind(this.moveArrowToId, this)
    };
  },

  /**
   * Draw the arrow!
   */
  _drawArrow: function() {
    var arrowSize = this.opts.radius * this.opts.innerArrowSize * (1 - this.opts.innerRadius);

    // Define arrow
    this.svg.append('svg:marker')
        .attr('id', 'innerArrow')
        .attr('viewBox', '0 {0} {1} {2}'.format(
          -(arrowSize/2), arrowSize, arrowSize))
        .attr('refX', (this.opts.radius * (1-this.opts.innerRadius)) + 5)
        .attr('refY', 0)
        .attr('fill', 'white')
        .attr('markerWidth', arrowSize)
        .attr('markerHeight', arrowSize)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M0,{0}L{1},0L0,{2}'.format(
          -(arrowSize/2), arrowSize, arrowSize/2));

    // Draw arrow
    var x = this.opts.radius * Math.cos(0);
    var y = this.opts.radius * Math.sin(0);

    this.innerArrow = this.svg.append('svg:line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', x)
      .attr('y2', y)
      .attr('class', 'inner-arrow')
      .style('stroke', 'transparent')
      .attr('marker-end', 'url(#innerArrow)');
  },

  /**
   * Move arrow to the given data object.
   */
  _moveArrow: function(d) {
    var coords = this.arc.centroid(d),
        angle = h_getAngle.apply(this, coords),
        rotation = angle * (180/Math.PI);

    this.innerArrow
      .transition()
      .duration(200)
      .attr('transform', 'translate(0) rotate('+ rotation +')');

    this._current = d;
    this.trigger('Pie-arrow/moved', [d]);
  },

  /**
   * Move arrow to the given piece id;
   */
  moveArrowToId: function(id) {
    var self = this;
    this.path.each(function(d) {
      if (d.data.id !== id) {return;}
      self._moveArrow(d);
    });
  },

  /**
   * Update arrow position if the path has changed.
   */
  _update: function() {
    if (!this._current) {return;}
    this.moveArrowToId(this._current.data.id);
  }


});
/**
 * Pie Module
 * ----------
 * Draw a pie into the scope svg with the scope data.
 * 
 */
var p_pie = PClass.extend({

  deps: [
    'svg',
    'opts',
    'data'
  ],

  _subscriptions: [{
  }],

  initialize: function() {
    // Pie layout
    this.pie = d3.layout.pie()
      .value(function(d) {return d.value;})
      .sort(null);

    // Pie arc
    this.arc = d3.svg.arc()
      .innerRadius(this.opts.radius * this.opts.innerRadius)
      .outerRadius(this.opts.radius);

    // Paths
    this.path = this.svg.selectAll('path');
    this.update();

    // Set events
    this._setEvents();

    return {
      update: _.bind(this.update, this),
      path: this.path,
      arc: this.arc
    };
  },

  /**
   * Update the pie.
   */
  update: function() {
    var self = this;
    var data = this.pie(this.data);
    this.path = this.path.data(data);

    this.path.enter().append('path')
      .each(function(d, i) {
        this._current = d; // store the initial values
      })
      .attr('class', 'pie-piece');

    this.path.attr('fill', function(d) {return d.data.color;});
    this.path.exit().remove();

    var n = 0;
    this.path.transition()
      .duration(300)
      .attrTween('d', arcTween)
      .each(function() {++n;})
      .each('end', function() {
        if (!--n) { // when the transitions end
          self.trigger('Pie/updated', []);
        }
      });

    function arcTween(d) {
      var i = d3.interpolate(this._current, d);
      this._current = i(0);
      return function(t) {
        return self.arc(i(t));
      };
    }
  },

  /**
   * Set pie events.
   */
  _setEvents: function() {
    var self = this;

    this.path.on('mouseover', function(d) {
      self.path.exit();
      self.path.style('opacity', self.opts.fadeOpacity);
      d3.select(this).style('opacity', 1);
      self.trigger('Pie-piece/mouseover', [d]);
    });

    this.svg.on('mouseleave', function() {
      self.path.style('opacity', 1);
    });
  }

});
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
    'Serie/update': function() {
      // Update data
      this._dataFlattened = this._getFlattenedData();

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
    this.status.set({series: {}});

    for (var i = 0; i < this.data.length; i++) {
      this._addSerie(this.data[i]);} 

    return {
      updateSeries: _.bind(this.updateSeries, this)
    };
  },

  /**
   * Add the given series to the chart.
   */
  _addSerie: function(serie) {
    switch(serie.type) {
      case 'line': this._renderLineSerie(serie); break;
      case 'bar': this._renderBarSerie(serie); break;
      // case 'stacked-bar': this._renderStackedSerie(serie); break;
      case 'area': this._renderAreaSerie(serie); break;
    }
  },

  /**
   * Update all series.
   */
  updateSeries: function() {
    this.trigger('Serie/update', []);
    var series = this.status.toJSON().series;

    _.each(series, _.bind(function(serie) {
      switch(serie.el.attr('type')) {
        case 'line': this._updateLineSerie(serie); break;
        case 'bar': this._updateBarSerie(serie); break;
        // case 'stacked-bar': this._updateStackedSerie(serie); break;
        case 'area': this._updateAreaSerie(serie); break;
      }
    }, this));
  },

  /**
   * Render line serie.
   */
  _renderLineSerie: function(serie) {
    var line = this._getLineFunc();

    var el = this.svg.append('path')
      .datum(serie.values)
      .attr('type', 'line')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-line')
      .attr('active', 1)
      .attr('transform', 'translate(0, 0)')
      .attr('stroke', serie.color)
      .attr('d', line.interpolate(serie.interpolation));

    this.status.get('series')[serie.id] = {
      el: el,
      serie: serie
    };
  },

  /**
   * Update line serie.
   * @param  {Object} el Serie path element
   */
  _updateLineSerie: function(serie) {
    var line = this._getLineFunc();

    serie.el.attr('d', line.interpolate('linear'))
      .attr('transform', 'translate(0,0)');
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .x(function(d) {
        return self.xscale(d.datetime);
      })
      .y(function(d) {
        return self.yscale(d.value);
      });
  },

  _renderBarSerie: function(serie) {
    var self = this;

    var el = this.svg.append('g')
      .attr('type', 'bar')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-bar')
      .attr('active', 1);

    el.selectAll('rect')
      .data(serie.values)
    .enter().append('rect')
      .attr('class', function(d) {
        return d.value < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        return self.xscale(d.datetime) - self.opts.series.barWidth/2;
      })
      .attr('y', function(d) {
        return d.value < 0 ? self.yscale(0) : self.yscale(d.value);
      })
      .attr('width', self.opts.series.barWidth)
      .attr('height', function(d) {
        return Math.abs(self.yscale(d.value) - self.yscale(0));
      })
      .attr('fill', serie.color);

    this.status.get('series')[serie.id] = {
      el: el,
      serie: serie
    };
  },

  _updateBarSerie: function(serie) {
    var self = this;
    var el = serie.el;
    serie = serie.serie;

    el.selectAll('rect')
      .data(serie.values)
      .attr('class', function(d) {
        return d.value < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        return self.xscale(d.datetime) - self.opts.series.barWidth/2;
      })
      .attr('y', function(d) {
        return d.value < 0 ? self.yscale(0) : self.yscale(d.value) - 1;
      })
      .attr('height', function(d) {
        return Math.abs(self.yscale(d.value) - self.yscale(0));
      });
  },

  _getAreaFunc: function() {
    var self = this;
    return d3.svg.area()
      .x(function(d) {
        return self.xscale(d.datetime);
      })
      .y0(this.yscale(0))
      .y1(function(d) {
        return self.yscale(d.value);
      });
  },

  /**
   * Render area serie.
   */
  _renderAreaSerie: function(serie) {
    var area = this._getAreaFunc();
    var el = this.svg.append('path')
      .datum(serie.values)
      .attr('type', 'area')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-area')
      .attr('active', 1)
      .attr('transform', 'translate(0, 0)')
      .attr('fill', function(d) {
        return serie.color;
      })
      .attr('d', area.interpolate(serie.interpolation));

    this.status.get('series')[serie.id] = {
      el: el,
      serie: serie
    };
  },

  /**
   * Update area serie.
   */
  _updateAreaSerie: function(serie) {
    var area = this._getAreaFunc();
    serie.el.attr('d', area.interpolate(serie.serie.interpolation));
  },

  _getSerieById: function(id) {
    return this.svg.select('#serie' + id);
  }

});
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
        triggerSelect(d3.select(_.first(bars[0])));
      }, 0);
    }

    return {
      drawBar: drawBar
    };
  }
];
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
      update: this.$scope.updateSeries,
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
Charicharts.Pie = CClass.extend({

  modules: [
    p_svg,
    p_pie,
    p_pie_inner_arrow
  ],

  getInstanceProperties: function() {
    var methods = {
      update: this.$scope.update
    };

    if (this.$scope.moveArrowToId) {
      methods.moveArrowToId = this.$scope.moveArrowToId;
    }

    return methods;
  },

  defaults: {
    margin: '0,0,0,0',
    innerRadius: 0.6,
    fadeOpacity: 1,//0.4,
    innerArrow: true,
    innerArrowSize: 0.5
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);
    o.margin = _.object(['top', 'right', 'bottom', 'left'],
      o.margin.split(',').map(Number));
    o.fullWidth = o.target.offsetWidth;
    o.fullHeight = o.target.offsetHeight;
    o.width = o.fullWidth - o.margin.left - o.margin.right;
    o.height = o.fullHeight - o.margin.top - o.margin.bottom;
    o.gmainTranslate = h_getTranslate(o.fullWidth/2, o.fullHeight/2);
    o.radius = Math.min(o.fullWidth, o.fullHeight) / 2;
    return o;
  }

});
/* jshint ignore:start */
  if (typeof define === 'function' && define.amd) {
    define(Charicharts);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = Charicharts;
  }
  this.Charicharts = Charicharts;
}.call(window);
/* jshint ignore:end */
