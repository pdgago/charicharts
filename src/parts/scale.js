/**
 * Set x/y scales from the supplied options.
 * 
 * @param  {Object} opts
 *   width - range width
 *   height - range height
 *   data - series data. used to set the domains
 * @return {Array} Returns [x,y] scales
 */
function p_scale(opts) {

  var d3Scales = {
    'time': d3.time.scale,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  };

  var valuesArr = _.flatten(_.map(opts.data,
    function(d) {
      return d.values;
    }));

  /**
   * Returns time domain from opts.data.
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
    return [0, d3.max(valuesArr, function(d) {
      return d.value;
    })];
  }

  /**
   * Returns linear domain from min/max data values.
   */
  function getLinearFitDomain() {
    return d3.extent(valuesArr, function(d) {
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
      .range([opts.height, 0]);
  }

  return [getXScale(), getYScale()];
}