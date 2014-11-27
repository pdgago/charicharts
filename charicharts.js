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
/**
 * Axes Module
 * -----------
 * Add x/y axis.
 * 
 */
var p_axes = PClass.extend({

  deps: [
    'svg',
    'opts',
    'xscale',
    'yscale'
  ],

  _subscriptions: [{
    /**
     * Update the axes when the scales have changed.
     */
    'Scale/updated': function() {
      var axes = this.status.get('axes');
      _.each(axes, this._updateAxis, this);
    }
  }],

  initialize: function() {
    this._initAxesModel();
    _.each(this.status.get('axes'), this._renderAxis, this);
  },

  _renderAxis: function(model, orient) {
    switch(orient) {
      // case 'top': this._renderTop(model); break;
      case 'bottom': this._renderBottom(model); break;
      case 'left': this._renderLeft(model); break;
      case 'right': this._renderRight(model); break;}
    this._afterAxisChanges();
  },

  _renderTop: function(model) {
  },

  _renderBottom: function(model) {
    model.axis = d3.svg.axis()
      .scale(this.xscale)
      .orient('bottom')
      .tickSize(this.opts.height)
      .tickFormat(this.opts.xaxis.bottom.tickFormat);

    model.el = this.svg.append('g')
      .attr('class', 'xaxis bottom')
      .call(model.axis);
  },

  _renderLeft: function(model) {
    model.axis = d3.svg.axis()
      .scale(this.yscale)
      .orient('left')
      .tickSize(-this.opts.width)
      .tickPadding(this.opts.margin.left)
      .tickFormat(this.opts.yaxis.left.tickFormat),

    model.el = this.svg.append('g')
      .attr('class', 'yaxis left')
      .call(model.axis);
  },

  _renderRight: function(model) {
    model.axis = d3.svg.axis()
      .scale(this.yscale)
      .orient('right')
      .tickSize(this.opts.width)
      .tickPadding(0) // defaults to 3
      .tickFormat(this.opts.yaxis.right.tickFormat);

    model.el = this.svg.append('g')
      .attr('class', 'yaxis right')
      .call(model.axis);
  },

  /**
   * Update given axis when the scales changes.
   */
  _updateAxis: function(model, orient) {
    var scale = (orient === 'top' || orient === 'bottom') ?
      this.xscale : this.yscale;

    model.el.transition()
      .duration(500)
      .ease('linear')
      .call(model.axis.scale(scale));

    this._afterAxisChanges(model);
  },

  /**
   * Set axes object in status model.
   */
  _initAxesModel: function() {
    var self = this,
        axes = {};

    var axesEnabled = {
      top: this.opts.xaxis.top.enabled,
      right: this.opts.yaxis.right.enabled,
      bottom: this.opts.xaxis.bottom.enabled,
      left: this.opts.yaxis.left.enabled
    };

    _.each(axesEnabled, function(enabled, orient) {
      if (!enabled) {return;}
      axes[orient] = {};
    });

    this.status.set({axes: axes});
  },

  /**
   * Stuff to do when the axes have been
   * rendered or updated.
   */
  _afterAxisChanges: function(model) {
    // remove domain
    this.svg.select('.yaxis .domain').remove();
    this.svg.select('.xaxis .domain').remove();

    this.svg.selectAll('.yaxis.left text')
      .style('text-anchor', 'start', 'important');

    this.svg.selectAll('.yaxis.right text')
      .style('text-anchor', 'end', 'important')
      .attr('transform', h_getTranslate(this.opts.margin.right, this.opts.yaxis.textMarginTop));

    if (this.opts.yaxis.textMarginTop) {
      this.svg.selectAll('.yaxis.left text')
        .attr('transform', h_getTranslate(0, this.opts.yaxis.textMarginTop));
    }

    // yaxis full grid
    if (this.opts.yaxis.fullGrid) {
      this.svg.selectAll('.yaxis line')
        .attr('transform', h_getTranslate(+this.opts.margin.left ,0))
        .attr('x1', -this.opts.margin.left*2);
    }
  },

});
/**
 * Percentage Bar
 * --------------
 * Add a percentage bar to the supplied svg.
 * 
 */
