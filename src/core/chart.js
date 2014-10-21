Charicharts.chart = function chart(options) {
  this._options = h_parseOptions(_.extend({}, this.constructor.defaults, options));
  this._vars = _.extend({}, this._options, Charicharts.Events(this));
  this.inject = generateInjector(this._vars);
  this.init();
  return _.pick(this._vars, 'on');
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.chart.prototype.init = function() {
  var opts = this._options;

  // Draw svg
  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.margin.left, opts.margin.top));

  this._vars.svg = svg;

  // Set scales
  var scales = this.inject(p_scale);
  var xscale = scales[0];
  var yscale = scales[1];

  this._vars.scales = scales;
  this._vars.xscale = xscale;
  this._vars.yscale = yscale;
  this._vars.width = this._options.width;
  this._vars.height = this._options.height;

  // Set axes
  var xaxis, yaxis;
  if (opts.xaxis.display) {
    xaxis = this.inject(p_axes_getX)
      .drawAxis();
  }

  if (opts.yaxis.display) {
    yaxis = this.inject(p_axes_getY)
      .drawAxis();
  }

  _.each(opts.data, _.bind(function(serie) {
    if (serie.type === 'line') {
      this.inject(p_line).drawLine(serie);
    } else if (serie.type === 'bar') {
      this.inject(p_bar).drawBar(serie);
    }
  }, this));

  if (opts.trail) {
    this.inject(p_trail);
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
    display: false,
    orient: 'left',
    tickFormat: function(d) {
      return d;
    }
  }
};