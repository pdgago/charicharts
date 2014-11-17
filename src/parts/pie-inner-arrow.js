var p_pieInnerArrow = ['opts', 'svg', 'on', 'trigger', 'pieArc', 'piePieces',
  function(opts, svg, on, trigger, pieArc, piePieces) {

    function setArrow() {
      var radius = opts.radius * (1 - opts.outerBorder),
          diameter = radius * (opts.innerRadius) * 2,
          arrowSize;

      if (diameter < arrowSize) {
        arrowSize = diameter * 0.5;
      } else {
        arrowSize = radius * opts.innerArrowSize * (1 - opts.innerRadius);
      }

      // Define arrow
      svg.append('svg:marker')
          .attr('id', 'innerArrow')
          .attr('viewBox', '0 {0} {1} {2}'.format(
            -(arrowSize/2), arrowSize, arrowSize))
          .attr('refX', (radius * (1-opts.innerRadius)) + 5)
          .attr('refY', 0)
          .attr('fill', 'white')
          .attr('markerWidth', arrowSize)
          .attr('markerHeight', arrowSize)
          .attr('orient', 'auto')
        .append('svg:path')
          .attr('d', 'M0,{0}L{1},0L0,{2}'.format(
            -(arrowSize/2), arrowSize, arrowSize/2));

      // Draw arrow
      var innerArrow = svg.append('line')
        .attr('class', 'outer-border')
        .style('stroke', 'transparent')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('marker-end', 'url(#innerArrow)');

      on('mouseover', function(d) {
        arrowPosition(d);
      });

      /**
       * Move arrow to the given d object.
       */
      function arrowPosition(d) {
        var coords = pieArc.centroid(d),
            angle = h_getAngle(coords[0], coords[1]),
            cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = radius * cos,
            y = radius * sin;

        if (!x || !y) {return;}

        innerArrow
          .attr('x2', x)
          .attr('y2', y);
      }

      // Select automatically first pie piece.
      setTimeout(function() {
        var d = piePieces.data()[0];
        trigger('mouseover', [d]);
      }, 0);
    }

    /**
     * Move arrow to the given data object id.
     */
    function moveArrowTo(id) {
      piePieces.each(function(d) {
        if (d.data.id !== id) {return;}
        trigger('mouseover', [d]);
      });
    }

    if (opts.innerArrow) {
      setArrow();
      return {
        moveArrowTo: moveArrowTo
      };
    }
  }];