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
    // Tipo de step viene definido por el minimo rango de las series
    // intervalo es el que cambia segun el ancho del svg

    // Comprobar que el rango es de dates.
    var tickFormat = this.opts.xaxis.bottom.tickFormat; // devolver formato de date enmess, o lo que sea
    var ticks = this.opts.xaxis.ticks || []; // va a ser depende del width del svg, del tamaño del tick, y del rango

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.x)
      .orient('bottom')
      .tickSize(this.opts.height)
      .tickFormat(tickFormat);
    model.axis.ticks.apply(model.axis, ticks);

    // Render axis
    model.el = this.$svg.append('g')
      .attr('class', 'xaxis bottom')
      .call(model.axis);

    // Append baseline
    model.el.append('rect')
      .attr('class', 'baseline')
      .attr('y', this.opts.height)
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

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('right')
      .tickSize(this.opts.width)
      .tickPadding(0) // defaults to 3
      .tickFormat();
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
  }

});

  // var tickCharacters: {
  //   year: 4,
  //   month: 2,
  //   hour: 2
  // };
