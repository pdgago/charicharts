/**
 * Pie events:
 *   mouseover - mouseover over the paths
 */
Charicharts.Pie = function pie(options) {
  // Set options
  this._options = h_parseOptions(_.extend({}, Charicharts.Pie.defaults, options));
  this._options.series = _.extend({}, Charicharts.Pie.defaults.innerArrow, options.innerArrow);
  // Set $scope
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  // Generate loader for the scope
  this.load = generateInjector(this.$scope);
  // Initialize the Pie
  this.init();
  // Return handy stuff to the instance
  return _.pick(this.$scope, 'on');
};

/**
 * Generate a pie by setting all it parts.
 */
Charicharts.Pie.prototype.init = function() {
  // Shortcuts
  var $$ = this.$scope;
  var opts = this._options;

  // Pie size
  $$.radius = Math.min(opts.fullWidth, opts.fullHeight) / 2;

  // Draw SVG
  $$.svg = this.load(p_svg)
    .draw(h_getTranslate(opts.fullWidth/2, opts.fullHeight/2));

  if (opts.outerBorder) {
    $$.svg.append('svg:circle')
      .attr('class', 'outer-border')
      .attr('fill', 'transparent')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', $$.radius);
  }

  // Pie layout
  $$.pieLayout = d3.layout.pie()
    .sort(null)
    .value(function(d) {return d.value;});

  // Pie arc
  var innerPadding = opts.outerBorder ? (1 - opts.outerBorder) : 1;
  var arcRadius = $$.radius * innerPadding;

  $$.arc = d3.svg.arc()
    .innerRadius(arcRadius - (arcRadius * (1 - opts.innerRadius)))
    .outerRadius(arcRadius); 

  // Draw pie
  $$.pieces = $$.svg.selectAll('path')
      .data($$.pieLayout(opts.data))
      .enter()
    .append('path')
    .attr('class', 'pie-piece')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', $$.arc);

  // Mouse over event
  $$.pieces.on('mouseover', function(d) {
    // Fade all paths
    $$.pieces
      .style('opacity', opts.fadeOpacity);
    // Highlight hovered
    d3.select(this).style('opacity', 1);
    // Triger over event
    $$.trigger('mouseover', [d]);
  });
  
  // Mouse leave event
  $$.svg.on('mouseleave', function(d) {
    $$.pieces
      .style('opacity', 1);
  });

  if (opts.innerArrow) {
    this.setInnerArrow();
  }
};

Charicharts.Pie.prototype.setInnerArrow = function() {
  var opts = this._options;
  var $$ = this.$scope;
  var self = this;

  var radius = $$.radius * (1 - opts.outerBorder);
  var arrowSize = (radius * opts.innerArrowSize * (1 - opts.innerRadius));
  var diameter = radius * (opts.innerRadius) * 2;

  if (diameter < arrowSize) {
    arrowSize = diameter * 0.5;
  }

  // Define arrow
  $$.svg.append('svg:marker')
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
  $$.innerArrow = $$.svg.append('line')
    .attr('class', 'outer-border')
    .style('stroke', 'transparent')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('marker-end', 'url(#innerArrow)');

  // Set mouse move Event
  $$.pieces.on('mousemove', function() {
    var mouse = d3.mouse(this);
    var angle = h_getAngle(mouse[0], mouse[1]);
    moveArrow(angle);
  });

  function moveArrow(angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var x = radius * cos;
    var y = radius * sin;
    if (!x || !y) {return;}

    $$.innerArrow
      .attr('x2', x)
      .attr('y2', y);
  }

  function triggerSelect(selection) {
    selection.each(function(d) {
      $$.trigger('mouseover', [d]);
    });
    var centroid = h_getCentroid(selection);
    moveArrow(h_getAngle.apply(this, centroid));
  }

  setTimeout(function() {
    triggerSelect(d3.select($$.pieces[0][0]));
  }, 0);
};

/**
 * Defaults pie options as static object.
 * @type {Object}
 */
Charicharts.Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 1,
  innerArrow: false,
  innerArrowSize: 0.6
};