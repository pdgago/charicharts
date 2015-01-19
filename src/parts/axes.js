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
      ['.%L', function(d) { return d.getUTCMilliseconds(); }],
      // for second boundaries, such as ":45"
      [':%S', function(d) { return d.getUTCSeconds(); }],
      // for minute boundaries, such as "01:23"
      ['%I:%M', function(d) { return d.getUTCMinutes(); }],
      // for hour boundaries, such as "01"
      ['%I', function(d) { return d.getUTCHours(); }],
      // for day boundaries, such as "Mon 7"
      ['%a %d', function(d) { return d.getUTCDay() && d.getUTCDate() !== 1; }],
      // for week boundaries, such as "Feb 06"
      ['%b %d', function(d) { return d.getUTCDate() !== 1; }],
      // for month boundaries, such as "February"
      ['%B', function(d) { return d.getUTCMonth(); }],
      // for year boundaries, such as "2011".
      ['%Y', function() { return true; }]
    ];
    var tickFormat = localeFormatter.timeFormat.utc.multi(customTimeformats);

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.x)
      .orient('bottom')
      .tickSize(14, 0)
      .tickFormat(this.opts.xaxis.bottom.tickFormat || tickFormat);

    if (this.opts.xaxis.ticks) {
      model.axis.ticks.apply(model.axis, this.opts.xaxis.ticks);
    }

    // Render axis
    model.el = this.$svg.append('g')
        .attr('class', 'xaxis bottom')
        .attr('transform', 'translate(0,'+(this.opts.height+1)+')')
        .call(model.axis);

    model.el.selectAll('text')
      .attr('y', 0)
      .attr('x', 6)
      .style('text-anchor', 'start');

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
      .attr('transform', h_getTranslate(-this.opts.margin.left, this.opts.height))
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

    this.$svg.selectAll('.xaxis.bottom .tick text')
      .attr('transform', h_getTranslate(0,4))
      .attr('y', 0)
      .attr('x', 6)
      .style('text-anchor', 'start');

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
