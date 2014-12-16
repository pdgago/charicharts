var p_series = PClass.extend({

  deps: [
    'scale',
  ],

  _subscriptions: [{
    // 'Data/update': function() {
    //   this.trigger('Serie/update', []);
    //   this.removeSeries();
    //   this.updateSeries();
    // }
  }],

  initialize: function() {
    var self = this;

    // Wrapper
    this.$series = this.$svg.append('g').attr('class', 'series');

    // before rendering the series, we need to group the bars ones.
    // those are going to be rendered together so they can be
    // stacked or grouped.
    _.each(this.data, this._renderSerie, this);

    return {
      series: {
        list: this.data,
        update: _.bind(this.updateSerie, this),
        add: _.bind(this.addSerie, this),
        remove: _.bind(this.removeSerie, this),
        removeAll: _.bind(this.removeSeries, this),
        updateAll: _.bind(this.updateSeries, this),
        toggle: _.bind(this.toggleSerie, this)
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
    var serie = _.findWhere(this.data, {id: id});

    serie.path.remove();
    this.data.splice(this.data.indexOf(serie), 1);
    this.trigger('Serie/update', []);
  },

  /**
   * Remove all series.
   */
  removeSeries: function() {
    var self = this;

    _.each(this.data, function(serie) {
      serie.path.remove();
    });
    this.data.splice(0, this.data.length);
  },


  /**
   * Render the given series.
   */
  _renderSerie: function(serie) {
    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());

    switch(serie.type) {
      case 'line': this._renderLineSerie(serie); break;
      case 'bar': this._renderBarSerie(serie); break;
      case 'area': this._renderAreaSerie(serie); break;}
  },

  /**
   * Update one serie. It should
   */
  updateSerie: function(id, values) {

  },

  /**
   * Update all series. Removes all current series and add new different ones.
   */
  updateSeries: function(series) {
    var self = this;

    // Removeall + store + render
    this.removeSeries();
    _.each(series, function(serie) {
      self.addSerie(serie);
    });
  },

  /**
   * Render line serie.
   */
  _renderLineSerie: function(serie) {
    var line = this._getLineFunc(),
        path = this.$series.append('path')
          // .datum(serie.values)
          .attr('id', 'serie-' + serie.id)
          .attr('class', 'serie-line')
          .attr('stroke', serie.color)
          .attr('type', 'line')
          .attr('active', 1);

    path.datum(serie.values);
    path.attr('d', line.interpolate(serie.interpolation));
    serie.path = path;
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

    this.$series.append('path')
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
    this._renderLineSerie(serie);

    // Render dots
    // if (serie.data.dots) {
    //   serie.dots = serie.dots.data(
    //     serie.data.values.filter(function(d) {return d.y;}));

    //   serie.dots.enter().append('circle')
    //     .attr('class', 'dot');

    //   serie.dots.exit().remove();

    //   serie.dots
    //       .attr('cx', line.x())
    //       .attr('cy', line.y())
    //       .attr('fill', serie.data.color)
    //       .attr('stroke', serie.data.color)
    //       .attr('stroke-width', '2px')
    //       .attr('r', 3);
    // }
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
            // Start with 0 and + barWidth
            d.w = (typeof(xStack[d.x]) === 'number' ? xStack[d.x] : (- barWidth)) + barWidth;
            xStack[d.x] = d.w;
        });
      });
    }

    var bars = this.$series.selectAll('.serie-bar')
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
  },

  /**
   * Toggle a serie.
   */
  toggleSerie: function(id) {
    var path = this.$svg.select('#serie-' + id);
    if (path.empty()) {return;}
    var active = Number(path.attr('active')) ? 0 : 1;
    path.attr('active', active);

    path.transition()
      .duration(200)
      .style('opacity', path.attr('active'));
  }

});