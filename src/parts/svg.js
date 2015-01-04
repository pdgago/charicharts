/**
 * Svg Module
 * ----------
 * Append a svg to the given opts.target.
 *
 */
var p_svg = PClass.extend({

  deps: [
  ],

  initialize: function() {
    this.$svg = this.drawSvg();

    return {
      $svg: this.$svg
    };
  },

  drawSvg: function() {
    var $svg = d3.select(this.opts.target)
      .append('svg')
        .attr('width', this.opts.fullWidth)
        .attr('height', this.opts.fullHeight);

    $svg.append('g')
      .attr('class', 'g-main')
      .attr('transform', this.opts.gmainTranslate);

    return $svg;
  }

});