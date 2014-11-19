var p_svg = PClass.extend({

  deps: [
    'opts'
  ],

  initialize: function() {
    this.svg = this.drawSvg();

    return {
      svg: this.svg
    };
  },

  drawSvg: function() {
    return d3.select(this.opts.target)
      .append('svg')
        .attr('width', this.opts.responsive ?  '100%' : this.opts.fullWidth)
        .attr('height', this.opts.fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', this.opts.gmainTranslate);    
  }

});