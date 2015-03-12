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
    var ticks = this.opts.xaxis.ticks;

    if (ticks) {
      model.axis.ticks.apply(model.axis, ticks);
    } else {
      var domain = this.scale.x.domain();
      var start = domain[0].getTime();
      var end = domain[1].getTime();
      var diff = end - start;
      var minPxStep = 100;
      var width = this.opts.fullWidth;
      var maxValues = Math.ceil(width/minPxStep)+1;
      var tickValues = [];
      var ranges = ['year', 'month', 'day', 'hour', 'minutes'];

      var startDate = moment(start);
      var endDate = moment(end);

      var fillRange = function (start, min, max, range, numValues) {
        var diff = max.diff(min, range);
        var step = Math.ceil(diff/(numValues+1));
        var inserted = 0;

        if (step === 0) {return;}

        while (inserted < numValues &&
          (start.isSame(min) || start.isSame(max) || (start.startOf(range).add(step, range).isBetween(min, max))) &&
          tickValues.length < maxValues) {
          var time = start.toDate().getTime();
          if (tickValues.indexOf(time) === -1) {
            tickValues.push(time);
            inserted++;
          }
          // start.add(step, range);
        }
        return inserted;
      };

      var min = startDate.clone();
      var max = endDate.clone();

      for (var j in ranges) {
        if (_.isString(ranges[j]) && !tickValues.length) {
          fillRange(startDate.clone(), min, max, ranges[j], maxValues);
        }
      }

      var tickValuesCloned = tickValues.slice();
      var numIntervals = tickValues.length;
      var intervalWidth = width/numIntervals;
      var maxValuesRemaining = Math.floor((maxValues - numIntervals)/numIntervals);

      for (var i = 0; i < numIntervals; i++) {
        var minA = moment(tickValuesCloned[i]);
        var minB;
        var inserted = 0;
        var maxValuesPerIntervalPx;
        var maxValuesPerInterval;

        if (tickValuesCloned[i+1]) {
          minB = moment(tickValuesCloned[i+1]);
          maxValuesPerIntervalPx = Math.floor(intervalWidth/minPxStep);
        } else {
          minB = max;
          var stepsize = this.scale.x(new Date(tickValuesCloned[i])) - this.scale.x(new Date(tickValuesCloned[i-1]));
          var lastIntervalWidth = ((minB.toDate().getTime() - minA.toDate().getTime()) * stepsize) / (tickValuesCloned[i] - tickValuesCloned[i-1]);
          maxValuesPerIntervalPx = Math.floor(lastIntervalWidth/minPxStep);
        }
        maxValuesPerInterval = d3.min([maxValuesRemaining, maxValuesPerIntervalPx]);

        for (var k in ranges) {
          if (_.isString(ranges[k]) && !inserted) {
            inserted = fillRange(minA.clone(), minA, minB, ranges[k], maxValuesPerInterval);
          }
        }
      }

      tickValues.sort(function(a, b){return a-b;});
      tickValues = _.map(tickValues, function(a) {return new Date(a);});

      model.axis.tickValues(tickValues);
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
