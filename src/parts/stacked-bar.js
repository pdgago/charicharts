/**
 * Get d3 path generator Function for bars.
 *
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_stacked_bar = ['svg', 'xscale', 'yscale', 'trigger', 'series', 'width', 'height', 'on',
  function(svg, xscale, yscale, trigger, series, width, height, on) {

    /**
     * Draw a bar for the given serie.
     */
    function drawBar(serie) {
      serie.values.forEach(function(v) {
        var y0 = 0;

        v.scrutinized.forEach(function(d) {
          d.y0 = y0;
          d.y1 = y0 += Math.max(0, d.value); // Math.max(0, d.value); // negatives to zero
        });

        v.total = v.scrutinized[v.scrutinized.length - 1].y1;
      });

      var stackedBar = svg.selectAll('stacked-bar')
        .data(serie.values)
        .enter().append('g')
        .attr('transform', function(d) {
          var x;

          // Todo => Trick to get a single bar on the right.
          // It's better to have it under Charichart.Bar.
          if (series.stackedBarAlign === 'right') {
            x = width - series.barWidth;
          } else {
            x = xscale(d.datetime);
          }

          return h_getTranslate(x, 0);
        });

      var bars = stackedBar.selectAll('rect')
        .data(function(d) {
          return d.scrutinized;
        })
        .enter().append('rect')
        .attr('id', function(d) {
          return d.id;
        })
        .attr('width', series.barWidth)
        .attr('y', function(d) {
          return yscale(d.y1);
        })
        .attr('height', function(d) {
          return yscale(d.y0) - yscale(d.y1);
        })
        .style('cursor', 'pointer')
        .style('fill', function(d) {
          return d.color;
        })
        .on('mousemove', function(d) {
          trigger('mouseoverStackbar', [d, d3.mouse(this)]);
        });

      // quick thing: refactor this
      on('stackbar-over', function(id) {
        var el = _.filter(bars[0], function(el) {
          return el.id === String(id);
        })[0];
        var centroid = h_getCentroid(d3.select(el));
        d3.select(el).each(function(d) {
          trigger('mouseoverStackbar', [d3.select(el).data()[0], centroid]);
        });
      });

      /**
       * Trigger mouseoverStackbar for the given selection.
       * TODO => This is probably better on the user side, we could
       * return bars array, and the user can do anything he wants.
       * 
       * @param  {Object} selection d3 selection
       */
      function triggerSelect(selection) {
        selection.each(function(d) {
          trigger('mouseoverStackbar', [d, h_getCentroid(selection)]);
        });
      }

      setTimeout(function() {
        triggerSelect(d3.select(_.first(bars[0])));
      }, 0);
    }

    return {
      drawBar: drawBar
    };
  }
];