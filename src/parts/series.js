var p_series = PClass.extend({

  deps: [
    'scale',
  ],

  _subscriptions: [],

  initialize: function() {
    var self = this;
    this._status = {series:{}};

    // before rendering the series, we need to group the bars ones.
    // those are going to be rendered together so they can be
    // stacked or grouped.
    _.each(this.data, this._renderSerie, this);

    return {
      series: {
        update: _.bind(this.updateSeries, this),
        add: _.bind(this.addSerie, this),
        remove: _.bind(this.removeSerie, this)
      }
    };
  },

  /**
   * Add the supplied serie to data array and render it.
   */
  addSerie: function(serie) {
    this.data.push(serie);
    this.trigger('Serie/update', []);
    this._renderSerie(serie);
  },

  /**
   * Remove a serie from the id.
   *
   * @param  {Integer} id
   */
  removeSerie: function(id) {
    var dataObject = _.findWhere(this.data, {id: id});
    this.data.splice(this.data.indexOf(dataObject), 1);
    this._status.series[id].el.remove();
    this._status.series = _.omit(this._status.series, id);
    this.trigger('Serie/update', []);
  },

  /**
   * Render the given series.
   */
  _renderSerie: function(serie) {
    switch(serie.type) {
      case 'line': this._renderLineSerie(serie); break;
      case 'bar': this._renderBarSerie(serie); break;
      case 'area': this._renderAreaSerie(serie); break;}
  },

  /**
   * Update current series.
   */
  updateSeries: function(data) {
    this.setData(data);
    this.trigger('Serie/update', []);
    _.each(this._status.series, _.bind(function(serie) {
      switch(serie.el.attr('type')) {
        case 'line': this._updateLineSerie(serie); break;
        case 'bar': this._updateBarSerie(serie); break;
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

    var serie = {
      el: el,
      data: data
    };

    if (data.dots) {
      serie.dots = this.svg.append('g')
        .attr('id', 'serie-' + data.id + '-dots')
        .selectAll('.dot');
    }

    this._status.series[data.id] = serie;
    this._updateLineSerie(serie);
  },

  _renderAreaSerie: function(serie) {
    var self = this;

    // Render the two lines
    this._renderLineSerie({
      id: serie.data[0].id,
      color: !serie.displayLines ? 'transparent' : serie.color,
      values: serie.data[0].values
    });

    this._renderLineSerie({
      id: serie.data[1].id,
      color: !serie.displayLines ? 'transparent' : serie.color,
      values: serie.data[1].values
    });

    // Draw an area between one and the other Y
    var area = d3.svg.area()
      .x(function(d) { return self.scale.x(d.x); })
      .y0(function(d, i) { return self.scale.y(serie.data[1].values[i].y); })
      .y1(function(d) { return self.scale.y(d.y); });

    this.svg.append('path')
        .datum(serie.data[0].values)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', serie.color || '#ccc')
        .attr('opacity', serie.bgOpacity || 0.4);
  },

  /**
   * Update line serie.
   */
  _updateLineSerie: function(serie) {
    var line = this._getLineFunc();
    serie.el.attr('d', line.interpolate(serie.data.interpolation));

    // Render dots
    if (serie.data.dots) {
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
          .attr('r', 3);
    }
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .defined(function(d) {return !!d.y;})
      .x(function(d) {return self.scale.x(d.x);})
      .y(function(d) {return self.scale.y(d.y);});
  },

  /**
   * Render bar serie. By default it renders bars stacked.
   */
  _renderBarSerie: function(serie) {
    var self = this,
        grouped = serie.grouped,
        // TODO 12 not reasonable. how can we define it?
        barWidth =  12/(!grouped ? serie.data.length : 1);

    // Stacked data
    if (grouped) {
      var positiveStacks = {},
          negativeStacks = {};

      _.each(serie.data, function(serie) {
        _.each(serie.values, function(d) {
            var stacks = d.y >= 0 ? positiveStacks : negativeStacks;

            d.y0 = (stacks[d.x] || 0);
            d.y1 = d.y0 + d.y;
            stacks[d.x] = d.y1;
        });
      });
    // Data side by side
    } else {
      var xStack = {};
      _.each(serie.data, function(serie) {
        _.each(serie.values, function(d) {
            d.y0 = 0;
            d.y1 = d.y;
            d.w = (xStack[d.x] || 0) + barWidth;
            xStack[d.x] = d.w;
        });
      });
    }

    var bars = this.svg.selectAll('.serie-bar')
        .data(serie.data)
      .enter().append('g')
        .attr('class', 'serie-bar')
        .style('fill', function(d) {
          return d.color;
        });

    var rects = bars.selectAll('rect')
        .data(function(d) {return d.values;})
      .enter().append('rect')
        .attr('x', function(d) {
          return self.scale.x(d.x) + (d.w || 0);
        })
        .attr('y', function(d) {
          return self.scale.y(d.y0 < d.y1 ? d.y1 : d.y0);
        })
        .attr('width', barWidth)
        .attr('height', function(d) {
          return self.scale.y(Math.abs(d.y0)) - self.scale.y(Math.abs(d.y1));
        });
  },

  /**
   * Update bar serie.
   */
  _updateBarSerie: function(serie) {

  }

});