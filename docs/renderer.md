# Site Renderer

This document will contain the specification for the renderer.

Currently, the web renderer implemented in `libs/frontend/feature-build/src/lib/render.ts` is a simple recursive function that maps the Site data to Vue render functions without optimization.

## Specification

TBD

### Debug Mode

When `site.editor.active = true`, the site is editable and the renderer should display editing UI, and set editor context when certain user actions are taken. For example, when a component is clicked, `site.editor.selectedComponentId` should be set to the selected component.
