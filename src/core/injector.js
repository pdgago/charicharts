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
function generateInjector(ctx) {
  return function(args) {
    var func = args[args.length-1];
    args = args.slice(0, args.length-1).map(function(a) {
      return ctx[a];
    });
    return func.apply(ctx, args);
  };
}
