var p_axes = ['svg', 'xscale','yscale', 'xaxis', 'yaxis', 'width', 'height', 'fullWidth', 'margin',
  function(svg, xscale, yscale, xaxis, yaxis, width, height, fullWidth, margin) {
    'use strict';

    var getX = function(orient) {
      var opts = orient === 'bottom' ? xaxis.bottom : xaxis.top;

      var axis = d3.svg.axis()
        .scale(xscale)
        .orient(orient)
        .tickFormat(opts.tickFormat);

      // Apply ticks [] if enabled
      yaxis.ticks && axis.ticks.apply(axis, yaxis.ticks);

      // Draw axis
      svg.append('g')
        .attr('class', 'xaxis ' + orient)
        .attr('transform', h_getTranslate(0, orient === 'bottom' ? height : 0))
        .call(axis)
        .selectAll('text')
          .style('text-anchor', 'middle');

      svg.select('.xaxis .domain')
        .attr('d', 'M{0},0V0H{1}V0'.format(-margin.left, fullWidth));

      // Label
      if (opts.label) {
        svg.select('.yaxis').append('text')
          .attr('class', 'label')
          .attr('transform', h_getTranslate(0, 0))
          .attr('y', height + margin.bottom - 7)
          .attr('x', 0 -margin.left)
          .attr('text-anchor', 'start')
          .text(opts.label);
      }
    };

    var getY = function(orient) {
      var opts = orient === 'left' ? yaxis.left : yaxis.right;

      var axis = d3.svg.axis()
        .scale(yscale)
        .orient('right')
        .tickFormat(opts.tickFormat);

      // Apply ticks [] if enabled
      yaxis.ticks && axis.ticks.apply(axis, yaxis.ticks);

      // Draw axis
      svg.append('g')
        .attr('class', 'yaxis ' + orient)
        .attr('transform', h_getTranslate(orient === 'left' ? 0 : width + margin.right, 0))
        .call(axis)
        .selectAll('text')
          .attr('x', orient === 'left' ? -margin.left : 0)
          .attr('y', yaxis.textMarginTop)
          .style('text-anchor', orient === 'left' ? yaxis.textAnchor : 'end');

      // Grid
      svg.select('.yaxis')
        .selectAll('line')
          .attr('x1', yaxis.fullGrid ? -margin.left : 0)
          .attr('x2', yaxis.fullGrid ? width + margin.right : width)
          // add zeroline class
          .each(function(d) {
            if (d !== 0) {return;}
            d3.select(this).attr('class', 'zeroline');
          });

      // Label
      if (opts.label) {
        svg.select('.yaxis').append('text')
          .attr('class', 'label')
          .attr('transform', h_getTranslate(0, 0))
          .attr('y', yaxis.textMarginTop - 20)
          .attr('x', orient === 'left' ? -margin.left : width + margin.right)
          .attr('text-anchor', orient === 'left' ? 'start' : 'end')
          .text(opts.label);
      }

      svg.select('.yaxis .domain').remove();
    };

    return {
      drawX: function() {
        xaxis.bottom.enabled && getX('bottom');
        xaxis.top.enabled && getX('top');
      },

      drawY: function() {
        yaxis.left.enabled && getY('left');
        yaxis.right.enabled && getY('right');
      }
    };

}];