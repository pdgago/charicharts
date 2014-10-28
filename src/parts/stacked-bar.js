/**
 * Get d3 path generator Function for bars.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_stacked_bar = ['svg', 'yscale', 'xscale', 'trigger', 'series', 'width',
  function(svg, yscale, xscale, trigger, series, width) {
    /**
     * Draw a bar for the given serie.
     */
    function drawBar(serie) {
      var y0 = 0;

      serie.values.forEach(function(value) {
        value.forEach(function(d) {
          d.y0 = y0;
          d.y1 = y0 += Math.max(0, d.value); // negatives to zero
        });
      });

      var stackedBar = svg.selectAll('stacked-bar')
          .data(serie.values)
        .enter().append('g')
          .attr('transform', function(d) {
            var x;
            if (!xscale) {
              x = (series.align === 'right') ? (width-series.barWidth) : 0;
            } else {
              xscale[d.datetime || d.value];
            }
            return h_getTranslate(x, 0);
          });

      stackedBar.selectAll('rect')
          .data(function(d) {return d;})
        .enter().append('rect')
          .attr('width', series.barWidth)
          .attr('y', function(d) {return yscale(d.y1);})
          .attr('height', function(d) {return yscale(d.y0) - yscale(d.y1);})
          .style('fill', function(d) {return d.color;})
          .on('mouseover', function(d) {
            trigger('mouseoverStackbar', [d]);
          });
    }

    return {
      drawBar: drawBar
    };
}];