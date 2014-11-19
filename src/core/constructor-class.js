var CClass = Class.extend({

  init: function(opts, data) {
    // Set scope
    this.$scope = {};
    this.$scope.opts = this.parseOpts(opts);
    this.$scope.data = data;
    _.extend(this.$scope, p_events());

    this._loadModules(this._modules);
  },

  _loadModules: function() {
    this.partsInstances = {};

    // Generate injector
    var caller = this._generateInjector(this.$scope);

    // Load modules
    _.each(modules, _.bind(function(Module) {
      this.partsInstances = new Module(this.$scope);
      _.extend(this.$scope, this.partsInstances.getScopeParams());
    }, this));
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

// var Chart = CClass.extend({

//   modules: [
//     p_svg,
//     p_scale,
//     p_axes,
//     p_series,
//     // p_trail
//   ],

//   defaults: {

//   },

//   parseOptions: function(opts) {

//   },

//   getInstanceProperties: function() {
//     return {};
//   }

// });