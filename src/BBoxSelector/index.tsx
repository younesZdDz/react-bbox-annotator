import React from 'react';

interface Props {
    rectangle: { left: number; top: number; width: number; height: number };
    borderWidth?: number;
}
const BBoxSelector: React.FC<Props> = ({ rectangle, borderWidth = 2 }) => {
    return (
        <div
            style={{
                position: 'absolute',
                border: `${borderWidth}px dotted rgb(127,255,127)`,
                left: `${rectangle.left - borderWidth}px`,
                top: `${rectangle.top - borderWidth}px`,
                width: `${rectangle.width}px`,
                height: `${rectangle.height}px`,
            }}
        ></div>
    );
};
BBoxSelector.displayName = 'BBoxSelector';
export default BBoxSelector;
