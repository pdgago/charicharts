Charicharts.Bar = Bar;

function Bar(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.call = generateInjector(this.$scope);
  var render = this[Bar.types[this._opts.type]];
  render();
  return _.omit('$scope', 'call', 'parseOpts', 'render');
}

/**
 * Renders a percentage bar in the target.
 */
Bar.prototype.renderPercentageBar = function() {
  this.$scope.svg = this.call(p_svg).draw();

  var total = d3.sum(_.pluck(this._opts.data, 'value'));
  var x0 = 0;

  var data = _.map(this._opts.data,
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
    .attr('height', this._opts.height)
    .style('fill', function(d) {
      return d.color;
    });
};

Bar.prototype.renderStackedBar = function() {

};

Bar.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Bar.defaults, opts);
  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));
  o.gmainTranslate = h_getTranslate(0, 0);
  o.responsive = true;
  return o;
};

/**
 * Map bar types with it render methods.
 */
Bar.types = {
  percentage: 'renderPercentageBar',
  stacked: 'renderStackedBar'
};

/**
 * Defaults bar opts.
 */
Bar.defaults = {
  margin: '0,0,0,0',
  type: 'percentage'
};