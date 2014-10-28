Charicharts.Chart = function chart(options) {
  this._options = this.parseOptions(options);
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  this.load = generateInjector(this.$scope);
  this.renderChart();

  /*
   * Methods which are going to be available
   * in the chart instance.
   */
  var chartMethods = {
    on: this.$scope.on,
    toggleSerie: _.bind(this.toggleSerie, this),
    addSerie: _.bind(this.addSerie, this)
  };

  return chartMethods;
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.Chart.prototype.renderChart = function() {
  var opts = this._options,
      that = this,
      xaxis, yaxis;

  // Draw svg
  // Main chart wrapper under the given target.
  var svgTranslate = h_getTranslate(opts.margin.left, opts.margin.top);
  this.$scope.svg = this.load(p_svg).draw(svgTranslate);

  // Scales
  // X scale and axis (optional)
  if (opts.xaxis.enabled) {
    this.$scope.xscale = this.load(p_scale).getXScale();
    this.$scope.xaxis = this.load(p_axes_getX).drawAxis();
  }

  // Y scale and axis (optional)
  if (opts.yaxis.enabled) {
    this.$scope.yscale = this.load(p_scale).getYScale();
    this.$scope.yaxis = this.load(p_axes_getY).drawAxis();
  }

  // Draw series.
  _.each(opts.data, function(serie) {
    that.addSerie(serie);
  });

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
  this.$scope.svg.selectAll('.domain').remove();
};

/**
 * Add the supplied serie to the chart.
 * 
 * @param {Object} serie
 */
Charicharts.Chart.prototype.addSerie = function(serie) {
  if (serie.type === 'line') {
    this.load(p_line).drawLine(serie);
  } else if (serie.type === 'bar') {
    this.load(p_bar).drawBar(serie);
  } else if (serie.type === 'stacked-bar') {
    this.load(p_stacked_bar).drawBar(serie);
  }
};

/**
 * Toggle the supplied serieId.
 * 
 * @param  {Integer} serieId
 */
Charicharts.Chart.prototype.toggleSerie = function(serieId) {
  var el = this.$scope.svg.select('#serie' + serieId);
  if (el.empty()) {return;}
  var active = Number(el.attr('active')) ? 0 : 1;
  el.attr('active', active);

  el.transition()
    .duration(200)
    .style('opacity', el.attr('active'));
};

/**
 * Parse Given Options so it's easier to read them.
 * 
 * @param  {Object} options User options
 * @return {Object} options Parsed options
 */
Charicharts.Chart.prototype.parseOptions = function(options) {
  options = h_deepExtend([{}, Charicharts.Chart.defaults, options],
    ['series', 'yaxis', 'xaxis']);

  options.margin = _.object(['top', 'right', 'bottom', 'left'],
    options.margin.split(',').map(Number));

  options.fullWidth = options.target.offsetWidth;
  options.fullHeight = options.target.offsetHeight;
  options.width = options.fullWidth - options.margin.left - options.margin.right;
  options.height = options.fullHeight - options.margin.top - options.margin.bottom;

  return options;
};

/**
 * Defaults Chart options.
 */
Charicharts.Chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  series: {
    barWidth: 10,
    align: 'left'
  },
  xaxis: {
    scale: 'time',
    ticks: false,
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