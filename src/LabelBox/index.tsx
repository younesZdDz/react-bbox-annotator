import React, { useState } from 'react';

interface Props {
    left: number;
    top: number;
    inputMethod: 'text' | 'select';
    labels?: string | string[];
    initialValue?: string;
    onSubmit: (label: string) => void;
}
const LabelBox = React.forwardRef<any, Props>(({ inputMethod, ...props }, forwardedRef) => {
    const [value, setValue] = useState(props.initialValue ?? '');
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
                    name="label"
                    ref={forwardedRef}
                    onChange={changeHandler}
                    defaultValue={props.initialValue || ''}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <option value="">choose an item</option>
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

    return (
        <div
            style={{
                position: 'absolute',
                left: `${props.left}px`,
                top: `${props.top}px`,
            }}
        >
            {labelInput}
        </div>
    );
});
LabelBox.displayName = 'LabelBox';

export default LabelBox;
