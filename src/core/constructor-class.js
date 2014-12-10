/**
 * Constructor Class. All charicharts constructors extends this Class.
 */
var CClass = Class.extend({

  init: function(opts, data) {
    // Set scope with core objects populated
    this.$scope = {
      opts: this.parseOptions(opts),
      data: data
    };

    // Set events module into the $scope.
    _.extend(this.$scope, charichartsEvents());
    this._loadModules(this._modules);

    // Core methods exposed
    return _.extend(this.getInstanceProperties(), {
      on: this.$scope.on,
      unbind: this.$scope.unbind
    });
  },

  _loadModules: function() {
    // Generate injector
    var caller = this._generateInjector(this.$scope);

    // Load modules
    for (var i = 0; i < this.modules.length; i++) {
      _.extend(this.$scope, new this.modules[i](this.$scope));
    }
  },

  /**
   * Generate a injector for the given context.
   *
   * When calling a module function using the returned function,
   * that module will be able to ask for context properties.
   *
   * Injectors are specially build for the charichart parts, because they
   * need access to so many variables. This makes the code cleaner and more
   * testeable.
   *
   * @param  {Ojbect} ctx Context
   */
  _generateInjector: function(ctx) {
    return function(args) {
      var func = args[args.length-1];
      args = args.slice(0, args.length-1).map(function(a) {
        return ctx[a];
      });
      return func.apply(ctx, args);
    };
  }

});