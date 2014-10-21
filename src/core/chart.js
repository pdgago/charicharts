Charicharts.chart = function chart(options) {
  this._options = h_parseOptions(_.extend({}, this.constructor.defaults, options));
  _.extend(this, Charicharts.Events(this));
  this.init();
  return this;
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.chart.prototype.init = function() {
  var opts = this._options;
  var inject = generateInjector(this);

  // Draw svg
  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.margin.left, opts.margin.top));

  this.svg = svg;

  // Set scales
  var scales = p_scale(_.pick(opts, 'width', 'height', 'xaxis', 'yaxis', 'data'));
  var xscale = scales[0];
  var yscale = scales[1];

  this.scales = scales;
  this.xscale = xscale;
  this.yscale = yscale;
  this.width = this._options.width;
  this.height = this._options.height;

  // Set axes
  var xaxis, yaxis;
  if (opts.xaxis.display) {
    xaxis = p_axes_getX(xscale,
      _.pick(opts.xaxis, 'orient', 'tickFormat'));
  }

  if (opts.yaxis.display) {
    yaxis = p_axes_getY(yscale,
      _.extend(_.pick(opts.yaxis, 'orient', 'tickFormat'), {width: opts.width}));
  }

  // Draw axis
  if (xaxis) {
    svg.append('g')
      .attr('class', 'xaxis')
      .attr('transform', h_getTranslate(0, opts.height))
      .call(xaxis)
      .selectAll('text')
        .style('text-anchor', 'middle');
  }

  if (yaxis) {
    svg.append('g')
      .attr('class', 'yaxis')
      .attr('transform', h_getTranslate(0, 0))
      .call(yaxis)
      .selectAll('text')
        .attr('x', 0)
        .style('text-anchor', 'start');
  }

  _.each(opts.data, function(serie) {
    if (serie.type === 'line') {
      inject(p_line).drawLine(serie);
    } else if (serie.type === 'bar') {
      inject(p_bar).drawBar(serie);
    }
  });

  if (opts.trail) {
    inject(p_trail);
  }

  svg.selectAll('.domain').remove();
};

/**
 * Defaults Chart options.
 */
Charicharts.chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  xaxis: {
    scale: 'time',
    fit: false,
    orient: 'bottom',
    display: true,
    tickFormat: function(d) {
      if (d instanceof Date) {
        return d.getHours();
      }
      return d;
    }    
  },
  yaxis: {
    scale: 'linear',
    fit: false,
    display: true,
    orient: 'left',
    tickFormat: function(d) {
      return d;
    }
  }
};