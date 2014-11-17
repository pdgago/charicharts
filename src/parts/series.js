var p_series = ['data', 'svg', 'xscale', 'yscale', 'opts',
  function(data, svg, xscale, yscale, opts) {

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
        .attr('fill', function() {
          return serie.color;
        });
    }

    function addStackedBar(serie) {
    }

    _.each(data, function(serie) {
      if (serie.type === 'line') {
        addLineSerie(serie);
      } else if (serie.type ==='bar') {
        addBarSerie(serie);
      } else if (serie.type === 'stacked-bar') {
        addStackedBar(serie);
      }
    });

  }];