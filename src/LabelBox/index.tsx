import React, { useState } from 'react';
import { createStyles } from '@material-ui/core';
import { WithStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = createStyles({
    labelBox: {
        left: (props: Props) => `${props.left}px`,
        top: (props: Props) => `${props.top}px`,
        position: 'absolute',
    },
    labelInput: {},
});

interface Props {
    left: number;
    top: number;
    inputMethod: 'text' | 'select';
    labels?: string | string[];
    onSubmit: (label: string) => void;
}
const LabelBox = React.forwardRef<any, Props & WithStyles<typeof styles>>(
    ({ classes, inputMethod, ...props }, forwardedRef) => {
        const [value, setValue] = useState('');
        const changeHandler = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
            setValue(e.target.value);
            if (inputMethod === 'select') {
                props.onSubmit(e.target.value);
            }
        };
        const keyPressHandler = (e: React.KeyboardEvent) => {
            if (e.which === 13) {
                props.onSubmit(value);
            }

            return e.which !== 13;
        };
        let { labels = ['object'] } = props;
        if (typeof labels === 'string') {
            labels = [labels];
        }
        let labelInput;
        switch (inputMethod) {
            case 'select':
                labelInput = (
                    <select
                        className={classes.labelInput}
                        name="label"
                        ref={forwardedRef}
                        onChange={changeHandler}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <option>choose an item</option>
                        {labels.map((label) => (
                            <option key={label} value={label}>
                                {label}
                            </option>
                        ))}
                    </select>
                );
                break;
            case 'text':
                labelInput = (
                    <input
                        className={classes.labelInput}
                        name="label"
                        type="text"
                        value={value}
                        ref={forwardedRef}
                        onKeyPress={keyPressHandler}
                        onChange={changeHandler}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                );
                break;
            default:
                throw `Invalid labelInput parameter: ${inputMethod}`;
        }

        return <div className={classes.labelBox}>{labelInput}</div>;
    },
);
LabelBox.displayName = 'LabelBox';

export default withStyles(styles)(LabelBox);
