# Site Versioning

The Site data format contains a version number that indicates which version of the builder it was created with, and which version of the renderer can process it.

The format version is `X.Y.Z`. Incrementing each number means:

- `X`: data format migration is required
- `Y`: data structure may change, but existing sites will not break
- `Z`: minor non-breaking changes

## Migration

TBD

## Renderer Selection

TBD -- We may support selecting renderer code based on the Site version, in case migration is not available for some reason.
