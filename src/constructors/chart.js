Charicharts.Chart = function chart(options) {
  this._options = this.parseOptions(options);
  this.$scope = _.extend({}, this._options, Charicharts.Events(this));
  this.call = generateInjector(this.$scope);
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
  this.$scope.svg = this.call(p_svg).draw(svgTranslate);

  // Set scales
  this.$scope.xscale = this.call(p_scale).getXScale();
  this.$scope.yscale = this.call(p_scale).getYScale();

  // Draw axis
  this.call(p_axes).drawY();
  this.call(p_axes).drawX();

  _.each(opts.data, function(serie) {
    that.addSerie(serie);
  });

  // Draw trail (optional)
  // Add a trail line to the chart and trigger a 'moveTrail'
  // event when the user moves the trail.
  if (opts.trail) {
    this.call(p_trail);
  }
};

/**
 * Add the supplied serie to the chart.
 * 
 * @param {Object} serie
 */
Charicharts.Chart.prototype.addSerie = function(serie) {
  if (serie.type === 'line') {
    this.call(p_line).drawLine(serie);
  } else if (serie.type === 'bar') {
    this.call(p_bar).drawBar(serie);
  } else if (serie.type === 'stacked-bar') {
    this.call(p_stacked_bar).drawBar(serie);
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
  options = h_deepExtend(_.extend({}, Charicharts.Chart.defaults), options);

  options.margin = _.object(['top', 'right', 'bottom', 'left'],
    options.margin.split(',').map(Number));

  /**
   * Axis labels padding.
   * TODO: => Do this better.
   */
  if (options.yaxis.left.label || options.yaxis.right.label) {
    options.margin.top += Math.abs(options.yaxis.textMarginTop - 30);
  }

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
  /**
   * Series options.
   */
  series: {
    barWidth: 12,
    stackedBarAlign: 'right'
  },
  /**
   * Xaxis Options.
   */
  xaxis: {
    scale: 'time',
    fit: false,
    ticks: false,
    top: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    },
    bottom: {
      enabled: true,
      label: 'sd',
      tickFormat: function(d) {return d.getMonth();}
    }  
  },
  /**
   * Yaxis Options.
   */
  yaxis: {
    scale: 'linear',
    fit: false,
    fullGrid: true,
    ticksMarginTop: 0,
    ticks: false,
    left: {
      enabled: true,
      label: false,
      tickFormat: function(d) {return d;}
    },
    right: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    }
  }
};