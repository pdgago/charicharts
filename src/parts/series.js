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

    _.each(this.data, function(d) {
      self._addSerie(d);
      // setTimeout(function() {
      // }, i*350);
    });

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
      // case 'stacked-bar': this._renderStackedSerie(serie); break;
      case 'area': this._renderAreaSerie(serie); break;}
  },

  /**
   * Update all series.
   */
  updateSeries: function() {
    this.trigger('Serie/update', []);
    var series = this.status.toJSON().series;

    _.each(series, _.bind(function(serie) {
      switch(serie.el.attr('type')) {
        case 'line': this._updateLineSerie(serie); break;
        case 'bar': this._updateBarSerie(serie); break;
        // case 'stacked-bar': this._updateStackedSerie(serie); break;
        case 'area': this._updateAreaSerie(serie); break;}
    }, this));
  },

  /**
   * Render line serie.
   */
  _renderLineSerie: function(serie) {
    var line = this._getLineFunc();

    var path = this.svg.append('path')
      .datum(serie.values)
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-line')
      .attr('stroke', serie.color)
      .attr('type', 'line')
      .attr('active', 1)
      .attr('d', line.interpolate(serie.interpolation));

    //   .call(transition);

    // function transition(path) {
    //   path.transition()
    //     .duration(2000)
    //     .attrTween('stroke-dasharray', tweenDash);
    // }

    // function tweenDash() {
    //   var l = this.getTotalLength(),
    //       i = d3.interpolateString('0,' + l, l + ',' + l);
    //   return function(t) {return i(t);};
    // }

    this.status.get('series')[serie.id] = {
      el: path,
      serie: serie
    };
  },

  /**
   * Update line serie.
   * @param  {Object} el Serie path element
   */
  _updateLineSerie: function(serie) {
    var line = this._getLineFunc();

    serie.el.attr('d', line.interpolate(serie.serie.interpolation))
      .attr('transform', 'translate(0,0)');
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .x(function(d) {
        return self.xscale(d.x);
      })
      .y(function(d) {
        return self.yscale(d.y);
      });
  },

  _renderBarSerie: function(serie) {
    var self = this;
    var barwidth = 12;

    var el = this.svg.append('g')
      .attr('type', 'bar')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-bar')
      .attr('active', 1);

    el.selectAll('rect')
      .data(serie.values)
    .enter().append('rect')
      .attr('class', function(d) {
        return d.y < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        return self.xscale(d.x) - barwidth/2;
      })
      .attr('y', function(d) {
        return d.y < 0 ? self.yscale(0) : self.yscale(d.y);
      })
      .attr('width', barwidth)
      .attr('height', function(d) {
        return Math.abs(self.yscale(d.y) - self.yscale(0));
      })
      .attr('fill', serie.color);

    this.status.get('series')[serie.id] = {
      el: el,
      serie: serie
    };
  },

  _updateBarSerie: function(serie) {
    var self = this;
    var el = serie.el;
    serie = serie.serie;
    var barwidth = 12;

    el.selectAll('rect')
      .data(serie.values)
      .attr('class', function(d) {
        return d.y < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        return self.xscale(d.x) - barwidth/2;
      })
      .attr('y', function(d) {
        return d.y < 0 ? self.yscale(0) : self.yscale(d.y) - 1;
      })
      .attr('height', function(d) {
        return Math.abs(self.yscale(d.y) - self.yscale(0));
      });
  },

  _getAreaFunc: function() {
    var self = this;
    return d3.svg.area()
      .x(function(d) {
        return self.xscale(d.x);
      })
      .y0(this.yscale(0))
      .y1(function(d) {
        return self.yscale(d.value);
      });
  },

  /**
   * Render area serie.
   */
  _renderAreaSerie: function(serie) {
    var area = this._getAreaFunc();
    var el = this.svg.append('path')
      .datum(serie.values)
      .attr('type', 'area')
      .attr('id', 'serie' + serie.id)
      .attr('class', 'serie-area')
      .attr('active', 1)
      .attr('transform', 'translate(0, 0)')
      .attr('fill', function(d) {
        return serie.color;
      })
      .attr('d', area.interpolate(serie.interpolation));

    this.status.get('series')[serie.id] = {
      el: el,
      serie: serie
    };
  },

  /**
   * Update area serie.
   */
  _updateAreaSerie: function(serie) {
    var area = this._getAreaFunc();
    serie.el.attr('d', area.interpolate(serie.serie.interpolation));
  },

  _getSerieById: function(id) {
    return this.svg.select('#serie' + id);
  }

});