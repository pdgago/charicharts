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
        var index = self.bisector(serie.values, xvalue);
        if (index < 0) {index=0;}

        value = serie.values[index];
        if (!value) {
          value = {x: null, y: null};
        }
        return _.extend({}, value, {id: serie.id}, _.omit(serie, 'values', 'path'));
      } else if (serie.type === 'bar' || serie.type === 'area') {
        return _.map(serie.data, function(d) {
          var values = d.values[self.bisector(d.values, xvalue)];
          if (!values) {values = {x: null, y: null};}
          return _.extend(values, {id: d.id}, _.omit(d, 'values'));
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
