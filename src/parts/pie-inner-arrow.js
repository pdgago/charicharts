/**
 * Pie Inner Arrow
 * ---------------
 * Add an inner arrow into the scope pie.
 *
 */
var p_pie_inner_arrow = PClass.extend({

  deps: [
    'path',
    'arc'
  ],

  _subscriptions: [{
    'Pie-piece/mouseover': function(d) {
      this._moveArrow(d);
    }
  }, {
    'Pie/updated': function() {
      this._update();
    }
  }],

  initialize: function() {
    if (!this.opts.innerArrow) {return;}
    var self = this;
    this._drawArrow();

    // Move arrow to first piece onload
    setTimeout(function() {
      var d = self.path.data()[0];
      self.moveArrowToId(d.data.id);
    }, 0);

    return {
      moveArrowToId: _.bind(this.moveArrowToId, this)
    };
  },

  /**
   * Draw the arrow!
   */
  _drawArrow: function() {
    var arrowSize = this.opts.radius * this.opts.innerArrowSize * (1 - this.opts.innerRadius);

    // Define arrow
    this.svg.append('svg:marker')
        .attr('id', 'innerArrow')
        .attr('viewBox', '0 {0} {1} {2}'.format(
          -(arrowSize/2), arrowSize, arrowSize))
        .attr('refX', (this.opts.radius * (1-this.opts.innerRadius)) + 5)
        .attr('refY', 0)
        .attr('fill', 'white')
        .attr('markerWidth', arrowSize)
        .attr('markerHeight', arrowSize)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M0,{0}L{1},0L0,{2}'.format(
          -(arrowSize/2), arrowSize, arrowSize/2));

    this.innerArrow = this.svg.append('svg:line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', this.opts.radius)
      .attr('y2', 0)
      .attr('class', 'inner-arrow')
      .style('stroke', 'transparent')
      .attr('marker-end', 'url(#innerArrow)');
  },

  /**
   * Move arrow to the given data object.
   */
  _moveArrow: function(d) {
    var coords = this.arc.centroid(d),
        angle = h_getAngle.apply(this, coords),
        rotation = angle * (180/Math.PI);

    this.innerArrow
      .transition()
      .duration(200)
      .attr('transform', 'translate(0) rotate('+ rotation +')');

    this._current = d;
    this.trigger('Pie-arrow/moved', [d]);
  },

  /**
   * Move arrow to the given piece id;
   */
  moveArrowToId: function(id) {
    var self = this;
    this.path.each(function(d) {
      if (d.data.id !== id) {return;}
      self._moveArrow(d);
    });
  },

  /**
   * Update arrow position if the path has changed.
   */
  _update: function() {
    if (!this._current) {return;}
    this.moveArrowToId(this._current.data.id);
  }

});