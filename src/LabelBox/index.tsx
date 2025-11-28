import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';

interface StyleProps {
    left: number;
    top: number;
}

const useStyles = createUseStyles({
    labelBox: {
        left: (props: StyleProps) => `${props.left}px`,
        top: (props: StyleProps) => `${props.top}px`,
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
const LabelBox = React.forwardRef<any, Props>(({ inputMethod, ...props }, forwardedRef) => {
    const classes = useStyles({ left: props.left, top: props.top });
    const [value, setValue] = useState('');
    const changeHandler = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value);
        if (inputMethod === 'select') {
            props.onSubmit(e.target.value);
        }
    };
    const keyDownHandler = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            props.onSubmit(value);
            e.preventDefault();
            return;
        }
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
                    onKeyDown={keyDownHandler}
                    onChange={changeHandler}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            );
            break;
        default:
            throw new Error(`Invalid labelInput parameter: ${inputMethod}`);
    }

    return <div className={classes.labelBox}>{labelInput}</div>;
});
LabelBox.displayName = 'LabelBox';

export default LabelBox;
