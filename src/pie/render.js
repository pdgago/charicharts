Pie.prototype.render = function() {
  var self = this;

  // Pie size
  this.$scope.radius = Math.min(this._opts.fullWidth, this._opts.fullHeight) / 2;

  // Draw SVG
  this.$scope.svg = this.call(p_svg).draw();

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
      .style('opacity', self._opts.fadeOpacity);
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