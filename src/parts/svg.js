/**
 * SVG module.
 */
var p_svg = ['responsive', 'fullWidth', 'fullHeight', 'target', 'gmainTranslate',
  function(responsive, fullWidth, fullHeight, target, gmainTranslate) {

  /**
   * Draw svg and apply the supplied translate.
   * 
   * @param  {String} translate
   * @return {Svg}    svg
   */
  function draw() {
    return d3.select(target)
      .append('svg')
        .attr('width', responsive ?  '100%' : fullWidth)
        .attr('height', fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', gmainTranslate);
  }

  return {
    draw: draw
  };
  
}];