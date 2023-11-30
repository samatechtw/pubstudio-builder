# Inputs, Events, and Behaviors

Inputs, events, and behaviors are used to customize and add interactivity to components.

## Inputs

Component inputs have several uses. They can be set in the Builder component menu, and if the `HTML attribute` property is checked, will show up in the rendered HTML. For example, an `img` component can define a `src`, which is a URL to an image. A link (`<a>`) component with an `href` input will navigate to that location when clicked. Any HTML property can be set this way.

Inputs which are not `HTML attributes` are less useful, but can be referenced/set in behaviors.

Some inputs, such as `src` and `href`, are treated differently in the editor. An `img` component's `src` includes an extra icon that shows a popup with a list of Site assets, which can be used to set the `src`. A link component shows a tooltip in the Builder that allows navigating to or updating the `href`.

## Events

Events are user-initiated actions or triggers that occur while viewing a site. Each event can cause one or more Behaviors to be executed. Some events have options, which affect how it is triggered.

See the table below for event descriptions:

| Type           | Options           | Description                                                                                                                                                 |
| -------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Click          | N/A               | Component is clicked                                                                                                                                        |
| ClickOutside   | N/A               | Anything except the component is clicked                                                                                                                    |
| MouseOver      | N/A               | Mouse hovers over the component, triggers many times.                                                                                                       |
| MouseLeave     | N/A               | Mouse leaves the component                                                                                                                                  |
| Periodic       | interval          | Triggers once every `interval` milliseconds                                                                                                                 |
| OnAppear       | appear            | Triggers each time the component appears on the page                                                                                                        |
| ScrollIntoView | margin, direction | Triggers when the component is `margin` distance from the top oof the window. `direction` determines if it triggers when scrolling `up`, `down`, or `both`. |
| Input          | N/A               | For `input` or `textfield` components, whenever a character is typed.                                                                                       |

## Behaviors

Behaviors are component-specific actions defined using Javascript. Behaviors can have `args`, which are similar to component Inputs or Event options. Behaviors can use `component` state to track information, which only persists for the current browser tab. If the page is refreshed or closed/re-opened, all state is reset. Local storage can be accessed in behaviors, as well as any external API, and convenience methods for using these may be added.

Some simple builtin behaviors are provided for hiding/showing components.
