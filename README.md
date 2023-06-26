
# react-splitter-light
A lightweight React component for creating adjustable split views with no extra dependencies.


## Features

- **No extra dependencies**.
- **Vertical & horizontal layouts**.
- Supports **React16.8 and later**.
- Support **discrete** moving, making it suitable for use as a **slider**.



## Installing

````sh
# use npm
npm install react-splitter-light

# or if you use yarn
yarn add react-splitter-light
````

## Example Usage

```jsx
import React, {useState} from 'react';
import {Splitter} from 'react-splitter-light';

function App () {  

  return (
    <div style={{ height: 500 }}>
      <Splitter>
        <div style={{background: 'green'}}>
          pane1
        </div>        
        <div style={{background: 'blue'}}>
          pane2
        </div>
        <div style={{background: 'brown'}}>
          pane3
        </div>
      </Splitter>
    </div>
  );
};
```

## props

**Splitter**

| Property                | Description                                                                                                                              |                       Type                        |     Default      |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------:|:----------------:|
| mode                    | Determine the layout of panes.                                                                                                           |            'horizontal' or 'vertical'             |   'horizontal'   |
| sizes(units)            | Sets the sizes of panels in units.                                                                                                       |                     number[]                      |   equal parts    |
| runnerSize(px)          | Specifies the size of the runner.                                                                                                        |                      number                       |       6px        |
| resizable               | Specifies whether the panel should be resizable.                                                                                         |                      boolean                      |       true       |
| minSizes(units/px)      | Specifies the minimum sizes of panels. If you want specify as a 'px' set as a string or string[]. For example '10px' or ['10px', '12px'] |         number/string or number/string[]          |       10px       |
| maxSizes(units/px)      | Specifies the maximum sizes of panels. If you want specify as a 'px' set as a string or string[]. For example '10px' or ['10px', '12px'] |         number/string or number/string[]          | Number.MAX_VALUE |
| onResize                | Callback invoked when the size changes.                                                                                                  | (sizesInUnits: number[], sizes: number[]) => void |       none       |
| discrete                | Specifies the movement of the runner.                                                                                                    |                 boolean or number                 |      false       |
| onDragStart             | This callback is invoked when a drag starts. It provides the indexes of the pair of resizable nearby panels.                             |  (event: MouseEvent, indexes: number[]) => void   |       none       |
| onDragEnd               | This callback is invoked when a drag ends. It provides the indexes of the pair of resizable nearby panels.                               |  (event: MouseEvent, indexes: number[]) => void   |       none       |
| actionOnContainerResize | Specifies whether to invoke the onResize callback when the Splitter container size changes.                                              |                      boolean                      |      false       |
| runnerStyle             | Provides the style for the runner.                                                                                                       |                   CSSProperties                   |       none       |
| runnerClassName         | Provides the class name for the runner.                                                                                                  |                      string                       |       none       |
| splitterStyle           | Provides the style for the splitter.                                                                                                     |                   CSSProperties                   |       none       |
| splitterClassName       | Provides the class name for the splitter.                                                                                                |                      string                       |       none       |
| paneClassName           | Provides the class name for the panel.                                                                                                   |                      string                       |       none       |



## License

**[react-splitter-light](https://github.com/kruglay/react-splitter-light)** is licensed under the [MIT](LICENSE).
