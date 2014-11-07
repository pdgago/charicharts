Charicharts.Pie = Pie;

function Pie(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.load = generateInjector(this.$scope);
  this.render();
  return _.omit('$scope', 'call', 'parseOpts', 'render');
}

/**
 * Generate a pie by setting all it parts.
 */
Pie.prototype.render = function() {
  var self = this;

  // Pie size
  this.$scope.radius = Math.min(this._opts.fullWidth, this._opts.fullHeight) / 2;

  // Draw SVG
  this.$scope.svg = this.load(p_svg).draw();

  if (this._opts.outerBorder) {
    this.$scope.svg.append('svg:circle')
      .attr('class', 'outer-border')
      .attr('fill', 'transparent')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', this.$scope.radius);
  }

  // Pie layout
  this.$scope.pieLayout = d3.layout.pie()
    .sort(null)
    .value(function(d) {return d.value;});

  // Pie arc
  var innerPadding = this._opts.outerBorder ? (1 - this._opts.outerBorder) : 1;
  var arcRadius = this.$scope.radius * innerPadding;

  this.$scope.arc = d3.svg.arc()
    .innerRadius(arcRadius - (arcRadius * (1 - this._opts.innerRadius)))
    .outerRadius(arcRadius); 

  // Draw pie
  this.$scope.pieces = this.$scope.svg.selectAll('path')
      .data(this.$scope.pieLayout(this._opts.data))
      .enter()
    .append('path')
    .attr('class', 'pie-piece')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', this.$scope.arc);

  // Mouse over event
  this.$scope.pieces.on('mouseover', function(d) {
    // Fade all paths
    self.$scope.pieces
      .style('opacity', this._opts.fadeOpacity);
    // Highlight hovered
    d3.select(this).style('opacity', 1);
    // Triger over event
    self.$scope.trigger('mouseover', [d]);
  });
  
  // Mouse leave event
  this.$scope.svg.on('mouseleave', function(d) {
    self.$scope.pieces
      .style('opacity', 1);
  });

  if (this._opts.innerArrow) {
    this.setInnerArrow();
  }
};

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
  this.$scope.pieces.on('mouseover', function(d) {
    self.$scope.trigger('mouseover', [d]);
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

  this.$scope.moveArrowTo = function(id) {
    self.$scope.pieces.each(function(d) {
      if (d.data.id !== id) {return;}
      self.$scope.trigger('mouseover', [d]);
      moveArrow(d);
    });
  };

  // Select automatically first pie piece.
  setTimeout(function() {
    var d = self.$scope.pieces.data()[0];
    moveArrow(d);
    self.$scope.trigger('mouseover', [d]);
  }, 0);
};

Pie.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Pie.defaults, opts);

  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));

  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(o.fullWidth/2, o.fullHeight/2);

  return o;
};

/**
 * Defaults pie options.
 */
Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 1,
  innerArrow: false,
  innerArrowSize: 0.6
};