var p_percentage_bar = PClass.extend({

  deps: [
    'svg',
    'opts',
    'data'
  ],

  initialize: function() {
    this.opts.gridTicks && this._renderGrid();

    switch(this.opts.orientation) {
      case 'vertical': this._renderVertical(); break;
      case 'horizontal': this._renderHorizontal(); break;}

    this._setEvents();

    return {
      path: this.path
    };
  },

  _setEvents: function() {
    var self = this;
    this.path.on('mouseover', function(d) {
      self.path.style('opacity', self.opts.hoverFade);
      d3.select(this).style('opacity', 1);
      self.on('Bar-piece/mouseover', [d]);
    });

    this.svg.on('mouseleave', function() {
      self.path.style('opacity', 1);
    });
  },

  _renderHorizontal: function() {
    var total = d3.sum(_.pluck(this.data, 'value'));
    var x0 = 0;

    var data = _.map(this.data,
      function(d) {
        var v = {
          x0: x0,
          x1: d.value * 100 / total,
          color: d.color
        };
        x0 += v.x1;
        return v;
      });

    this.path = this.svg.selectAll('rect')
        .data(data)
      .enter().append('rect')
        .attr('x', function(d, i) {
          return d.x0 + '%';
        })
        .attr('y', 0)
        .attr('width', function(d) {
          return d.x1 + '%';
        })
        .attr('height', this.opts.fullHeight)
        .style('fill', function(d) {
          return d.color;
        });
  },

  _renderVertical: function() {
    var total = d3.sum(_.pluck(this.data, 'value'));
    var y0 = 0;

    var data = _.map(this.data,
      function(d) {
        var v = {
          y0: y0,
          y1: d.value * 100 / total,
          color: d.color
        };
        y0 += v.y1;
        return v;
      });

    this.path = this.svg.selectAll('rect')
        .data(data)
      .enter().append('rect')
        .attr('x', 0)
        .attr('y', function(d) {
          return d.y0 + '%';
        })
        .attr('width', this.opts.width)
        .attr('height', function(d) {
          return d.y1 + '%';
        })
        .style('fill', function(d) {
          return d.color;
        });
  },

  /**
   * Renders grid on the background.
   */
  _renderGrid: function() {
    var separation = this.opts.fullHeight / (this.opts.gridTicks-1) - 1/this.opts.gridTicks;

    this.grid = this.svg.append('g')
      .attr('transform', h_getTranslate(-this.opts.margin.left, -this.opts.margin.top))
      .attr('class', 'grid');

    for (var i = 0; i < this.opts.gridTicks; i++) {
      this.grid.append('line')
        .attr('x1', 0)
        .attr('x2', this.opts.fullWidth)
        .attr('y1', separation*i)
        .attr('y2', separation*i)
        .attr('stroke', 'red');
    }
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

    this.innerArrow = this.svg.append('svg:line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', this.opts.radius)
      .attr('y2', 0)
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
      self.path.style('opacity', self.opts.hoverFade);
      d3.select(this).style('opacity', 1);
      self.trigger('Pie-piece/mouseover', [d]);
    });

    this.svg.on('mouseleave', function() {
      self.path.style('opacity', 1);
    });
  }

});
/**
 * Scale Module
 * ------------
 * Set X/Y scales from the given data.
 * 
 */
