# feature-agent-tools

Installs `window.PubStudio`, the introspectable read/edit surface an AI agent drives the
builder through. Every mutation goes through an op that wraps a `CommandType`, so agent
edits land on the normal command stack and undo exactly like a human edit.

`PubStudio.describe()` is the tool and op reference. See `docs/agent-tools.md` for the
design constraints and the rules for adding an op.
