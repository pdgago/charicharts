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

    _.each(this.data, function(serie) {
      self._addSerie(serie);
    });
  },

  _addSerie: function(serie) {
    if (serie.type === 'line') {
      this._addLineSerie(serie);
    } else if (serie.type ==='bar') {
      this._addBarSerie(serie);
    } else if (serie.type === 'stacked-bar') {
      this._addStackedSerie(serie);
    } else if (serie.type === 'area') {
      this._addAreaSerie(serie);
    }
  },

  _addLineSerie: function(serie, el, update) {
    var self = this;

    var line = d3.svg.line()
      .x(function(d) {
        return self.xscale(d.datetime);
      })
      .y(function(d) {
        return self.yscale(d.value);
      });

    if (update) {
      el
        .attr('d', line.interpolate('linear'))
        .attr('transform', 'translate(0,0)');
      return;
    }

    this.svg.append('path')
      .datum(serie.values)
      .attr('type', 'line')
      .attr('id', 'serie' + serie.id)
      .attr('active', 1)
      .attr('class', 'line')
      .attr('transform', 'translate(0, 0)')
      .attr('stroke', serie.color)
      .attr('d', line.interpolate(serie.interpolation));
  },

  _getSerieById: function(id) {
    return this.svg.select('#serie' + id);
  },

  updateSerie: function(id) {
    var el = this._getSerieById(id);
    var data = el.datum();

    // comunicate through events,
    this.trigger('Serie/update', [data]);

    console.log(this.xscale.domain());

    if (el.attr('type') === 'line') {
      this._addLineSerie(false, el, true);
    }
  },

  getScopeParams: function() {
    return {
      updateSerie: _.bind(this.updateSerie, this)
    };
  }

});