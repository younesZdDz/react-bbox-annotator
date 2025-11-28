# React Bounding Box Annotator

A lightweight and customizable **image bounding box annotation component** for React.

👉 Demo: https://bbox-annotator.netlify.app/

👉 NPM: https://www.npmjs.com/package/react-bbox-annotator

## ⚡ Features

- Simple React component with intuitive props
- Automatically scales the image to its parent container
- Bounding box coordinates remain in reference to the original image size
- Emits annotation updates via a callback
- Supports free-text labels or predefined label lists
- Works in any modern React setup (Vite, Next.js, CRA, etc.)
- Select and move existing boxes (drag to reposition)
- Resize boxes with 8 handles (corners and edges)
- Edit labels on existing boxes (double‑click a box)

## 📦 Installation
```bash
npm install react-bbox-annotator
```
**React version support**

This package requires React 18:

```bash
npm install react@^18.2.0 react-dom@^18.2.0
```

## 📚 Usage Example
```ts
import React, { useState } from 'react';
import BBoxAnnotator { type EntryType } from 'react-bbox-annotator';

const App = () => {
  const labels = ['Mama cow', 'Baby cow'];
  const [entries, setEntries] = useState<EntryType[]>([]);

  return (
    <>
      <div style={{ width: '60%' }}>
        <BBoxAnnotator
          url="https://milkgenomics.org/wp-content/uploads/2013/08/bigstock-cows-mother-and-baby-3998546.jpg"
          inputMethod="select"
          labels={labels}
          onChange={(e) => setEntries(e)}
        />
      </div>

      <pre>{JSON.stringify(entries, null, 2)}</pre>
    </>
  );
};

export default App;
```

or in CommonJS:
```js
const BBoxAnnotator = require('react-bbox-annotator').default;
```

## 🖱️ Interactions

- Select a box: click it (selected box shows a blue border)
- Move a box: drag a selected box
- Resize a box: drag any of the 8 handles (corners/edges)
- Edit a label: double‑click a box
- Delete a box: click the close button that appears on hover

## ❓ Why use this component?

If you're building an image labeling platform, dataset creation tool, or computer vision annotation UI, this component saves you from:

- handling mouse interactions
- scaling images
- aligning coordinates
- mapping UI boxes to original image dimensions
- You get a clean, plug-and-play React component that handles all the messy UI logic.

## 🔧 Available Props
| Prop            | Type                             | Required | Default | Description                                                                   |
| --------------- | -------------------------------- | -------- | ------- | ----------------------------------------------------------------------------- |
| **url**         | `string`                         | ✔️ Yes   | —       | URL of the image to annotate.                                                 |
| **inputMethod** | `'text' \| 'select'`             | ✔️ Yes   | —       | Annotation input mode. `text` = free typing, `select` = choose from `labels`. |
| **onChange**    | `(entries: EntryType[]) => void` | ✔️ Yes   | —       | Callback fired whenever annotations are added, moved, resized, edited, or removed. |
| **labels**      | `string[]`                       | No       | `[]`    | List of predefined labels (used only when `inputMethod="select"`).            |
| **borderWidth** | `number`                         | No       | `2`     | Width of the bounding box border (in pixels).                                 |

```ts
export interface EntryType {
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
}
```

## 📄 License

MIT © Younes Zadi