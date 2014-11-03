Charicharts.Bar = function(options) {
  this.options = h_parseOptions(_.extend({}, Charicharts.Bar.defaults, options));
  this.$scope = _.extend({}, this.options, Charicharts.Events(this));
  this.call = generateInjector(this.$scope);
  this[Charicharts.Bar.types[this.options.type]]();
  return _.pick(this.$scope, 'on');
};

/**
 * Renders a percentage bar in the target.
 */
Charicharts.Bar.prototype.renderPercentageBar = function() {
  this.$scope.svg = this.call(p_svg).drawResponsive();

  var total = d3.sum(_.pluck(this.options.data, 'value'));
  var x0 = 0;

  var data = _.map(this.options.data,
    function(d) {
      var v = {
        x0: x0,
        x1: d.value * 100 / total,
        color: d.color
      };
      x0 += v.x1;
      return v;
    });

  this.$scope.svg
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
    .attr('height', this.options.height)
    .style('fill', function(d) {
      return d.color;
    });
};

/**
 * Map bar types with it render methods.
 */
Charicharts.Bar.types = {
  percentage: 'renderPercentageBar'
};

/**
 * Defaults bar options.
 */
Charicharts.Bar.defaults = {
  margin: '0,0,0,0',
  type: 'percentage'
};