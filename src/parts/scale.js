/**
 * Set x/y scales from the supplied options.
 * 
 * @param  {Object} opts
 *   width - range width
 *   height - range height
 *   data - series data. used to set the domains
 * @return {Array} Returns [x,y] scales
 */
var p_scale = ['data', 'xaxis', 'yaxis', 'width', 'height',
  function(data, xaxis, yaxis, width, height) {

    var scalePadding = 1.05;

    var d3Scales = {
      'time': d3.time.scale,
      'ordinal': d3.scale.ordinal,
      'linear': d3.scale.linear
    };

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
          return d3.sum(_.pluck(d.scrutinized, 'value')) * scalePadding;
        }
        return Number(d.value) * scalePadding;
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
          return d3.sum(_.pluck(d.scrutinized, 'value')) * scalePadding;
        }
        return d.value * scalePadding;
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
      var domain = getDomain(xaxis.scale, xaxis.fit);
      return d3Scales[xaxis.scale]()
        .domain(domain)
        .range([0, width]);
    }

    function getYScale() {
      var domain = getDomain(yaxis.scale, yaxis.fit);

      return d3Scales[yaxis.scale]()
        .domain(domain)
        .range([height, 0])
        .nice(); // Extends the domain so that it starts and ends on nice round values.
    }

    return {
      getXScale: getXScale,
      getYScale: getYScale
    };
}];