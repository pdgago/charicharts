Charicharts.Chart = function chart(options) {
  // todo => use a deep extend to do this
  this._options = h_parseOptions(_.extend({}, Charicharts.Chart.defaults, options));
  this._options.series = _.extend({}, Charicharts.Chart.defaults.series, options.series || {});
  this._options.xaxis = _.extend({}, Charicharts.Chart.defaults.xaxis, options.xaxis || {});
  this._options.yaxis = _.extend({}, Charicharts.Chart.defaults.yaxis, options.yaxis || {});
  this._vars = _.extend({}, this._options, Charicharts.Events(this));
  this.load = generateInjector(this._vars);
  this.init();
  return _.pick(this._vars, 'on');
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.Chart.prototype.init = function() {
  var opts = this._options;
  var xaxis, yaxis;

  // Draw svg
  // Main chart wrapper under the given target.
  this._vars.svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.margin.left, opts.margin.top));

  // Scales
  // X scale and axis (optional)
  if (opts.xaxis.enabled) {
    this._vars.xscale = this.load(p_scale).getXScale();
    this._vars.xaxis = this.load(p_axes_getX).drawAxis();
  }

  // Y scale and axis (optional)
  if (opts.yaxis.enabled) {
    this._vars.yscale = this.load(p_scale).getYScale();
    this._vars.yaxis = this.load(p_axes_getY).drawAxis();
  }

  // Draw series.
  // Series supported:
  //   line - simple line with interpolation
  //   bar - simple bar
  //   stacked-bar - desglosed bars (with more than one value for every x point)
  _.each(opts.data, _.bind(function(serie) {
    if (serie.type === 'line') {
      this.load(p_line).drawLine(serie);
    } else if (serie.type === 'bar') {
      this.load(p_bar).drawBar(serie);
    } else if (serie.type === 'stacked-bar') {
      this.load(p_stacked_bar).drawBar(serie);
    }
  }, this));

  // Draw trail (optional)
  // Add a trail line to the chart and trigger a 'moveTrail'
  // event when the user moves the trail.
  // 
  // Requirements:
  //   - xscale
  if (opts.trail && opts.xaxis.enabled) {
    this.load(p_trail);
  }

  // Remove unused stuff (d3 add this automatically)
  this._vars.svg.selectAll('.domain').remove();
};

/**
 * Defaults Chart options.
 */
Charicharts.Chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  series: {
    barWidth: 6,
    align: 'left'
  },
  xaxis: {
    scale: 'time',
    fit: false,
    orient: 'bottom',
    enabled: true,
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
    enabled: true,
    orient: 'left',
    textAnchor: 'end',
    textPaddingLeft: 0,
    textMarginTop: 0,
    tickFormat: function(d, i) {
      if (!i) {return;}
      return d;
    }
  }
};