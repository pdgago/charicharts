/**
 * Set X/Y scales.
 */
var p_scale = ['data', 'opts', function(data, opts) {

  var d3Scales = {
    'time': d3.time.scale.utc,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  };

  // Get flatten values.
  var valuesArr = _.flatten(_.map(data,
    function(d) {
      return d.values;
    }));

  /**
   * Returns time domain from data.
   */
  function getTimeDomain() {
    return d3.extent(valuesArr, function(d) {
      return d.datetime;
    });
  }
  
  /**
   * Returns linear domain from 0 to max data value.
   */
  function getLinearAllDomain() {
    var extent = d3.extent(valuesArr, function(d) {
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
  }

  /**
   * Returns linear domain from min/max data values.
   */
  function getLinearFitDomain() {
    return d3.extent(valuesArr, function(d) {
      if (d.scrutinized) {
        return d3.sum(_.pluck(d.scrutinized, 'value'));
      }
      return d.value;
    });
  }

  /**
   * Get the domain for the supplied scale type.
   * 
   * @param  {String}  scale
   * @param  {Boolean} fit    Fit domain to min/max values
   * @return {Object}  domain D3 domain
   */
  function getDomain(scale, fit) {
    if (scale === 'time') {
      return getTimeDomain();
    }

    if (fit) {
      return getLinearFitDomain();
    } else {
      return getLinearAllDomain();
    }
  }

  function getXScale() {
    var domain = getDomain(opts.xaxis.scale, opts.xaxis.fit);
    return d3Scales[opts.xaxis.scale]()
      .domain(domain)
      .range([0, opts.width]);
  }

  function getYScale() {
    var domain = getDomain(opts.yaxis.scale, opts.yaxis.fit);

    return d3Scales[opts.yaxis.scale]()
      .domain(domain)
      .range([opts.height, 0])
      .nice(); // Extends the domain so that it starts and ends on nice round values.
  }

  var xscale = getXScale();
  var yscale = getYScale();

  return {
    xscale: xscale,
    yscale: yscale
  };
}];