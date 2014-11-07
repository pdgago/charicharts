/**
 * Renders a percentage bar in the target.
 *
 * @param {String} type String type
 */
Bar.prototype.render = function(type) {
  var self = this;

  // Map bar types with it render methods.
  var types = {
    percentage: renderPercentageBar,
    stacked: renderStackedBar
  };

  function renderPercentageBar() {
    self.$scope.svg = self.call(p_svg).draw();

    var total = d3.sum(_.pluck(self._opts.data, 'value'));
    var x0 = 0;

    var data = _.map(self._opts.data,
      function(d) {
        var v = {
          x0: x0,
          x1: d.value * 100 / total,
          color: d.color
        };
        x0 += v.x1;
        return v;
      });

    self.$scope.svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', function(d, i) {
        return d.x0 + '%';
      })
      .attr('y', 0)
      .attr('width', function(d) {
        return d.x1 + '%';
      })
      .attr('height', self._opts.height)
      .style('fill', function(d) {
        return d.color;
      });
  }

  function renderStackedBar() {
  } 


  var renderMethod = types[type];
  renderMethod();
};