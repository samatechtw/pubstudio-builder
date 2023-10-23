# Site Data Format

This page documents the underlying data format used to represent a Site. The root type `ISite` is defined in ``libs/shared/type-site/src/lib/`. The code is the source of truth, but the documentation should usually match.

The following is a minimal Site representation in serialized JSON form, with commented fields. The main difference between serialized JSON, and the object type used in the builder app, is that IDs are converted to objects (e.g. component `parentId` is replaced with the `parent` object).

```jsonc
{
  // Site name, mainly used for builder display
  "name": "test",
  // Format version, to indicate serialization/rendering features
  "version": "0.1",
  // TBD
  "defaults": {
    // Default document metadata
    "head": {}
  },
  // Record of pages, keyed by name
  "pages": {
    // Page object
    "My Home": {
      // Public display name, used as document title
      "name": "My Home",
      // Toggles whether the page is public/deployed
      "public": false,
      // Route, relative to the site root
      "route": "/home",
      // Page/document metadata
      "head": {},
      // Root component
      "root": {
        // Component ID
        "id": "test-c-0",
        // Component name, for builder display
        "name": "Root",
        // HTML tag
        "tag": "div",
        "style": {
          // Custom style attributes, highest priority
          "custom": {
            "width": "100%",
            "height": "100%"
          },
          // Reusable styles, second priority
          "mixins": ["global-s-0"]
        },
        // Component children
        "children": [
          {
            "id": "test-c-1",
            "name": "test-c-1",
            "tag": "div",
            // Text content
            "content": "test",
            // Reference to parent
            "parentId": "test-c-0",
            "style": {
              "custom": {
                "width": "100px",
                "height": "100px"
              }
            }
          }
        ]
      }
    }
  },
  // Site metadata and builder state
  "context": {
    // Unique project namespace, used in component/style IDs
    "namespace": "test",
    // The next unused namespace ID for components/styles
    "nextId": 2,
    // Reusable styles
    "styles": {},
    // Component cache
    // TODO -- this should not be part of the serialized context
    "components": {
      "test-c-0": {
        // ...
      },
      "test-c-1": {
        // ...
      }
    },
    // Site builder context
    "editor": {
      // Current selected component
      "selectedComponentId": "test-c-0",
      // Current page name
      "active": "home",
      // Builder debug bounding box display
      "debugBounding": false,
      // Active context menu
      "mode": "none"
    }
  },
  // Command history, used for undo and snapshots
  "history": {
    "back": [
      {
        "type": "addC",
        "data": {
          "tag": "div",
          "content": "test",
          "parentId": "test-c-0",
          "style": {
            "custom": {
              "width": "100px",
              "height": "100px"
            }
          }
        }
      }
    ],
    // Undo history, used to redo commands
    "forward": []
  }
}
```