var p_scale = PClass.extend({

  deps: [
    'opts',
    'data'
  ],

  _d3Scales: {
    'time': d3.time.scale.utc,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  },

  _subscriptions: [{
    /**
     * Triggered when the serie gets updated with new data.
     */
    'Serie/update': function() {
      this._setScales();

      // Emit them to all scopes
      this.emit({
        xscale: this.xscale,
        yscale: this.yscale
      });

      this.trigger('Scale/updated', []);
    }
  }],

  initialize: function() {
    this._setScales();
    return {xscale: this.xscale, yscale: this.yscale};
  },

  _getScale: function(position) {
    var opts = this.opts[position + 'axis'],
        domain = this._getExtent(position, opts.fit),
        range = position === 'x' ? [0, this.opts.width] : [this.opts.height, 0];

    return this._d3Scales[opts.scale]()
      .domain(domain)
      .range(range);
      // .nice(); // Extends the domain so that it starts and ends on nice round values.
  },

  _getExtent: function(position, fit) {
    var extent = d3.extent(this._dataFlattened, function(d) {
      return d[position];
    });

    if (fit) {return extent;}

    // Positive scale
    if (extent[0] >= 0) {
      return [0, extent[1]];
    }

    // Negative-Positive scale
    // In this case min an max are the same values.
    var absX = Math.abs(extent[0]);
    var absY = Math.abs(extent[1]);
    var val = (absX > absY) ? absX : absY;
    return [-val, val];
  },

  /**
   * Get this.data flattened of all series.
   * Handy when we need to get the extent.
   */
  _setFlattenedData: function() {
    this._dataFlattened = _.flatten(_.map(this.data, function(d) {
      return d.values;
    }));
  },

  _setScales: function() {
    this._setFlattenedData();
    this.xscale = this._getScale('x');
    this.yscale = this._getScale('y');
  },

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

    _.each(this.data, function(d) {
      self._addSerie(d);
      // setTimeout(function() {
      // }, i*350);
    });

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
      case 'area': this._renderAreaSerie(serie); break;}
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
        case 'area': this._updateAreaSerie(serie); break;}
    }, this));
  },

  /**
   * Render line serie.
   */
  _renderLineSerie: function(serie) {
    var line = this._getLineFunc();

    var path = this.svg.append('path')
      .datum(serie.values)
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-line')
      .attr('stroke', serie.color)
      .attr('type', 'line')
      .attr('active', 1)
      .attr('d', line.interpolate(serie.interpolation));

    //   .call(transition);

    // function transition(path) {
    //   path.transition()
    //     .duration(2000)
    //     .attrTween('stroke-dasharray', tweenDash);
    // }

    // function tweenDash() {
    //   var l = this.getTotalLength(),
    //       i = d3.interpolateString('0,' + l, l + ',' + l);
    //   return function(t) {return i(t);};
    // }

    this.status.get('series')[serie.id] = {
      el: path,
      serie: serie
    };
  },

  /**
   * Update line serie.
   * @param  {Object} el Serie path element
   */
  _updateLineSerie: function(serie) {
    var line = this._getLineFunc();

    serie.el.attr('d', line.interpolate(serie.serie.interpolation))
      .attr('transform', 'translate(0,0)');
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .x(function(d) {
        return self.xscale(d.x);
      })
      .y(function(d) {
        return self.yscale(d.y);
      });
  },

  _renderBarSerie: function(serie) {
    var self = this;
    var barwidth = 12;

    var el = this.svg.append('g')
      .attr('type', 'bar')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-bar')
      .attr('active', 1);

    el.selectAll('rect')
      .data(serie.values)
    .enter().append('rect')
      .attr('class', function(d) {
        return d.y < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        return self.xscale(d.x) - barwidth/2;
      })
      .attr('y', function(d) {
        return d.y < 0 ? self.yscale(0) : self.yscale(d.y);
      })
      .attr('width', barwidth)
      .attr('height', function(d) {
        return Math.abs(self.yscale(d.y) - self.yscale(0));
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
    var barwidth = 12;

    el.selectAll('rect')
      .data(serie.values)
      .attr('class', function(d) {
        return d.y < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        return self.xscale(d.x) - barwidth/2;
      })
      .attr('y', function(d) {
        return d.y < 0 ? self.yscale(0) : self.yscale(d.y) - 1;
      })
      .attr('height', function(d) {
        return Math.abs(self.yscale(d.y) - self.yscale(0));
      });
  },

  _getAreaFunc: function() {
    var self = this;
    return d3.svg.area()
      .x(function(d) {
        return self.xscale(d.x);
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
 * Svg Module
 * ----------
 * Append a svg to the given opts.target.
 * 
 */
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
        .attr('width', this.opts.fullWidth)
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
    // Xaxis Options.
    xaxis: {
      scale: 'time',
      fit: true,
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
          return d;
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
      o.margin.split(' ').map(Number));

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
Charicharts.PercentageBar = CClass.extend({

  modules: [
    p_svg,
    p_percentage_bar
  ],

  getInstanceProperties: function() {
    var methods = {};
    return methods;
  },

  defaults: {
    margin: '0 0 0 0',
    orientation: 'horizontal',
    hoverFade: 0.6,
    gridTicks: 0
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);

    o.margin = _.object(['top', 'right', 'bottom', 'left'],
      o.margin.split(' ').map(Number));

    var responsive = !o.margin.left && !o.margin.right;

    o.fullWidth = responsive ? '100%' : o.target.offsetWidth;
    o.fullHeight = o.target.offsetHeight;

    if (!responsive) {
      o.width = o.fullWidth - o.margin.left - o.margin.right;
    }

    o.height = o.fullHeight - o.margin.top - o.margin.bottom;
    o.gmainTranslate = h_getTranslate(o.margin.left, o.margin.top);
    console.log(o);
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
    margin: '0 0 0 0',
    innerRadius: 0.6,
    hoverFade: 1,
    innerArrow: false,
    innerArrowSize: 0.5
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);
    o.margin = _.object(['top', 'right', 'bottom', 'left'],
      o.margin.split(' ').map(Number));
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
