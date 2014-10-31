/**
 * Get d3 path generator Function for bars.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_stacked_bar = ['svg', 'xscale', 'yscale', 'trigger', 'series', 'width', 'height',
  function(svg, xscale, yscale, trigger, series, width, height) {

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

        v.total = v.scrutinized[v.scrutinized.length-1].y1;
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

      stackedBar.selectAll('rect')
          .data(function(d) {return d.scrutinized;})
        .enter().append('rect')
          .attr('width', series.barWidth)
          .attr('y', function(d) {return yscale(d.y1);})
          .attr('height', function(d) {return yscale(d.y0) - yscale(d.y1);})
          .style('fill', function(d) {return d.color;})
          .on('mousemove', function(d) {
            trigger('mouseoverStackbar', [d, d3.mouse(this)]);
          });
    }

    return {
      drawBar: drawBar
    };
}];