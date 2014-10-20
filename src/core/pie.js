Charicharts.pie = function pie(options) {
  this._options = h_parseOptions(_.extend(options, this.constructor.defaults));
  _.extend(this, Charicharts.Events(this));
  this.init();
  return this;
};

/**
 * Generate a pie by setting all it parts.
 */
Charicharts.pie.prototype.init = function() {
  var opts = this._options;

  var width = opts.width + opts.margin.left + opts.margin.right;
  var height = opts.height + opts.margin.top + opts.margin.bottom;
  var radius = Math.min(opts.width, opts.height) / 2;

  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('class', 'g-main')
      .attr('transform', h_getTransform(width/2, height/2));

  svg.append('svg:circle')
    .attr('class', 'outer-circle')
    .attr('fill', 'transparent')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius);

  var pieLayout = d3.layout.pie()
    .value(function(d) {return d.value || 100 / opts.data.length;});

  var arc = d3.svg.arc()
    .innerRadius((radius * 0.90) - (opts.width * opts.innerRadius))
    .outerRadius(radius * 0.90);

  svg.selectAll('path')
      .data(pieLayout(opts.data))
      .enter()
    .append('path')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', arc);
};

/**
 * Defaults pie options as static object.
 * @type {Object}
 */
Charicharts.pie.defaults = {
  innerRadius: 0.22,
  margin: '0,0,0,0'
};