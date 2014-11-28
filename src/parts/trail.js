var p_trail = PClass.extend({

  deps: [
    'svg',
    'opts',
    'xscale',
    'data'
  ],

  _subscriptions: [{
    'Scale/updated': function() {
      // move to xposition
    }
  }],

  initialize: function() {
    if (!this.opts.trail) {return;}
    this._status = {xvalue: null};
    this._renderTrail();
  },

  _renderTrail: function() {
    var trail = this.svg.append('g')
      .attr('class', 'trail');

    // Append marker definition
    var markerdef = this.svg.append('svg:marker')
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

    // Append trail line
    this.trailLine = trail.append('svg:line')
      .attr('class', 'trail-line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', this.opts.height)
        .attr('marker-start', 'url(#trailArrow)');

    this.brush = d3.svg.brush()
      .x(this.xscale)
      .extent([0, 0]);

    this.bisector = d3.bisector(function(d) {
      return d.x;
    }).left;

    // Append slider zone
    this.sliderZone = this.svg.append('g')
      .attr('transform', h_getTranslate(0,0))
      .attr('class', 'trail-slider-zone')
      .call(this.brush);

    this.sliderZone.select('.background')
      .attr('height', this.opts.height)
      .attr('width', this.opts.width)
      .style('cursor', 'pointer');

    this.svg.selectAll('.extent,.resize').remove();
    this._setEvents();
  },

  _setEvents: function() {
    var self = this;
    this.brush.on('brush', function() {
      self._onBrush(this);
    });
  },

  _onBrush: function(event) {
    var xdomain = this.xscale.domain();
    var xvalue;

    if (d3.event.sourceEvent) {
      xvalue = this.xscale.invert(d3.mouse(event)[0]);
    } else {
      xvalue = brush.extent()[0];
    }

    // if the seleted xvalue is outside the domain,
    // select range ones.
    if (xvalue > xdomain[1]) {
      xvalue = xdomain[1];
    } else if (xvalue < xdomain[0]) {
      xvalue = xdomain[0];
    }

    // parse data (this way the user can filter by specific step)
    // eg. months, years, minutes
    xvalue = this.opts.trailParser(xvalue);
    if (this._status.xvalue === xvalue) {return;}
    this._moveToValue(xvalue);
  },

  _moveToValue: function(xvalue) {
    this._status.xvalue = xvalue;
    var xdata = this._getDataFromValue(xvalue);
    var xposition = Math.round(this.xscale(xvalue)) - 1;
    this._moveTrail(xposition);
    this.trigger('Trail/changed', [xdata, xvalue]);
  },

  _getDataFromValue: function(xvalue) {
    return _.map(this.data, function(d) {
      return _.extend(
        d.values[this.bisector(d.values, xvalue)],
        {id: d.id});
    }, this);
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