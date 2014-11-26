/**
 * Scale Module
 * ------------
 * Set X/Y scales from the given data.
 * 
 */
var p_scale = PClass.extend({

  deps: [
    'opts',
    'data'
  ],

  _subscriptions: [{
    /**
     * Triggered when the serie gets updated with new data.
     * @param  {Object} data Single data object
     */
    'Serie/update': function() {
      // Update data
      this._dataFlattened = this._getFlattenedData();

      // Update scales
      this.xscale = this._getXScale();
      this.yscale = this._getYScale();

      // Emit them to all scopes
      this.emit({
        xscale: this.xscale,
        yscale: this.yscale
      });

      this.trigger('Scale/update', []);
    }
  }],

  _d3Scales: {
    'time': d3.time.scale.utc,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  },

  initialize: function() {
    this._dataFlattened = this._getFlattenedData();
    this.xscale = this._getXScale();
    this.yscale = this._getYScale();

    return {
      xscale: this.xscale,
      yscale: this.yscale
    };
  },

  /**
   * Get this.data flattened of all series.
   * Handy when we need to get the extent.
   */
  _getFlattenedData: function() {
    return _.flatten(_.map(this.data, function(d) {
      return d.values;
    }));
  },

  /**
   * Returns the xscale.
   */
  _getXScale: function() {
    var domain = this._getDomain(this.opts.xaxis.scale, this.opts.xaxis.fit);
    return this._d3Scales[this.opts.xaxis.scale]()
      .domain(domain)
      .range([0, this.opts.width]);
  },

  /**
   * Returns the yscale.
   */
  _getYScale: function() {
    var domain = this._getDomain(this.opts.yaxis.scale, this.opts.yaxis.fit);

    return this._d3Scales[this.opts.yaxis.scale]()
      .domain(domain)
      .range([this.opts.height, 0])
      .nice(); // Extends the domain so that it starts and ends on nice round values.
  },

  _getDomain: function(scale, fit) {
    if (scale === 'time') {
      return this._getTimeDomain();
    }

    if (fit) {
      return this._getLinearFitDomain();
    } else {
      return this._getLinearAllDomain();
    }
  },

  _getTimeDomain: function() {
    return d3.extent(this._dataFlattened, function(d) {
      return d.datetime;
    });
  },

  _getLinearAllDomain: function() {
    var extent = d3.extent(this._dataFlattened, function(d) {
      if (d.scrutinized) {
        return d3.sum(_.pluck(d.scrutinized, 'value'));
      }
      return Number(d.value);
    });

    // Positive scale
    if (extent[0] >= 0) {
      return [0, extent[1]];
    }

    // Negative-Positive scale
    var absX = Math.abs(extent[0]);
    var absY = Math.abs(extent[1]);
    var val = (absX > absY) ? absX : absY;
    return [-val, val];
  },

  _getLinearFitDomain: function() {
    return d3.extent(this._dataFlattened, function(d) {
      if (d.scrutinized) {
        return d3.sum(_.pluck(d.scrutinized, 'value'));
      }
      return d.value;
    });
  }

});