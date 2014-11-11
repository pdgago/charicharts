Chart.prototype.addSerie = function(serie) {
  var self = this;

  // Map serie types with its render methods
  var addMethods = {
    'line': addLine,
    'bar': addBar,
    'stacked-bar': addStackedBar
  };

  function addLine() {
    self.$scope.lines = self.call(p_line).drawLine(serie);
  }

  function addBar() {
    self.$scope.bars = self.call(p_bar).drawBar(serie);
  }

  function addStackedBar() {
    self.$scope.stackedBars = self.call(p_stacked_bar).drawBar(serie);
  }

  addMethods[serie.type]();
};