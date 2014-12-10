/**
 * Scale Module
 * ------------
 * Set X/Y scales from the given data.
 *
 */
var p_scale = PClass.extend({

  deps: [
  ],

  _d3Scales: {
    'time': d3.time.scale.utc,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  },

  _subscriptions: [{
    /**
     * Triggered when the serie gets updated with new data.
     */
    'Serie/update': function() {
      this._updateScales();
      this.trigger('Scale/updated', []);
    }
  }],

  initialize: function() {
    this._status = {
      // Current scale
      scale: {
        x: null,
        y: null
      }
    };

    this._updateScales();
    return {
      scale: this._status.scale
    };
  },

  _updateScales: function() {
    this._setFlattenedData();
    this._status.scale.x = this._updateScale('x');
    this._status.scale.y = this._updateScale('y');
  },

  _updateScale: function(position) {
    var opts = this.opts[position + 'axis'],
        domain = this._getExtent(position, opts.fit),
        range = position === 'x' ? [0, this.opts.width] : [this.opts.height, 0];

    return this._d3Scales[opts.scale]()
      .domain(domain)
      .range(range);
      // .nice(); // Extends the domain so that it starts and ends on nice round values.
  },

  _getExtent: function(position, fit) {
    var extent = d3.extent(this._dataFlattened, function(d) {
      return d[position];
    });

    if (fit) {return extent;}

    // Positive scale
    if (extent[0] >= 0) {
      return [0, extent[1]];
    }

    // Negative-Positive scale
    // In this case min an max are the same values.
    var absX = Math.abs(extent[0]);
    var absY = Math.abs(extent[1]);
    var val = (absX > absY) ? absX : absY;
    return [-val, val];
  },

  /**
   * Get this.data flattened of all series.
   * Handy when we need to get the extent.
   */
  _setFlattenedData: function() {
    this._dataFlattened = _.flatten(_.map(this.data, function(d) {
      if (!d.values) {
        return _.flatten(_.pluck(d.data, 'values'));
      } else {
        return d.values;
      }
    }));
  }

});