/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    minifierConfig: {
      keep_classnames: true,  // enable to fix typeorm
      keep_fnames: true,  // enable to fix typeorm
      mangle: {
        // toplevel: false,
        keep_classnames: true, // enable to fix typeorm
        keep_fnames: true, // enable to fix typeorm
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true
      },
      sourceMap: {
        includeSources: false
      },
      toplevel: false,
      compress: {
        // reduce_funcs inlines single-use functions, which cause perf regressions.
        reduce_funcs: false
      }
    },
  },
};
