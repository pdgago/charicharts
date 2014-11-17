var p_pie = ['opts', 'svg', 'data', 'trigger', function(opts, svg, data, trigger) {

  // Render outerborder
  if (opts.outerBorder) {
    svg.append('svg:circle')
      .attr('class', 'outer-border')
      .attr('fill', 'transparent')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', opts.radius);
  }

  // Pie layout
  var pieLayout = d3.layout.pie()
    .sort(null)
    .value(function(d) {return d.value;});

  // Pie arc
  var innerPadding = opts.outerBorder ? (1 - opts.outerBorder) : 1;
  var arcRadius = opts.radius * innerPadding;

  var pieArc = d3.svg.arc()
    .innerRadius(arcRadius - (arcRadius * (1 - opts.innerRadius)))
    .outerRadius(arcRadius); 

  // Draw pie
  var piePieces = svg.selectAll('path')
      .data(pieLayout(data))
      .enter()
    .append('path')
    .attr('class', 'pie-piece')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', pieArc);

  // Mouse over event
  piePieces.on('mouseover', function(d) {
    // Fade all paths
    piePieces.style('opacity', opts.fadeOpacity);
    // Highlight hovered
    d3.select(this).style('opacity', 1);
    // Triger over event
    trigger('mouseover', [d]);
  });
  
  // Mouse leave event
  svg.on('mouseleave', function(d) {
    piePieces.style('opacity', 1);
  });

  return {
    pieArc: pieArc,
    piePieces: piePieces
  };
}];