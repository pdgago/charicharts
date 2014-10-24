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
  var innerPadding = opts.outerBorder ? opts.outerBorder : 1;
  $$.arc = d3.svg.arc()
    .innerRadius(($$.radius * innerPadding) - (($$.radius * innerPadding) * (opts.innerRadius)))
    .outerRadius($$.radius * innerPadding);

  // Draw pie
  $$.svg.selectAll('path')
      .data($$.pieLayout(opts.data))
      .enter()
    .append('path')
    .attr('class', 'line')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .on('mouseover', function(d) {
      $$.svg.selectAll('path')
        .style('opacity', opts.fadeOpacity);

      d3.select(this).style('opacity', 1);
      $$.trigger('mouseover', [d]);
    })
    .attr('d', $$.arc);

  // Inner arrow
  if (opts.innerArrow.enabled) {
      
  }
};

/**
 * Defaults pie options as static object.
 * @type {Object}
 */
Charicharts.Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.22,
  outerBorder: 0.9,
  fadeOpacity: 0.2,
  innerArrow: {
    enabled: false,
    size: 10,
    on: 'mouseover'
  }
};