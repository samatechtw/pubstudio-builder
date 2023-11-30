# Technical Notes

This page defines terminology, and explains the technical design of the web editor and renderer. There is not yet a rigorous specification for the underlying data format of a Site; the following notes describe the relationships between entities and how they are used.

Types for the following sections are mostly defined in `libs/shared/type-site/src/lib/`.

A Site can be built using the Builder, and either rendered dynamically with the Renderer, or exported as a Vue render function, html, json, etc (TODO).

### Site

A Site is a collection of Pages and metadata that can be parsed and rendered to produce a functional website. A `SiteContext` includes state such as the latest incremental ID used for entities in the Site, the `namespace` used to uniquely identify entities across multiple sites, reusable components, and styles. The Context also stores Behaviors, theme, breakpoints, and translations used in the site.

A Site has one or more associated Pages.

### Page

A Page is a root Component (no parent) rendered in the `body` tag. Each page has a unique `route` relative to the Site's url, which can include dynamic parameters (TODO). A human-readable `name` is used as the rendered title, and is how the Page is referred to in the Builder.

A Page can have access controls, and may include metadata used to populate the document's `<head>`.

### Component

A Component is an independent piece of interface that corresponds to a tree of DOM nodes with associated logic and style. It is analogous to React/Vue/etc components.

Component styles take precedence over global defaults.

A Component has inputs and events, which allow dynamic customization without overriding style/layout. Variables and values can be passed as inputs, and components with inputs can be dynamically created by Behaviors. Events can trigger Behaviors, or pass data to the parent component.

Currently, components exist only in the layout tree. A cache of all site components is created when the site is deserialized, which can be used for fast lookup. In the future, a Site may contain standalone components (i.e. components without a parent), that can be copied in the builder.

### Style

Styles are CSS properties bound to a component. Styles can be grouped into reusable units called Mixins. Components can override child styles.

Each style entry consists of an associated breakpoint, pseudo-selector (e.g. `hover`, `focus`, etc), CSS property and value. Styles are inherited with the following precedence, from highest to lowest.

1. Parent style override
2. Component style for active breakpoint and pseudo selector
3. Mixin style for active breakpoint and pseudo selector
4. Component style for active breakpoint and default pseudo selector
5. Mixin style for active breakpoint and default pseudo selector
6. Component style for next (wider) breakpoint
7. Mixin style for next (wider) breakpoint
8. Etc. until default breakpoint is reached

### Behaviors

Behaviors are snippets of Javascript which can be triggered by Events. Behaviors have access to the site context, the component who's Event triggered it, and custom args defined in the builder.

### IDs

All Components and Styles can referenced by ID, with the format `<namespace>-<type>-<n>`. `namespace` is a unique identifier, usually corresponding to the site the component was created in. `type` s either `s` for Style, or `c` for Component.

#### Builtins

Builtins are Components, Styles, and Behaviors provided in the `global` namespace, e.g. `global-c-1`

### Operations/Commands

The Builder is implemented as a stack of reversible commands.

A Command has:

- Type:
  - addComponent, editComponent, removeComponent, setComponentCustomStyle
  - addStyle, editStyle, removeStyle
  - etc.
- Data `d`
  - "add" commands contain the object created
  - "update" is usually an ID with some new fields, and the old fields being replaced.
  - "remove" is an ID

The stack represents the entire history of the site, and can be used as a form of version control by pointing to a specific stack entry. As a sites grow, it may become necessary to support compression/checkpoints, by replacing a portion of history with the site data at a given point in time.

TODO: data integrity/hashing

## Style Toolbar

The Style Toolbar (`StyleToolbar.vue`) acts as a UI wrapper for setting Component custom styles. The available options are split into sections, which are shown depending on properties of the selected component.

### Alignment

The alignment section shows when any component is selected.

### Text Styling

The text styling section shows when a component with `content` is selected.
