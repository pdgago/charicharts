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
    switch(serie.type) {
      case 'line': serie.path = this._renderLineSerie(serie); break;
      case 'bar': serie.path = this._renderBarSerie(serie); break;
      case 'arearange': serie.path = this._renderAreaRangeSerie(serie); break;
      case 'area': serie.path = this._renderStackedAreaSerie(serie); break;
      case 'constant': serie.path = this._renderConstantSerie(serie); break;}
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
    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());

    var line = this._getLineFunc(),
        path = this.$series.append('path')
          // .datum(serie.values)
          .attr('id', 'serie-' + serie.id)
          .attr('class', 'serie-line')
          .attr('stroke', serie.color)
          .attr('type', 'line')
          .style('opacity', serie.opacity)
          .attr('active', 1);

    path.datum(serie.values);
    path.attr('d', line.interpolate(serie.interpolation));

    d3.select('#serie-' + serie.id + '-dots').remove();

    if (serie.dots) {
      serie.dotsGroup = this.$svg.append('g')
        .attr('id', 'serie-' + serie.id + '-dots')
        .selectAll('.dot');

      serie.dotsGroup = serie.dotsGroup.data(
        serie.values.filter(function(d) {return d.y;}));

      serie.dotsGroup.enter().append('circle')
        .attr('class', 'dot');

      serie.dotsGroup.exit().remove();

      serie.dotsGroup
        .attr('cx', line.x())
        .attr('cy', line.y())
        .attr('fill', serie.color)
        .attr('stroke', serie.color)
        .attr('stroke-width', '2px')
        .attr('r', 3);

    }

    serie.path = path;

    return path;
  },

  /**
   * TODO return area path
   */
  _renderAreaRangeSerie: function(serie) {
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

    serie.path = this.$series.append('path')
      .datum(serie.data[0].values)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', serie.color || '#ccc')
      .attr('opacity', serie.bgOpacity || 0.4);

    return serie.path;
  },

  /**
   * TODO return area path
   * TODO Stacking false
   */
  _renderStackedAreaSerie: function(series) {
    var self = this,
        data = series.data;

    // ID optional
    _.each(series.data, function(serie) {
      serie.id = serie.id || parseInt(_.uniqueId());
    });

    var area = d3.svg.area()
      .x(function(d) { return self.scale.x(d.x); });

    if (series.stacking) {
      var stack = d3.layout.stack()
        .values(function(d) { return d.values; });

      data = stack(series.data);

      area
        .y0(function(d) { return self.scale.y(d.y0); })
        .y1(function(d) { return self.scale.y(d.y + d.y0); });
    } else {
      _.each(series.data, this._renderLineSerie, this);

      area
        .y0(function(d) { return self.scale.y(0); })
        .y1(function(d) { return self.scale.y(d.y); });
    }

    // Fit to new scale
    var extent = d3.extent(series.data[series.data.length - 1].values, function(d) {
      return d.y0 + d.y;
    });

    this.trigger('Scale/update', [{ y: extent }]);

    this.$series.selectAll('g')
        .attr('class', 'area')
        .data(data)
      .enter()
        .append('path')
        .attr('d', function(d) { return area.interpolate(d.interpolation)(d.values); })
        .style('fill', function(d) { return d.color; })
        .style('opacity', function(d) { return d.areaOpacity; });
  },

  _renderConstantSerie: function(serie) {
    var self = this,
        data = {
          label: serie.label
        },
        path, group;

    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());

    data[serie.cteAxis] = serie.value;

    group = this.$series.append('g')
      .datum(data);

    path = group.append('svg:line')
      .attr('id', 'serie-' + serie.id)
      .attr('class', 'serie-constant')
      .attr('stroke', serie.color)
      .style('stroke-width', (serie.strokeWidth || 1) + 'px')
      .attr('type', 'line')
      .attr('active', 1)
      .attr('x1', function(d) {
        return d.x ? self.scale.x(d.x) : self.scale.x.range()[0];
      })
      .attr('x2', function(d) {
        return d.x ? self.scale.x(d.x) : self.scale.x.range()[1];
      })
      .attr('y1', function(d) {
        return d.y ? self.scale.y(d.y) : self.scale.y.range()[0];
      })
      .attr('y2', function(d) {
        return d.y ? self.scale.y(d.y) : self.scale.y.range()[1];
      });

    // Line label
    if (data.label) {
      group.append('text')
        .attr('transform', function(d) {
          var x = serie.cteAxis === 'x' ? self.scale.x(d.x) : self.scale.x.range()[0],
              y = serie.cteAxis === 'y' ? self.scale.y(d.y) : self.scale.y.range()[0];

          // Don't step onto the line
          if (serie.cteAxis === 'x') {
            x -= serie.strokeWidth;
          } else {
            y -= serie.strokeWidth;
          }

          // Offsets
          if (data.label.offset) {
            if (typeof data.label.offset.y === 'string' && data.label.offset.y.match('%')) {
              y += self.opts.height * (parseInt(data.label.offset.y)/100);
            } else if (typeof data.label.offset.y === 'number') {
              y += data.label.offset.y;
            }

            if (typeof data.label.offset.x === 'string' && data.label.offset.x.match('%')) {
              x += self.opts.height * (parseInt(data.label.offset.x)/100);
            } else if (typeof data.label.offset.x === 'number') {
              x += data.label.offset.x;
            }
          }

          return 'translate(' + x + ',' + y + ') ' +
            'rotate(' + (serie.cteAxis === 'y' ? '0' : '-90') + ')';
        })
        .text(data.label.text);
    }

    return path;
  },

  /**
   * Render bar serie. By default it renders bars stacked.
   */
  _renderBarSerie: function(serie) {
    var self = this,
        grouped = serie.grouped,
        // TODO 12 not reasonable. how can we define it?
        barWidth =  12/(!grouped ? serie.data.length : 1);

    // ID optional
    serie.id = serie.id || parseInt(_.uniqueId());

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
        var stackSize = serie.values.length * barWidth;
        _.each(serie.values, function(d) {
            d.y0 = 0;
            d.y1 = d.y;
            d.w = (typeof(xStack[d.x]) === 'number' ? xStack[d.x] : -barWidth*1.5);
            d.w += barWidth;
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

      return bars;
  },

  _getLineFunc: function() {
    var self = this;
    return d3.svg.line()
      .defined(function(d) {return !!d.y;})
      .x(function(d) {return self.scale.x(d.x);})
      .y(function(d) {return self.scale.y(d.y);});
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