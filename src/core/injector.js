/**
 * Generate a injector to the given context.
 *
 * When calling a function using inject(), that function
 * will be able to ask for context variables.
 *
 * Injectors are specially build for the charichart parts, because they
 * need access to many variables. This makes the code cleaner and more
 * testeable.
 *
 * @param  {Ojbect} ctx Context
 */
var generateInjector = function(ctx) {
  return function inject(args) {
    var func = args[args.length-1];
    args = args.slice(0, args.length-1).map(function(a) {
      return ctx[a];
    });
    return func.apply(ctx, args);
  };
};