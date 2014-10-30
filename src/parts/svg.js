/**
 * SVG module.
 */
var p_svg = ['fullWidth', 'fullHeight', 'target',
  function(fullWidth, fullHeight, target) {

  /**
   * Draw svg and apply the supplied translate.
   * 
   * @param  {String} translate
   * @return {Svg}    svg
   */
  function draw(translate) {
    return d3.select(target)
      .append('svg')
        .attr('width', fullWidth)
        .attr('height', fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', translate || h_getTranslate(0, 0));
  }

  function drawResponsive(translate) {
    return d3.select(target)
      .append('svg')
        .attr('width', '100%')
        .attr('height', fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', translate || h_getTranslate(0, 0));
  }

  return {
    drawResponsive: drawResponsive,
    draw: draw
  };
  
}];