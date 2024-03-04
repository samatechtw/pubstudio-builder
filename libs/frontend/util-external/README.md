# Exports for @pubstudio/util

This library is a wrapper that exports useful builder/renderer utilities for the NPM package `@pubstudio/util`.

The main purpose of the library is to provide a separate library for functions that don't depend on any browser features, such as localStorage. In the future it may be merged back to `@pubstudio/builder` if all browser-specific code is moved out of the global scope.
