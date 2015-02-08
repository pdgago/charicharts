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

/**
 * Get diff ms from a date extent.
 *
 * @param  {Array}   extent Date extent array
 * @return {Integer} Returns difference in millisecons
 */
function h_getDateExtentDiff(extent) {
  return extent[1].getTime() - extent[0].getTime();
}

function h_getLocale(locale) {
  return ({
    'en': {
      'decimal': '.',
      'thousands': ',',
      'grouping': [3],
      'currency': ['$', ''],
      'dateTime': '%a %b %e %X %Y',
      'date': '%m/%d/%Y',
      'time': '%H:%M:%S',
      'periods': ['AM', 'PM'],
      'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      'nodata': ['No data available']
    },
    'es': {
      'decimal': ',',
      'thousands': '.',
      'grouping': [3],
      'currency': ['$', ''],
      'dateTime': '%a %b %e %X %Y',
      'date': '%m/%d/%Y',
      'time': '%H:%M:%S',
      'periods': ['AM', 'PM'],
      'days': ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      'shortDays': ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      'months': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      'shortMonths': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      'nodata': ['No hay datos disponibles']
    }
  })[locale || 'en'];
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
      unbind: this.$scope.unbind,
      remove: _.bind(this.remove, this)
    });
  },

  _loadModules: function() {
    for (var i = 0; i < this.modules.length; i++) {
      _.extend(this.$scope, new this.modules[i](this.$scope));
    }
  },

  remove: function() {
    this.$scope.$svg.remove();
    this.$scope.trigger('svg/removed');
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

  _getDataResolution: function() {
    var resolution;

    var getRes = function(valuesList) {
      var res;

      for (var i = valuesList.length - 1; i >= 0; i--) {
        var values = valuesList[i];
        var maxIteration = values.length;
        if (maxIteration > 24) {maxIteration = 24;}

        for (var j = 1; j < maxIteration; j++) {
          var resTmp = values[j].x - values[j-1].x;
          if (!res || resTmp < res) {
            res = resTmp;
          }
        }
      }
      return res;
    };

    _.each(this.data, function(d) {
      var resTmp = getRes(d.values ?
        [d.values] : _.pluck(d.data, 'values'));

      if (!resolution || resTmp < resolution) {
        resolution = resTmp;
      }
    });

    return resolution/1000;
  },

  _renderBottom: function(model) {
    var localeFormatter = d3.locale(h_getLocale(this.opts.locale));
    // The first predicate function that returns true will
    // determine how the specified date is formatted.
    // For more info in time formatting directives go to:
    // https://github.com/mbostock/d3/wiki/Time-Formatting
    var customTimeformats = [
      // milliseconds for all other times, such as ".012"
      ['.%L', function(d) { return d.getMilliseconds(); }],
      // for second boundaries, such as ":45"
      [':%S', function(d) { return d.getSeconds(); }],
      // for minute boundaries, such as "01:23"
      ['%H:%M', function(d) { return d.getMinutes(); }],
      // for hour boundaries, such as "01"
      ['%H', function(d) { return d.getHours(); }],
      // for day boundaries, such as "Mon 7"
      ['%a %d', function(d) { return d.getDay() && d.getDate() !== 1; }],
      // for week boundaries, such as "Feb 06"
      ['%b %d', function(d) { return d.getDate() !== 1; }],
      // for month boundaries, such as "February"
      ['%B', function(d) { return d.getMonth(); }],
      // for year boundaries, such as "2011".
      ['%Y', function() { return true; }]
    ];
    var tickFormat = localeFormatter.timeFormat.multi(customTimeformats);

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.x)
      .orient('bottom')
      .tickSize(this.opts.xaxis.bottom.tickLines ? 14 : 5, 0)
      .tickFormat(this.opts.xaxis.bottom.tickFormat || tickFormat);

    if (this.opts.xaxis.ticks) {
      model.axis.ticks.apply(model.axis, this.opts.xaxis.ticks);
    }

    // Render axis
    model.el = this.$svg.append('g')
        .attr('class', 'xaxis bottom')
        .attr('transform', 'translate(0,'+(this.opts.height+1)+')')
        .call(model.axis);

    if (this.opts.xaxis.bottom.tickLines) {
      model.el.selectAll('text')
        .attr('y', 0)
        .attr('x', 6)
        .style('text-anchor', 'start');
    } else {
      model.el.selectAll('text')
        .attr('y', 9);
    }

    // Append baseline
    model.el.append('rect')
      .attr('class', 'baseline')
      .attr('y', -1)
      .attr('x', -this.opts.margin.left)
      .attr('height', 1)
      .attr('width', this.opts.fullWidth);

    this._renderXLabel('bottom');
  },

  _renderLeft: function(model) {
    var tickFormat = this.opts.yaxis.left.tickFormat;
    var ticks = this.opts.yaxis.ticks || [];

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('left')
      .tickSize(-this.opts.width)
      .tickPadding(this.opts.margin.left)
      .tickFormat(tickFormat);
    model.axis.ticks.apply(model.axis, ticks);

    // Render axis
    model.el = this.$svg.append('g')
      .attr('class', 'yaxis left')
      .call(model.axis);

    this._renderYLabel('left');
  },

  _renderRight: function(model) {
    var tickFormat = this.opts.yaxis.right.tickFormat;
    var ticks = this.opts.yaxis.ticks || [];
    var self = this;

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('right')
      .tickSize(this.opts.width, 10)
      .tickPadding(0) // defaults to 3
      .tickFormat(function(d) {
        if (self.scale.y2) {
          var px = self.scale.y(d);
          var value = Math.round(self.scale.y2.invert(px)).toLocaleString();
          return value;
        }
        return tickFormat(d);
      });
    model.axis.ticks.apply(model.axis, ticks);

    // Render axis
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

    model.el
      // .transition()
      // .duration(500)
      // .ease('linear')
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
      right: this.opts.yaxis.right.enabled || !!this.scale.y2,
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
      .attr('transform', h_getTranslate(-this.opts.margin.left, -4))
      .attr('y', 16)
      .attr('x', 0)
      .attr('text-anchor', 'start')
      .text(this.opts.xaxis[orient].label);
  },

  _renderYLabel: function(orient) {
    var label;
    var scaleUnits = this._$scope.scaleUnits.y;

    if (orient === 'left') {
      scaleUnits = (scaleUnits === 'default') ? false : scaleUnits;
      label = scaleUnits || this.opts.yaxis[orient].label;
    } else if (orient === 'right') {
      label = this._$scope.scaleUnits.y2 || this.opts.yaxis[orient].label;
    }
    if (!label || label === 'default') {return;}

    this.$svg.select('.yaxis.' + orient).append('text')
      .attr('class', 'label')
      .attr('transform', h_getTranslate(orient === 'left' ? -this.opts.margin.left :
        this.opts.width + this.opts.margin.right, this.opts.yaxis.textMarginTop))
      .attr('y', -10)
      .attr('x', 0)
      .attr('text-anchor', orient === 'left' ? 'start' : 'end')
      .text(label);
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

    if (this.opts.xaxis.bottom.tickLines) {
      this.$svg.selectAll('.xaxis.bottom .tick text')
        .attr('transform', h_getTranslate(0,4))
        .attr('y', 0)
        .attr('x', 6)
        .style('text-anchor', 'start');
    } else {
      this.$svg.selectAll('.xaxis.bottom .tick text')
        .attr('y', 9);
    }

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
  }

});

  // var tickCharacters: {
  //   year: 4,
  //   month: 2,
  //   hour: 2
  // };

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
    if (!this.pie) {return;}
    if (!this.opts.innerArrow) {return;}
    var self = this;
    this._drawArrow();

    // Move arrow to first piece onload
    setTimeout(function() {
      var data = self.pie.path.data();
      var firstPiece;

      for (var i = 0; i < data.length; i++) {
        if (data[i].value > 0) {
          firstPiece = data[i];
          break;
        }
      }

      self.moveToId(firstPiece.data.id);
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

    if (d.value > 0) {
      this.innerArrow
        .attr('visibility', 'visible')
        .transition()
        .duration(200)
        .attr('transform', 'translate(0) rotate('+ rotation +')');
    } else {
      this.innerArrow
        .attr('visibility', 'hidden');
    }

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
    var dataSum = d3.sum(this.data, function(d) {
      return d.value >= 0 ? d.value : 0;
    });

    // If the sum is 0, call onNoData callback
    // and stop rendering...
    if (dataSum <= 0) {
      this.opts.onNoData && this.opts.onNoData();
      return;
    }

    // Pie layout
    this.pie = d3.layout.pie()
      .value(function(d) {
        return d.value >= 0 ? d.value : 0;
      })
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
     * TODO serie/updated should be the message
     */
    'Serie/update': function() {
      this._updateScales();
      this.trigger('Scale/updated', []);
    },

    'Scale/update': function(opt_minExtent) {
      this._updateScales(opt_minExtent);
      this.trigger('Scale/updated', []);
    }

  }],

  initialize: function() {
    this._status = {
      // Current scale
      scale: {
        x: null,
        y: null,
        y2: null
      },
      scaleUnits: {
        y: null,
        y2: null
      }
    };

    this._updateScales();
    return {
      scale: this._status.scale,
      scaleUnits: this._status.scaleUnits
    };
  },

  _updateScales: function(opt_minExtent) {
    opt_minExtent = opt_minExtent || {};
    this._setFlattenedData();
    this._status.scale.x = this._updateScale('x', opt_minExtent.x);
    this._status.scale.y = this._updateScale('y', opt_minExtent.y);
    if (this._status.scaleUnits.y2) {
      this._status.scale.y2 = this._updateScale('y2', opt_minExtent.y2);
    }
  },

  _updateScale: function(position, opt_minExtent) {
    var opts = this.opts[position.replace(/\d/, '') + 'axis'];
    var domain = this._getExtent(position, opts.fit, opt_minExtent);
    var range = position === 'x' ? [0, this.opts.width] : [this.opts.height, 0];

    return this._d3Scales[opts.scale]()
      .domain(domain)
      .range(range);
      // .nice(); // Extends the domain so that it starts and ends on nice round values.
  },

  _getExtent: function(position, fit, opt_minExtent) {
    var extent;
    // x axes uses all data
    if (position === 'x') {
      var allData = _.flatten(_.values(this._dataFlattened));
      extent = d3.extent(allData, function(d) {
        return d.x;
      });
    // any y axes uses its own data
    } else {
      var unit = this._status.scaleUnits[position];
      extent = d3.extent(this._dataFlattened[unit], function(d) {
        return d.y1 || d.y;
      });
    }

    // Fix to min extent
    if (opt_minExtent) {
      var min = d3.min([extent[0], opt_minExtent[0]]);
      var max = d3.max([extent[1], opt_minExtent[1]]);
      extent = [min, max];
    }

    // add padding to extent
    var extDiff = extent[1] - extent[0];
    var valDiff = extDiff * 0.05;

    if (extDiff <= 0) {
      valDiff = 1;
    }

    if (position === 'y' && fit) {
      extent[0] = extent[0] - valDiff;
      extent[1] = extent[1] + valDiff;
    }

    // if is fit, return the extent as it is
    if (fit) {
      return extent;
    } else if (extent[0] >= 0) {
      return [0, extent[1]];
    }

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
    var data = {};
    var units = [];

    _.each(this.data, function(d) {
      var values;
      var unit;

      // Single value
      if (d.value) {
        unit = d.unit;
        values = [d.value];
      // More than one values array for the series
      } else if (d.data) {
        unit = d.data[0].unit;
        values = _.flatten(_.pluck(d.data, 'values'));
      // Single values array for the series
      } else if (d.values) {
        unit = d.unit;
        values = d.values;
      // Error warn
      } else {
        console.warn('No present values on series provided.\n_setFlattenedData@scales.js');
      }

      if (!unit) {unit='default';}

      if (values) {
        if (!data[unit]) {
          data[unit] = [];
          // Ordered by order of definition.
          units.push(unit);
        }

        data[unit].push(values);
      }
    });

    var dataFlattened = {};
    _.each(data, function(d,key) {
      dataFlattened[key] = _.flatten(d);
    });
    // var data = _.flatten(_.map(this.data, function(d) {
    //   // Single value
    //   if (d.value) {
    //     return [d.value];
    //   // More than one values array for the series
    //   } else if (d.data) {
    //     return _.flatten(_.pluck(d.data, 'values'));
    //   // Single values array for the series
    //   } else if (d.values) {
    //     return d.values;
    //   // Error warn
    //   } else {
    //     console.warn('No present values on series provided.\n_setFlattenedData@scales.js');
    //   }
    // }));

    var firstUnit = units[0];
    var secondUnit = units[1];
    this._status.scaleUnits['y'] = firstUnit;
    this._status.scaleUnits['y2'] = secondUnit;
    this._dataFlattened = dataFlattened;
    var dataAvailable = (dataFlattened[firstUnit] && dataFlattened[firstUnit].length>0) ||
      (dataFlattened[secondUnit] && dataFlattened[secondUnit].length>0);

    // No data message
    if (!dataAvailable) {
      this.$svg.append('text')
        .attr('text-achor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('x', '40%')
        .attr('y', '40%')
        .attr('font-size', '18px')
        .text(h_getLocale(this.opts.locale)['nodata']);
    }
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
    switch(serie.type) {
      case 'line': serie.path = this._renderLineSerie(serie); break;
      case 'bar': serie.path = this._renderBarSerie(serie); break;
      case 'arearange': serie.path = this._renderAreaRangeSerie(serie); break;
      case 'area': serie.path = this._renderStackedAreaSerie(serie); break;
      case 'constant': serie.path = this._renderConstantSerie(serie); break;}
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
    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());
    var line = this._getLineFunc(serie),
        path = this.$series.append('path')
          // .datum(serie.values)
          .attr('id', 'serie-' + serie.id)
          .attr('class', 'serie-line')
          .attr('stroke', serie.color)
          .attr('type', 'line')
          .style('opacity', serie.opacity)
          .attr('active', 1);

    path.datum(serie.values);
    path.attr('d', line.interpolate(serie.interpolation));

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

    serie.path = path;

    return path;
  },

  /**
   * TODO return area path
   */
  _renderAreaRangeSerie: function(serie) {
    var self = this;
    var yScale = this._getYScale(serie);

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
      .y0(function(d, i) { return yScale(serie.data[1].values[i].y); })
      .y1(function(d) { return yScale(d.y); });

    serie.path = this.$series.append('path')
      .datum(serie.data[0].values)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', serie.color || '#ccc')
      .attr('opacity', serie.bgOpacity || 0.4);

    return serie.path;
  },

  /**
   * TODO return area path
   */
  _renderStackedAreaSerie: function(series) {
    var self = this;
    var data = series.data;
    // Let use the scale of any serie
    var yScale;

    // ID optional
    // _.each(series.data, function(serie) {
    //   serie.id = serie.id || parseInt(_.uniqueId());
    //   yScale = self._getYScale(serie);
    // });

    var area = d3.svg.area()
      .x(function(d) { return self.scale.x(d.x); });

    if (series.stacking) {
      var stack = d3.layout.stack()
        .values(function(d) { return d.values; });

      data = stack(series.data);

      area
        .y0(function(d) { return yScale(d.y0); })
        .y1(function(d) {
          return yScale(d.y + d.y0);
        });
    } else {
      _.each(series.data, this._renderLineSerie, this);

      area
        .y0(function(d) { return yScale(0); })
        .y1(function(d) { return yScale(d.y); });
    }

    // Fit to new scale
    var extent = d3.extent(series.data[series.data.length - 1].values, function(d) {
      return d.y0 + d.y;
    });

    this.trigger('Scale/update', [{ y: extent }]);

    // ID optional
    _.each(series.data, function(serie) {
      serie.id = serie.id || parseInt(_.uniqueId());
      yScale = self._getYScale(serie);
    });

    this.$series.selectAll('g')
        .attr('class', 'area')
        .data(data)
      .enter()
        .insert('path', ':first-child')
        .attr('id', function(d) {
          return 'area-' + d.id;
        })
        .attr('active', 1)
        .attr('d', function(d) { return area.interpolate(d.interpolation)(d.values); })
        .style('fill', function(d) { return d.fill || d.color; })
        .style('opacity', function(d) { return d.areaOpacity; });

    // this.$series.selectAll('g')
    //     .data(data)
    //   .enter()
    //     .append('path')
    //     .style('stroke', function(d) { return '#fff'; })
    //     .style('stroke-opacity', 1)
    //     .attr('d', function(d) {
    //       return d3.svg.line()
    //         .x(function(d) {return d.x;})
    //         .y(function(d) {return d.y0;})
    //         .interpolate(d.interpolation)(d.values);
    //     });
  },

  _renderConstantSerie: function(serie) {
    var self = this;
    var data = {
          label: serie.label
        };
    var path;
    var group;
    var yScale = this._getYScale(serie);

    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());

    data[serie.cteAxis] = serie.value;

    group = this.$series.append('g')
      .datum(data);

    path = group.append('svg:line')
      .attr('id', 'serie-' + serie.id)
      .attr('class', 'serie-constant')
      .attr('stroke', serie.color)
      .style('stroke-width', (serie.strokeWidth || 1) + 'px')
      .attr('type', 'line')
      .attr('active', 1)
      .attr('x1', function(d) {
        return d.x ? self.scale.x(d.x) : self.scale.x.range()[0];
      })
      .attr('x2', function(d) {
        return d.x ? self.scale.x(d.x) : self.scale.x.range()[1];
      })
      .attr('y1', function(d) {
        return d.y ? yScale(d.y) : yScale.range()[0];
      })
      .attr('y2', function(d) {
        return d.y ? yScale(d.y) : yScale.range()[1];
      });

    // Line label
    if (data.label) {
      group.append('text')
        .attr('transform', function(d) {
          var x = serie.cteAxis === 'x' ? self.scale.x(d.x) : self.scale.x.range()[0],
              y = serie.cteAxis === 'y' ? yScale(d.y) : yScale.range()[0];

          // Don't step onto the line
          if (serie.cteAxis === 'x') {
            x -= serie.strokeWidth;
          } else {
            y -= serie.strokeWidth;
          }

          // Offsets
          if (data.label.offset) {
            if (typeof data.label.offset.y === 'string' && data.label.offset.y.match('%')) {
              y += self.opts.height * (parseInt(data.label.offset.y)/100);
            } else if (typeof data.label.offset.y === 'number') {
              y += data.label.offset.y;
            }

            if (typeof data.label.offset.x === 'string' && data.label.offset.x.match('%')) {
              x += self.opts.height * (parseInt(data.label.offset.x)/100);
            } else if (typeof data.label.offset.x === 'number') {
              x += data.label.offset.x;
            }
          }

          return 'translate(' + x + ',' + y + ') ' +
            'rotate(' + (serie.cteAxis === 'y' ? '0' : '-90') + ')';
        })
        .text(data.label.text);
    }

    return path;
  },

  /**
   * Render bar serie. By default it renders bars stacked.
   */
  _renderBarSerie: function(serie) {
    var self = this;
    var grouped = serie.grouped;
    var barWidth = Math.floor(this._getBarWidth(serie));
    var yScale = this._getYScale(serie);

    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());

    // Stacked data
    if (grouped) {
      var positiveStacks = {},
          negativeStacks = {};

      _.each(serie.data, function(serie) {
        _.each(serie.values, function(d) {
            var stacks = d.y >= 0 ? positiveStacks : negativeStacks;

            d.y0 = (stacks[d.x] || 0);
            d.y1 = d.y0 + d.y;
            d.w = -barWidth/2;
            stacks[d.x] = d.y1;
        });
      });
    // Data side by side
    } else {
      var xStack = {};
      _.each(serie.data, function(serie) {
        var stackSize = serie.values.length * barWidth;
        _.each(serie.values, function(d) {
            d.y0 = 0;
            d.y1 = d.y;
            d.w = (typeof(xStack[d.x]) === 'number' ? xStack[d.x] : -barWidth*1.5);
            d.w += barWidth;
            xStack[d.x] = d.w;
        });
      });
    }

    // Force update the scale, because we changed y values for the stacked.
    this.trigger('Scale/update', []);

    // update the la scala, que trigereara un update del axis,
    // pero la scala ahora no tiene que coger d.y, tiene que coger d.y1

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
          return yScale(d.y0 < d.y1 ? d.y1 : d.y0);
        })
        .attr('width', barWidth)
        .attr('height', function(d) {
          return yScale(Math.abs(d.y0)) - yScale(Math.abs(d.y1));
        });

      return bars;
  },

  _getLineFunc: function(serie) {
    var self = this;
    var yScale = this._getYScale(serie);

    return d3.svg.line()
      .defined(function(d) {return !!d.y;})
      .x(function(d) {return self.scale.x(d.x);})
      .y(function(d) {return yScale(d.y);});
  },

  _getYScale: function(serie) {
    return !serie.unit || this._$scope.scaleUnits['y'] === serie.unit ?
      this.scale.y : this.scale.y2;
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
    var area = this.$svg.select('#area-' + id);

    if (!area.empty()) {
      area.attr('active', Number(area.attr('active')) ? 0 : 1);
      area.transition()
        .duration(200)
        .style('opacity', area.attr('active'));
    }

    if (!path.empty()) {
      path.attr('active', Number(path.attr('active')) ? 0 : 1);
      path.transition()
        .duration(200)
        .style('opacity', path.attr('active'));
    }
  },

  /**
   * For bar series, get the width of them.
   *
   * @param  {Object}  serie
   * @return {Integer} Bar width
   */
  _getBarWidth: function(serie) {
    var maxBarWidth = 13, barWidth, serieLength;

    // Stacked bar
    if (serie.grouped) {
      serieLength = d3.max(_.map(serie.data, function(d) {
        return d.values.length;
      }));

      barWidth = (this.opts.width / serieLength) - 2;
    // Side by side
    } else {
      barWidth = maxBarWidth/serie.data.length;
    }

    // // Check the barWidth is not bigger than the maximun permited
    // if (barWidth > maxBarWidth) {
    //   barWidth = maxBarWidth;
    // }
    //
    if (barWidth < 1) {
      barWidth = 1;
    }

    return barWidth;
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

    var markerHeight = 11;

    // Append marker definition
    var markerdef = this.$svg.append('svg:marker')
      .attr('id', 'trailArrow')
      .attr('viewBox','0 0 20 20')
      .attr('refX','20')
      .attr('refY',markerHeight)
      .attr('markerUnits','strokeWidth')
      .attr('markerWidth','15')
      .attr('markerHeight',markerHeight)
      .attr('orient','auto')
      .append('svg:path')
        .attr('class', 'trail-arrow')
        .attr('d','M 0 0 L 20 10 L 0 20 z')
        .attr('fill', '#777');

    // Append trail line
    this.trailLine = trail.append('svg:line')
      .attr('class', 'trail-line')
        .attr('x1', this.opts.width)
        .attr('x2', this.opts.width)
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
      .attr('transform', h_getTranslate(0,-markerHeight))
      .attr('class', 'trail-slider-zone')
      .call(this.brush);

    this.sliderZone.select('.background')
      .attr('height', this.opts.fullHeight)
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
    var x = Math.round(this.scale.x(xvalue));
    if (x === this._status.x) {return;} // Return if it's already selected
    var data = this._getDataFromValue(xvalue);
    this._status.x = x;
    this._status.xvalue = xvalue;
    this._moveTrail(x);
    this.trigger('Trail/moved', [data, xvalue]);
  },

  _getDataFromValue: function(xvalue) {
    var self = this;
    var trailData = _.map(this.data, function(serie) {
      var value;

      if (serie.type === 'line') {
        var index = self.bisector(serie.values, xvalue) - 1;
        if (index < 0) {index=0;}

        value = serie.values[index];
        if (!value) {
          value = {x: null, y: null};
        }
        return _.extend({}, value, {id: serie.id}, _.omit(serie, 'values', 'path'));
      } else if (serie.type === 'bar' || serie.type === 'area') {
        return _.map(serie.data, function(d) {
          return _.extend(d.values[self.bisector(d.values, xvalue)],
            {id: d.id}, _.omit(d, 'values'));
        });
      }
    });

    return trailData;
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
    locale: 'en',
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
        tickFormat: null
      },
      bottom: {
        enabled: true,
        label: false,
        tickLines: false,
        ticks: null,
        // TICKS EXAMPLE
        // ['days', 2]
        tickFormat: null
        // TICKFORMAT EXAMPLE
        // tickFormat: [
        //   // milliseconds for all other times, such as ".012"
        //   ['.%L', function(d) { return d.getUTCMilliseconds(); }],
        //   // for second boundaries, such as ":45"
        //   [':%S', function(d) { return d.getUTCSeconds(); }],
        //   // for minute boundaries, such as "01:23"
        //   ['%I:%M', function(d) { return d.getUTCMinutes(); }],
        //   // for hour boundaries, such as "01"
        //   ['%I', function(d) { return d.getUTCHours(); }],
        //   // for day boundaries, such as "Mon 7"
        //   ['%a %d', function(d) { return d.getUTCDay() && d.getUTCDate() !== 1; }],
        //   // for week boundaries, such as "Feb 06"
        //   ['%b %d', function(d) { return d.getUTCDate() !== 1; }],
        //   // for month boundaries, such as "February"
        //   ['%B', function(d) { return d.getUTCMonth(); }],
        //   // for year boundaries, such as "2011".
        //   ['%Y', function() { return true; }]
        // ]
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
        width: 10,
        tickFormat: function(d) {
          return d;
        }
      },
      right: {
        enabled: false,
        label: false,
        width: 10,
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
