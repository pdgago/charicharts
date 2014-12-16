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
    // Set scope with core objects populated
    this.$scope = {
      opts: this.parseOptions(opts),
      data: data
    };

    // Set events module into the $scope.
    _.extend(this.$scope, charichartsEvents());
    this._loadModules();

    // Core methods exposed
    return _.extend(this.getInstanceProperties(), {
      on: this.$scope.on,
      trigger: this.$scope.trigger,
      unbind: this.$scope.unbind
    });
  },

  _loadModules: function() {
    for (var i = 0; i < this.modules.length; i++) {
      _.extend(this.$scope, new this.modules[i](this.$scope));
    }
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

  init: function($scope) {
    this._$scope = $scope;
    this._loadModules();
    _.each(this._subscriptions, this._subscribe, this);
    return this.initialize();
  },

  /**
   * Load dependencies modules.
   */
  _loadModules: function() {
    // Populate core modules
    this.$svg = this._$scope.$svg;
    this.opts = this._$scope.opts;
    this.on = this._$scope.on;
    this.trigger = this._$scope.trigger;
    this.data = this._$scope.data;

    for (var i = this.deps.length - 1; i >= 0; i--) {
      this[this.deps[i]] = this._$scope[this.deps[i]];
    }
  },

  /**
   * Subscribe to module events.
   */
  _subscribe: function(subscription) {
    _.each(subscription, _.bind(function(callback, name) {
      this.on(name, _.bind(callback, this));
    },this));
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
    'scale'
  ],

  _subscriptions: [{
    /**
     * Update the axes when the scales have changed.
     */
    'Scale/updated': function() {
      _.each(this._status.axes, this._updateAxis, this);
    }
  }],

  initialize: function() {
    this._status = {
      axes: this._initAxesModel()
    };

    _.each(this._status.axes, this._renderAxis, this);
  },

  _renderAxis: function(model, orient) {
    switch(orient) {
      case 'bottom': this._renderBottom(model); break;
      case 'left': this._renderLeft(model); break;
      case 'right': this._renderRight(model); break;}
    this._afterAxisChanges();
  },

  _renderBottom: function(model) {
    model.axis = d3.svg.axis()
      .scale(this.scale.x)
      .orient('bottom')
      .tickSize(this.opts.height)
      .tickFormat(this.opts.xaxis.bottom.tickFormat);

    model.axis.ticks.apply(model.axis, this.opts.xaxis.ticks || []);

    model.el = this.$svg.append('g')
      .attr('class', 'xaxis bottom')
      .call(model.axis);

    model.el.append('rect')
      .attr('class', 'baseline')
      .attr('y', this.opts.height)
      .attr('x', -this.opts.margin.left)
      .attr('height', 1)
      .attr('width', this.opts.fullWidth);

    this._renderXLabel('bottom');
  },

  _renderLeft: function(model) {
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('left')
      .tickSize(-this.opts.width)
      .tickPadding(this.opts.margin.left)
      .tickFormat(this.opts.yaxis.left.tickFormat);

    model.axis.ticks.apply(model.axis, this.opts.yaxis.ticks || []);

    model.el = this.$svg.append('g')
      .attr('class', 'yaxis left')
      .call(model.axis);

    this._renderYLabel('left');
  },

  _renderRight: function(model) {
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('right')
      .tickSize(this.opts.width)
      .tickPadding(0) // defaults to 3
      .tickFormat(this.opts.yaxis.right.tickFormat);

    model.axis.ticks.apply(model.axis, this.opts.yaxis.ticks || []);

    model.el = this.$svg.append('g')
      .attr('class', 'yaxis right')
      .call(model.axis);

    this._renderYLabel('right');
  },

  /**
   * Update given axis when the scales changes.
   */
  _updateAxis: function(model, orient) {
    var scale = (orient === 'top' || orient === 'bottom') ?
      this.scale.x : this.scale.y;

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
      left: this.opts.yaxis.left.enabled,
      right: this.opts.yaxis.right.enabled,
      top: this.opts.xaxis.top.enabled,
      bottom: this.opts.xaxis.bottom.enabled
    };

    _.each(axesEnabled, function(enabled, orient) {
      if (!enabled) {return;}
      axes[orient] = {};
    });

    return axes;
  },

  _renderXLabel: function(orient) {
    if (!this.opts.xaxis[orient].label) {return;}
    this.$svg.select('.xaxis.' + orient).append('text')
      .attr('class', 'label')
      .attr('transform', h_getTranslate(-this.opts.margin.left, this.opts.height))
      .attr('y', 16)
      .attr('x', 0)
      .attr('text-anchor', 'start')
      .text(this.opts.xaxis[orient].label);
  },

  _renderYLabel: function(orient) {
    if (!this.opts.yaxis[orient].label) {return;}

    this.$svg.select('.yaxis.' + orient).append('text')
      .attr('class', 'label')
      .attr('transform', h_getTranslate(orient === 'left' ? -this.opts.margin.left :
        this.opts.width + this.opts.margin.right, this.opts.yaxis.textMarginTop))
      .attr('y', -20)
      .attr('x', 0)
      .attr('text-anchor', orient === 'left' ? 'start' : 'end')
      .text(this.opts.yaxis[orient].label);
  },

  /**
   * Stuff to do when the axes have been
   * rendered or updated.
   */
  _afterAxisChanges: function(model) {
    // remove domain
    this.$svg.select('.yaxis .domain').remove();
    this.$svg.select('.xaxis .domain').remove();

    this.$svg.selectAll('.yaxis.left .tick text')
      .style('text-anchor', 'start', 'important');

    this.$svg.selectAll('.yaxis.right .tick text')
      .style('text-anchor', 'end', 'important')
      .attr('transform', h_getTranslate(this.opts.margin.right, this.opts.yaxis.textMarginTop));

    if (this.opts.yaxis.textMarginTop) {
      this.$svg.selectAll('.yaxis.left .tick text')
        .attr('transform', h_getTranslate(0, this.opts.yaxis.textMarginTop));
    }

    this.$svg.selectAll('.xaxis.bottom .tick text')
      .attr('transform', h_getTranslate(0,4));

    // yaxis full grid
    if (this.opts.yaxis.fullGrid) {
      this.$svg.selectAll('.yaxis line')
        .attr('transform', h_getTranslate(+this.opts.margin.left , 0))
        .attr('x1', -this.opts.margin.left * 2);
    }

    // add zeroline
    this.$svg.selectAll('.yaxis line').each(function(d,i) {
      if (d !== 0) {return;}
      d3.select(this).attr('class', 'zeroline');
    });
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
  ],

  _subscriptions: [{
  }],


  initialize: function() {
    this.opts.gridTicks && this._renderGrid();

    switch(this.opts.orientation) {
      case 'vertical': this._renderVertical(); break;
      case 'horizontal': this._renderHorizontal(); break;}

    this._setEvents();

    return {
      bar: {
        path: this.path,
        triggerMouseover: _.bind(this.triggerMouseover, this)
      }
    };
  },

  _setEvents: function() {
    var self = this;
    this.path.on('mousemove', function(d) {
      self._onMouseover(this, d);
    });

    this.$svg.on('mouseleave', function() {
      self.path.style('opacity', 1);
    });
  },

  _renderHorizontal: function() {
    var total = d3.sum(_.pluck(this.data, 'value'));
    var x0 = 0;

    var data = _.map(this.data,
      function(d) {
        var v = _.extend(d, {
          x0: x0,
          x1: d.value * 100 / total
        });
        x0 += v.x1;
        return v;
      });

    this.path = this.$svg.selectAll('rect')
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
    var height = (this.opts.margin.top + this.opts.margin.bottom) * 100 / this.opts.height;
    var heightPercent = 100 - height;
    var y0 = 0;

    var data = _.map(this.data,
      function(d) {
        var v = _.extend(d, {
          y0: y0,
          y1: d.value * heightPercent / total
        });
        y0 += v.y1;
        return v;
      });

    this.path = this.$svg.selectAll('rect')
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

    this.grid = this.$svg.append('g')
      .attr('transform', h_getTranslate(-this.opts.margin.left, -this.opts.margin.top))
      .attr('class', 'bargrid');

    for (var i = 0; i < this.opts.gridTicks; i++) {
      this.grid.append('line')
        .attr('x1', 0)
        .attr('x2', this.opts.fullWidth)
        .attr('y1', separation*i)
        .attr('y2', separation*i)
        .attr('stroke', 'red');
    }
  },

  _onMouseover: function(path, d) {
    this.path.style('opacity', this.opts.hoverFade);
    d3.select(path).style('opacity', 1);
    var mouse;

    try {
      mouse = d3.mouse(path);
    } catch(e) {
      mouse = h_getCentroid(d3.select(path));
    }

    this.trigger('Bar-piece/mouseover', [d, mouse]);
  },

  triggerMouseover: function(id) {
    var self = this;

    this.path.each(function(d) {
      if (d.id !== id) {return;}
      self._onMouseover(this, d);
    });
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
    'pie',
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
      var d = self.pie.path.data()[0];
      self.moveToId(d.data.id);
    }, 0);

    return {
      innerArrow: {
        moveTo: _.bind(this.moveToId, this)
      }
    };
  },

  /**
   * Draw the arrow!
   */
  _drawArrow: function() {
    var arrowSize = this.opts.radius * this.opts.innerArrowSize * (1 - this.opts.innerRadius);

    // Define arrow
    this.$svg.append('svg:marker')
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

    this.innerArrow = this.$svg.append('svg:line')
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
    var coords = this.pie.arc.centroid(d),
        angle = h_getAngle.apply(this, coords),
        rotation = angle * (180/Math.PI);

    this.innerArrow
      .transition()
      .duration(200)
      .attr('transform', 'translate(0) rotate('+ rotation +')');

    this._current = d;
  },

  /**
   * Move arrow to the given piece id;
   */
  moveToId: function(id) {
    var self = this;
    this.pie.path.each(function(d) {
      if (d.data.id !== id) {return;}
      self.trigger('Pie-piece/mouseover', [d]);
    });
  },

  /**
   * Update arrow position if the path has changed.
   */
  _update: function() {
    if (!this._current) {return;}
    this.moveToId(this._current.data.id);
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
    this.path = this.$svg.selectAll('path');
    this.update();

    // Set events
    this._setEvents();

    return {
      series: {
        update: _.bind(this.update, this)
      },
      pie: {
        path: this.path,
        arc: this.arc
      }
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

    this.$svg.on('mouseleave', function() {
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
      this._updateScales();
      this.trigger('Scale/updated', []);
    }
  }],

  initialize: function() {
    this._status = {
      // Current scale
      scale: {
        x: null,
        y: null
      }
    };

    this._updateScales();
    return {
      scale: this._status.scale
    };
  },

  _updateScales: function() {
    this._setFlattenedData();
    this._status.scale.x = this._updateScale('x');
    this._status.scale.y = this._updateScale('y');
  },

  _updateScale: function(position) {
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
      if (!d.values) {
        return _.flatten(_.pluck(d.data, 'values'));
      } else {
        return d.values;
      }
    }));
  }

});
var p_series = PClass.extend({

  deps: [
    'scale',
  ],

  _subscriptions: [{
    // 'Data/update': function() {
    //   this.trigger('Serie/update', []);
    //   this.removeSeries();
    //   this.updateSeries();
    // }
  }],

  initialize: function() {
    var self = this;

    // Wrapper
    this.$series = this.$svg.append('g').attr('class', 'series');

    // before rendering the series, we need to group the bars ones.
    // those are going to be rendered together so they can be
    // stacked or grouped.
    _.each(this.data, this._renderSerie, this);

    return {
      series: {
        list: this.data,
        update: _.bind(this.updateSerie, this),
        add: _.bind(this.addSerie, this),
        remove: _.bind(this.removeSerie, this),
        removeAll: _.bind(this.removeSeries, this),
        updateAll: _.bind(this.updateSeries, this),
        toggle: _.bind(this.toggleSerie, this)
      }
    };
  },

  /**
   * Add the supplied serie to data array and render it.
   */
  addSerie: function(serie) {
    this.data.push(serie);
    this.trigger('Serie/update', []);
    this._renderSerie(serie);
  },

  /**
   * Remove a serie from the id.
   *
   * @param  {Integer} id
   */
  removeSerie: function(id) {
    var serie = _.findWhere(this.data, {id: id});

    serie.path.remove();
    this.data.splice(this.data.indexOf(serie), 1);
    this.trigger('Serie/update', []);
  },

  /**
   * Remove all series.
   */
  removeSeries: function() {
    var self = this;

    _.each(this.data, function(serie) {
      serie.path.remove();
    });
    this.data.splice(0, this.data.length);
  },


  /**
   * Render the given series.
   */
  _renderSerie: function(serie) {
    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());

    switch(serie.type) {
      case 'line': this._renderLineSerie(serie); break;
      case 'bar': this._renderBarSerie(serie); break;
      case 'area': this._renderAreaSerie(serie); break;}
  },

  /**
   * Update one serie. It should
   */
  updateSerie: function(id, values) {

  },

  /**
   * Update all series. Removes all current series and add new different ones.
   */
  updateSeries: function(series) {
    var self = this;

    // Removeall + store + render
    this.removeSeries();
    _.each(series, function(serie) {
      self.addSerie(serie);
    });
  },

  /**
   * Render line serie.
   */
  _renderLineSerie: function(serie) {
    var line = this._getLineFunc(),
        path = this.$series.append('path')
          // .datum(serie.values)
          .attr('id', 'serie-' + serie.id)
          .attr('class', 'serie-line')
          .attr('stroke', serie.color)
          .attr('type', 'line')
          .attr('active', 1);

    path.datum(serie.values);
    path.attr('d', line.interpolate(serie.interpolation));
    serie.path = path;

    d3.select('#serie-' + serie.id + '-dots').remove();

    if (serie.dots) {
      serie.dotsGroup = this.$svg.append('g')
        .attr('id', 'serie-' + serie.id + '-dots')
        .selectAll('.dot');

      serie.dotsGroup = serie.dotsGroup.data(
        serie.values.filter(function(d) {return d.y;}));

      serie.dotsGroup.enter().append('circle')
        .attr('class', 'dot');

      serie.dotsGroup.exit().remove();

      serie.dotsGroup
        .attr('cx', line.x())
        .attr('cy', line.y())
        .attr('fill', serie.color)
        .attr('stroke', serie.color)
        .attr('stroke-width', '2px')
        .attr('r', 3);
    }
  },

  _renderAreaSerie: function(serie) {
    var self = this;

    // Render the two lines
    this._renderLineSerie({
      id: serie.data[0].id,
      color: !serie.displayLines ? 'transparent' : serie.color,
      values: serie.data[0].values
    });

    this._renderLineSerie({
      id: serie.data[1].id,
      color: !serie.displayLines ? 'transparent' : serie.color,
      values: serie.data[1].values
    });

    // Draw an area between one and the other Y
    var area = d3.svg.area()
      .x(function(d) { return self.scale.x(d.x); })
      .y0(function(d, i) { return self.scale.y(serie.data[1].values[i].y); })
      .y1(function(d) { return self.scale.y(d.y); });

    this.$series.append('path')
        .datum(serie.data[0].values)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', serie.color || '#ccc')
        .attr('opacity', serie.bgOpacity || 0.4);
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .defined(function(d) {return !!d.y;})
      .x(function(d) {return self.scale.x(d.x);})
      .y(function(d) {return self.scale.y(d.y);});
  },

  /**
   * Render bar serie. By default it renders bars stacked.
   */
  _renderBarSerie: function(serie) {
    var self = this,
        grouped = serie.grouped,
        // TODO 12 not reasonable. how can we define it?
        barWidth =  12/(!grouped ? serie.data.length : 1);

    // Stacked data
    if (grouped) {
      var positiveStacks = {},
          negativeStacks = {};

      _.each(serie.data, function(serie) {
        _.each(serie.values, function(d) {
            var stacks = d.y >= 0 ? positiveStacks : negativeStacks;

            d.y0 = (stacks[d.x] || 0);
            d.y1 = d.y0 + d.y;
            stacks[d.x] = d.y1;
        });
      });
    // Data side by side
    } else {
      var xStack = {};
      _.each(serie.data, function(serie) {
        _.each(serie.values, function(d) {
            d.y0 = 0;
            d.y1 = d.y;
            // Start with 0 and + barWidth
            d.w = (typeof(xStack[d.x]) === 'number' ? xStack[d.x] : (- barWidth)) + barWidth;
            xStack[d.x] = d.w;
        });
      });
    }

    var bars = this.$series.selectAll('.serie-bar')
        .data(serie.data)
      .enter().append('g')
        .attr('class', 'serie-bar')
        .style('fill', function(d) {
          return d.color;
        });

    var rects = bars.selectAll('rect')
        .data(function(d) {return d.values;})
      .enter().append('rect')
        .attr('x', function(d) {
          return self.scale.x(d.x) + (d.w || 0);
        })
        .attr('y', function(d) {
          return self.scale.y(d.y0 < d.y1 ? d.y1 : d.y0);
        })
        .attr('width', barWidth)
        .attr('height', function(d) {
          return self.scale.y(Math.abs(d.y0)) - self.scale.y(Math.abs(d.y1));
        });
  },

  /**
   * Update bar serie.
   */
  _updateBarSerie: function(serie) {
  },

  /**
   * Toggle a serie.
   */
  toggleSerie: function(id) {
    var path = this.$svg.select('#serie-' + id);
    if (path.empty()) {return;}
    var active = Number(path.attr('active')) ? 0 : 1;
    path.attr('active', active);

    path.transition()
      .duration(200)
      .style('opacity', path.attr('active'));
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
  ],

  initialize: function() {
    this.$svg = this.drawSvg();

    return {
      $svg: this.$svg
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
var p_trail = PClass.extend({

  deps: [
    'scale',
  ],

  _subscriptions: [{
    'Scale/updated': function() {
      if (this._status.x) {
        this._moveToValue(this._status.xvalue);
      }
    }
  }],

  initialize: function() {
    var self = this;
    if (!this.opts.trail.enabled) {return;}
    this._status = {xvalue: null, x: null};
    this._renderTrail();

    setTimeout(function() {
      self._moveToValue(self.opts.trail.initXValue(self.scale.x));
    }, 0);
  },

  _renderTrail: function() {
    var trail = this.$svg.append('g')
      .attr('class', 'trail');

    // Append marker definition
    var markerdef = this.$svg.append('svg:marker')
      .attr('id', 'trailArrow')
      .attr('viewBox','0 0 20 20')
      .attr('refX','15')
      .attr('refY','11')
      .attr('markerUnits','strokeWidth')
      .attr('markerWidth','15')
      .attr('markerHeight','11')
      .attr('orient','auto')
      .append('svg:path')
        .attr('class', 'trail-arrow')
        .attr('d','M 0 0 L 20 10 L 0 20 z')
        .attr('fill', '#777');

    // Append trail line
    this.trailLine = trail.append('svg:line')
      .attr('class', 'trail-line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', this.opts.height)
        .attr('marker-start', 'url(#trailArrow)');

    this.brush = d3.svg.brush()
      .x(this.scale.x)
      .extent([0, 0]);

    this.bisector = d3.bisector(function(d) {
      return d.x;
    }).left;

    // Append slider zone
    this.sliderZone = this.$svg.append('g')
      .attr('transform', h_getTranslate(0,0))
      .attr('class', 'trail-slider-zone')
      .call(this.brush);

    this.sliderZone.select('.background')
      .attr('height', this.opts.height)
      .attr('width', this.opts.width)
      .style('cursor', 'pointer');

    this.$svg.selectAll('.extent,.resize').remove();
    this._setEvents();
  },

  _setEvents: function() {
    var self = this;
    this.brush.on('brush', function() {
      self._onBrush(this);
    });
  },

  /**
   * Triggered when the user moves the trail.
   * @param  {Event} event d3 brush event
   */
  _onBrush: function(event) {
    var x;
    if (d3.event.sourceEvent) {
      x = this.scale.x.invert(d3.mouse(event)[0]);
    } else {
      x = brush.extent()[0];
    }
    this._moveToValue(x);
  },

  /**
   * Moves the trail to supplied xvalue.
   */
  _moveToValue: function(xvalue) {
    var xdomain = this.scale.x.domain(),
        isDate = !!xvalue.getMonth;

    // if the seleted x is outside the domain,
    // select range ones.
    if (isDate) {
      if (Date.parse(xvalue) > Date.parse(xdomain[1])) {
        xvalue = xdomain[1];
      } else if (Date.parse(xvalue) < Date.parse(xdomain[0])) {
        xvalue = xdomain[0];
      }
    } else {
      if (xvalue > xdomain[1]) {
        xvalue = xdomain[1];
      } else if (xvalue < xdomain[0]) {
        xvalue = xdomain[0];
      }
    }

    // parse data (this way the user can filter by specific step)
    // eg. months, years, minutes
    xvalue = this.opts.trail.parseStep(xvalue);
    var x = Math.round(this.scale.x(xvalue) -1);
    if (x === this._status.x) {return;} // Return if it's already selected
    var data = this._getDataFromValue(xvalue);
    this._status.x = x;
    this._status.xvalue = xvalue;
    this._moveTrail(x);
    this.trigger('Trail/moved', [data, xvalue]);
  },

  _getDataFromValue: function(xvalue) {
    var self = this;

    return _.map(this.data, function(serie) {
      if (serie.type === 'line') {
        if (!serie.values) {return;}
        return _.extend(serie.values[self.bisector(serie.values, xvalue)],
          {id: serie.id});
      } else if (serie.type === 'bar') {
        return _.map(serie.data, function(d) {
          return _.extend(d.values[self.bisector(d.values, xvalue)],
            {id: d.id});
        });
      }
    });
  },

  /**
   * Move the trail to the given x position.
   *
   * @param  {integer} x
   */
  _moveTrail: function(x) {
    this.trailLine.attr('x1', x).attr('x2', x);
  }

});
Charicharts.Chart = CClass.extend({

  modules: [
    p_svg,
    p_scale,
    p_axes,
    p_series,
    p_trail
  ],

  /**
   * What is going to be returned to the chart instance.
   * @return {Object} Chart properties
   */
  getInstanceProperties: function() {
    return _.pick(this.$scope, 'series');
  },

  defaults: {
    margin: '0 0 0 0',
    trail: {
      enabled: false,
      parseStep: function(xvalue) {
        return xvalue;
      },
      initXValue: function(xscale) {
        return xscale.domain()[1];
      }
    },
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
    o.trail = _.extend({}, this.defaults.trail, o.trail);
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
    return _.pick(this.$scope, 'bar');
  },

  defaults: {
    margin: '0 0 0 0',
    orientation: 'horizontal',
    hoverFade: 1,
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
    return _.pick(this.$scope, 'series', 'innerArrow');
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
