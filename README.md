React bounding box annotator
======================

> A bounding box annotation component written for React.<br>

### Demo available here: [https://bbox-annotator-demo.herokuapp.com](https://bbox-annotator-demo.herokuapp.com)

## Features
-------
* An easy to set component with props
* Picture scales automatically to fit the width of the parent `div `
* Data of the bounding boxes (position in space) are still in reference to the original image size
* Get the annotations (called entries) in a `callback` function

## Installation
-------
Using [npm](https://www.npmjs.com/package/react-bbox-annotator):

    $ npm install react-bbox-annotator --save

Then, using a module bundler that supports  ES2015 modules, such as [webpack](https://github.com/webpack/webpack):

```js
import BBoxAnnotator from 'react-bbox-annotator';
```
## Basic example
-------
```js
import React, { useState } from 'react';
import BBoxAnnotator, { EntryType } from 'react-bbox-annotator';

const App: React.FC = () => {
    const labels = ['Mama cow', 'Baby cow'];
    const [entries, setEntries] = useState<EntryType[]>([]);
    return (
        <>
            <div style={{ width: '60%' }}>
                <BBoxAnnotator
                    url="https://milkgenomics.org/wp-content/uploads/2013/08/bigstock-cows-mother-and-baby-3998546.jpg"
                    inputMethod="select"
                    labels={labels}
                    onChange={(e: EntryType[]) => setEntries(e)}
                />
            </div>
            <pre>{JSON.stringify(entries)}</pre>
        </>
    );
};
export default App;

```
## Why should I use this?
-------
This component can be quiet handy if you are building an image labeling plateform. It abstracts the complexity of creating the UI for drawing boxes around an image and setting it's label while keeping the boxes  in reference to the original image size.

## Available props
-------
The `BBoxAnnotator` Component takes the following props in order to control it's behaviour:

 * `url: string`: Link of the image to annotate.
 * `inputMethod: 'text' | 'select'`: `text` gives you a free text input to submit the label of annotated object, while `select` gives you a list of objects passed with the parameter `labels`.
 * `onChange: (entries: { left: number; top: number; width: number; height: number; label: string }[]) => void`: Callback containing list of annotated objects. Gets triggered when adding an annotation or removing one.
 * `labels?: string | string[]`: List of labels to annotate, if any are known in advance (only used with inputMethod `select`).
 * `borderWidth?: number`: Width of bounding box border in pixels.