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
      .ticks.apply(this, this.opts.xaxis.ticks || [])
      .tickFormat(this.opts.xaxis.bottom.tickFormat);

    model.el = this.svg.append('g')
      .attr('class', 'xaxis bottom')
      .call(model.axis);

    this._renderXLabel('bottom');
  },

  _renderLeft: function(model) {
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('left')
      .tickSize(-this.opts.width)
      .tickPadding(this.opts.margin.left)
      .ticks.apply(this, this.opts.yaxis.ticks || [])
      .tickFormat(this.opts.yaxis.left.tickFormat),

    model.el = this.svg.append('g')
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
      .ticks.apply(this, this.opts.yaxis.ticks || [])
      .tickFormat(this.opts.yaxis.right.tickFormat);

    model.el = this.svg.append('g')
      .attr('class', 'yaxis right')
      .call(model.axis);

    this._renderXLabel('right');
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
      top: this.opts.xaxis.top.enabled,
      right: this.opts.yaxis.right.enabled,
      bottom: this.opts.xaxis.bottom.enabled,
      left: this.opts.yaxis.left.enabled
    };

    _.each(axesEnabled, function(enabled, orient) {
      if (!enabled) {return;}
      axes[orient] = {};
    });

    return axes;
  },

  _renderXLabel: function(orient) {
    if (!this.opts.xaxis[orient].label) {return;}
    this.svg.select('.xaxis').append('text')
      .attr('class', 'label')
      .attr('transform', h_getTranslate(0, 0))
      .attr('y', this.opts.margin.bottom - 7)
      .attr('x', 0 -this.opts.margin.left)
      .attr('text-anchor', 'start')
      .text(this.opts.xaxis[orient].label);
  },

  _renderYLabel: function(orient) {
    if (!this.opts.yaxis[orient].label) {return;}
    this.svg.select('.yaxis').append('text')
      .attr('class', 'label')
      .attr('transform', h_getTranslate(0, 0))
      .attr('y', this.opts.yaxis.textMarginTop - 20)
      .attr('x', orient === 'left' ? -this.opts.margin.left :
        this.opts.width + this.opts.margin.right)
      .attr('text-anchor', orient === 'left' ? 'start' : 'end')
      .text(this.opts.yaxis[orient].label);
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
        .attr('transform', h_getTranslate(+this.opts.margin.left , 0))
        .attr('x1', -this.opts.margin.left * 2);
    }

    // add zeroline
    this.svg.selectAll('.yaxis line').each(function(d,i) {
      if (d !== 0) {return;}
      d3.select(this).attr('class', 'zeroline');
    });
  },

});
