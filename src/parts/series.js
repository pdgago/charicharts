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
    this._status = {series:{}};
    _.each(this.data, this._addSerie, this);

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
      case 'stacked-bar': this._renderStackedSerie(serie); break;
      case 'area': this._renderAreaSerie(serie); break;}
  },

  /**
   * Update current series.
   */
  updateSeries: function() {
    this.trigger('Serie/update', []);
    _.each(this._status.series, _.bind(function(serie) {
      switch(serie.el.attr('type')) {
        case 'line': this._updateLineSerie(serie); break;
        case 'bar': this._updateBarSerie(serie); break;
        case 'stacked-bar': this._updateStackedSerie(serie); break;
        case 'area': this._updateAreaSerie(serie); break;}
    }, this));
  },

  /**
   * Render line serie.
   */
  _renderLineSerie: function(data) {
    var el = this.svg.append('path')
      .datum(data.values)
      .attr('id', 'serie-' + data.id)
      .attr('class', 'serie-line')
      .attr('stroke', data.color)
      .attr('type', 'line')
      .attr('active', 1);

    var dots = this.svg.append('g')
      .attr('id', 'serie-' + data.id + '-dots')
      .selectAll('.dot');

    var serie = {
      el: el,
      data: data,
      dots: dots
    };

    this._status.series[data.id] = serie;
    this._updateLineSerie(serie);
  },

  /**
   * Update line serie.
   */
  _updateLineSerie: function(serie) {
    var line = this._getLineFunc();
    serie.el.attr('d', line.interpolate(serie.data.interpolation));

    // Append dots data
    serie.dots = serie.dots.data(
      serie.data.values.filter(function(d) {return d.y;}));

    serie.dots.enter().append('circle')
      .attr('class', 'dot');

    serie.dots.exit().remove();

    serie.dots
        .attr('cx', line.x())
        .attr('cy', line.y())
        .attr('fill', serie.data.color)
        .attr('stroke', serie.data.color)
        .attr('stroke-width', '2px')
        .attr('r', this.opts.series.line.dotsRadius);
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .defined(function(d) {return !!d.y;})
      .x(function(d) {return self.xscale(d.x);})
      .y(function(d) {return self.yscale(d.y);});
  }

});