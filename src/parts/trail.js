/**
 * Add an trail to the supplied svg and trigger events
 * when the user moves it.
 */
var p_trail = ['svg', 'trigger', 'height', 'width', 'xscale', 'margin',
  function(svg, trigger, height, width, xscale, margin) {

    var currentDate;

    var trail = svg.append('g')
      .attr('class', 'trail');

    var markerDef = svg.append('svg:marker')
      .attr('id', 'trailArrow')
      .attr('class', 'trail-arrow')
      .attr('viewBox','0 0 20 20')
      .attr('refX','15')
      .attr('refY','11')
      .attr('markerUnits','strokeWidth')
      .attr('markerWidth','15')
      .attr('markerHeight','11')
      .attr('orient','auto')
      .append('svg:path')
        .attr('d','M 0 0 L 20 10 L 0 20 z')
        .attr('fill', '#777');

    var trailLine = trail.append('svg:line')
      .attr('class', 'trail-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -margin.top + 10) // 10px padding
      .attr('y2', height)
      .attr('marker-start', 'url(#trailArrow)');

    var brush = d3.svg.brush()
      .x(xscale)
      .extent([0, 0]);

    var slider = svg.append('g')
      .attr('transform', h_getTranslate(0,0))
      .attr('class', 'trail-slider')
      .call(brush);

    slider.select('.background')
      .attr('height', height)
      .attr('width', width)
      .style('cursor', 'pointer');

    svg.selectAll('.extent,.resize').remove();

    brush.on('brush', onBrush);


    // quickfix: add to event loop so its call event is set.
    setTimeout(function() {
      slider
        .call(brush.extent([new Date(), new Date()]))
        .call(brush.event);
    }, 0);

    /**
     * Triggered when the user mouseover or clicks on
     * the slider brush.
     * TODO: => support different date units
     */
    function onBrush() {
      var xdomain = xscale.domain();
      var date;

      if (d3.event.sourceEvent) {
        date = xscale.invert(d3.mouse(this)[0]);
      } else {
        date = brush.extent()[0];
      }

      // If the selected date is out of the domain,
      // select the nearest domain date.
      if (Date.parse(date) > Date.parse(xdomain[1])) {
        date = xdomain[1];
      } else if (Date.parse(date) < Date.parse(xdomain[0])) {
        date = xdomain[0];
      }

      if (date.getUTCMinutes() >= 30) {
        date.setUTCHours(date.getUTCHours()+1);
      }

      date.setUTCMinutes(0, 0); // steps to minutes
      date = Date.parse(date);

      if (currentDate === date) {
        return;
      }

      currentDate = date;
      var xtrail = Math.round(xscale(date)) - 1;
      moveTrail(xtrail);
      trigger('moveTrail', [date]);
    }

    /**
     * Move the trail to the given x position.
     * 
     * @param  {integer} x
     */
    function moveTrail(x) {
      trailLine
        .attr('x1', x)
        .attr('x2', x);
    }
}];