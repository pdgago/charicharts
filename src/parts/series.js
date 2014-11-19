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
    this.status.set({series: {}});

    for (var i = 0; i < this.data.length; i++) {
      this._addSerie(this.data[i]);}

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
      case 'area': this._renderAreaSerie(serie); break;
    }
  },

  /**
   * Update all series.
   */
  updateSeries: function() {
    this.trigger('Serie/update', []);
    var series = this.status.toJSON().series;

    _.each(series, _.bind(function(serie) {
      var el = serie.el;

      switch(el.attr('type')) {
        case 'line': this._updateLineSerie(el); break;
        case 'bar': this._updateBarSerie(el); break;
        case 'stacked-bar': this._updateStackedSerie(el); break;
        case 'area': this._updateAreaSerie(el); break;
      }
    }, this));
  },

  /**
   * Render line serie.
   */
  _renderLineSerie: function(serie) {
    var line = this._getLineFunc();

    var lineEl = this.svg.append('path')
      .datum(serie.values)
      .attr('type', 'line')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-line')
      .attr('active', 1)
      .attr('transform', 'translate(0, 0)')
      .attr('stroke', serie.color)
      .attr('d', line.interpolate(serie.interpolation));

    this.status.get('series')[serie.id] = {
      el: lineEl
    };
  },

  /**
   * Update line serie.
   * @param  {Object} el Serie path element
   */
  _updateLineSerie: function(el) {
    var line = this._getLineFunc();

    el.attr('d', line.interpolate('linear'))
      .attr('transform', 'translate(0,0)');
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .x(function(d) {
        return self.xscale(d.datetime);
      })
      .y(function(d) {
        return self.yscale(d.value);
      });
  },

  _renderBarSerie: function(serie) {
    var self = this;
    this.svg.append('g')
      .attr('type', 'bar')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-bar')
      .attr('active', 1)
      .selectAll('rect')
      .data(serie.values)
    .enter().append('rect')
      .attr('class', function(d) {
        return d.value < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        return self.xscale(d.datetime) - self.opts.series.barWidth/2;
      })
      .attr('y', function(d) {
        return d.value < 0 ? self.yscale(0) : self.yscale(d.value) - 1;
      })
      .attr('width', self.opts.series.barWidth)
      .attr('height', function(d) {
        return Math.abs(self.yscale(d.value) - self.yscale(0));
      })
      .attr('fill', serie.color);
  },

  _updateBarSerie: function(el) {

  },

  _getSerieById: function(id) {
    return this.svg.select('#serie' + id);
  }

});