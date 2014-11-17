var p_series = ['data', 'svg', 'xscale', 'yscale', 'opts',
  function(data, svg, xscale, yscale, opts) {

  /**
   * Add line serie.
   */
  function addLineSerie(serie) {
    var line = d3.svg.line()
      .x(function(d) {
        return xscale(d.datetime);
      })
      .y(function(d) {
        return yscale(d.value);
      });

    svg.append('path')
      .attr('id', 'serie' + serie.id)
      .attr('active', 1)
      .attr('class', 'line')
      .attr('transform', 'translate(0, 0)')
      .attr('stroke', serie.color)
      .attr('d', line.interpolate(serie.interpolation)(serie.values));
  }

  /**
   * Add bar serie.
   */
  function addBarSerie(serie) {
    svg.append('g')
      .attr('id', 'serie' + serie.id)
      .attr('active', 1)
      .attr('class', 'bar')
      .selectAll('rect')
      .data(serie.values)
    .enter().append('rect')
      .attr('class', function(d) {
        return d.value < 0 ? 'bar-negative' : 'bar-positive';
      })
      .attr('x', function(d) {
        // TODO: Linear scale support
        return xscale(d.datetime) - opts.series.barWidth/2;
      })
      .attr('y', function(d) {
        return d.value < 0 ? yscale(0) : yscale(d.value) - 1;
      })
      .attr('width', opts.series.barWidth)
      .attr('height', function(d) {
        return Math.abs(yscale(d.value) - yscale(0));
      })
      .attr('fill', serie.color);
  }

  /**
   * Add stacked bar.
   */
  function addStackedSerie(serie) {
  }

  /**
   * Add area serie.
   */
  function addAreaSerie(serie) {
    var area = d3.svg.area()
      .x(function(d) {return xscale(d.datetime);})
      .y0(yscale(0))
      .y1(function(d) {return yscale(d.value);});

    svg.append('path')
      .attr('id', 'serie' + serie.id)
      .attr('active', 1)
      .attr('class', 'serie-area')
      .attr('transform', 'translate(0, 0)')
      .attr('fill', function(d) {
        return serie.color;
      })
      .attr('d', area.interpolate(serie.interpolation)(serie.values));
  }

  function toggleSerie(id) {
    var el = svg.select('#serie' + id);
    if (el.empty()) {return;}
    var active = Number(el.attr('active')) ? 0 : 1;
    el.attr('active', active);

    el.transition()
      .duration(200)
      .style('opacity', el.attr('active'));
  }

  // TODO => When adding a serie, reset axisy and axisx
  function addSerie(serie) {
    if (serie.type === 'line') {
      addLineSerie(serie);
    } else if (serie.type ==='bar') {
      addBarSerie(serie);
    } else if (serie.type === 'stacked-bar') {
      addStackedSerie(serie);
    } else if (serie.type === 'area') {
      addAreaSerie(serie);
    }
  }

  _.each(data, function(serie) {
    addSerie(serie);
  });

  return {
    toggleSerie: toggleSerie,
    addSerie: addSerie
  };

}];