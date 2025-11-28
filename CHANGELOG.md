## 1.0.0 - 2025-11-28

- React 18 support (and requirement). Peer dependencies now require `react@^18` and `react-dom@^18`.
- Modernized TypeScript JSX config to `react-jsx`.
- Replaced deprecated key handling (`onKeyPress` + `e.which`) with `onKeyDown` + `e.key === 'Enter'`.
- Throw `Error` instances instead of strings.
- Switched dependency from `uuidv4` to `uuid` (code already imports from `uuid`).
- Marked package as `sideEffects: false` for improved tree-shaking.

Breaking changes:
- Dropped React 16/17 from peer compatibility. Use v0.x if you need React 16/17.



