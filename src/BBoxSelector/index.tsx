import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    bboxSelector: {
        border: (props: Props) => `${props.borderWidth || 2}px dotted rgb(127,255,127)`,
        borderWidth: (props: Props) => `${props.borderWidth || 2}px`,
        position: 'absolute',
    },
});

interface Props {
    rectangle: { left: number; top: number; width: number; height: number };
    borderWidth?: number;
}
const BBoxSelector: React.FC<Props> = ({ rectangle, borderWidth = 2 }) => {
    const classes = useStyles({ borderWidth });
    return (
        <div
            className={classes.bboxSelector}
            style={{
                left: `${rectangle.left - borderWidth}px`,
                top: `${rectangle.top - borderWidth}px`,
                width: `${rectangle.width}px`,
                height: `${rectangle.height}px`,
            }}
        ></div>
    );
};
export default BBoxSelector;
