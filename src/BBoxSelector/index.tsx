import React from 'react';
import { createStyles } from '@material-ui/core';
import { WithStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = createStyles({
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
const BBoxSelector: React.FC<Props & WithStyles<typeof styles>> = ({ rectangle, borderWidth = 2, classes }) => {
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
export default withStyles(styles)(BBoxSelector);
