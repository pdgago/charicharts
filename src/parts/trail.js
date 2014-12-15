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

    return _.map(this.data, function(d) {
      if (!d.values) {return;}
      return _.extend(
        d.values[self.bisector(d.values, xvalue)],
        {id: d.id});
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