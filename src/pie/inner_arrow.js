Pie.prototype.setInnerArrow = function() {
  var self = this,
      opts = this._opts,
      radius = this.$scope.radius * (1 - opts.outerBorder),
      arrowSize = (radius * opts.innerArrowSize * (1 - opts.innerRadius)),
      diameter = radius * (opts.innerRadius) * 2;

  if (diameter < arrowSize) {
    arrowSize = diameter * 0.5;
  }

  // Define arrow
  this.$scope.svg.append('svg:marker')
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
  this.$scope.innerArrow = this.$scope.svg.append('line')
    .attr('class', 'outer-border')
    .style('stroke', 'transparent')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('marker-end', 'url(#innerArrow)');

  // Set mouse move Event
  this.on('mouseover', function(d) {
    moveArrow(d);
  });

  /**
   * Moves the arrow to the given data object.
   * 
   * @param  {Object} d d3 data object appended to the arc.
   */
  function moveArrow(d) {
    var coords = self.$scope.arc.centroid(d),
        angle = h_getAngle(coords[0], coords[1]),
        cos = Math.cos(angle),
        sin = Math.sin(angle),
        x = radius * cos,
        y = radius * sin;

    if (!x || !y) {return;}

    self.$scope.innerArrow
      .attr('x2', x)
      .attr('y2', y);
  }

  this.moveArrowTo = function(id) {
    self.$scope.pieces.each(function(d) {
      if (d.data.id !== id) {return;}
      self.$scope.trigger('mouseover', [d]);
    });
  };

  // Select automatically first pie piece.
  setTimeout(function() {
    var d = self.$scope.pieces.data()[0];
    self.$scope.trigger('mouseover', [d]);
  }, 0);
};