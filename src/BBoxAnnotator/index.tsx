import React, { useRef, useEffect, useState, useImperativeHandle } from 'react';
import BBoxSelector from '../BBoxSelector';
import LabelBox from '../LabelBox';

export type EntryType = {
    left: number;
    top: number;
    width: number;
    height: number;
    label: string;
};
type Props = {
    url: string;
    inputMethod: 'text' | 'select';
    labels?: string | string[];
    onChange: (entries: EntryType[]) => void;
    borderWidth?: number;
};

const BBoxAnnotator = React.forwardRef<any, Props>(({ url, borderWidth = 2, inputMethod, labels, onChange }, ref) => {
    const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
    const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
    const [entries, setEntries] = useState<
        ({
            id: string;
            showCloseButton: boolean;
        } & EntryType)[]
    >([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingLabelForId, setEditingLabelForId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<{
        id: string;
        offsetX: number;
        offsetY: number;
    } | null>(null);
    const [resizing, setResizing] = useState<{
        id: string;
        handle: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
        startX: number;
        startY: number;
        startRect: { left: number; top: number; width: number; height: number };
    } | null>(null);
    const [multiplier, setMultiplier] = useState(1);
    useEffect(() => {
        onChange(
            entries.map((entry) => ({
                width: Math.round(entry.width * multiplier),
                height: Math.round(entry.height * multiplier),
                top: Math.round(entry.top * multiplier),
                left: Math.round(entry.left * multiplier),
                label: entry.label,
            })),
        );
    }, [entries, multiplier]);
    const [status, setStatus] = useState<'free' | 'input' | 'hold'>('free');
    const [bBoxAnnotatorStyle, setBboxAnnotatorStyle] = useState<{ width?: number; height?: number }>({});
    const [imageFrameStyle, setImageFrameStyle] = useState<{
        width?: number;
        height?: number;
        backgroundImageSrc?: string;
    }>({});

    const bBoxAnnotatorRef = useRef<HTMLDivElement>(null);
    const labelInputRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const maxWidth = bBoxAnnotatorRef.current?.offsetWidth || 1;
        const imageElement = new Image();
        imageElement.src = url;
        imageElement.onload = function () {
            const width = imageElement.naturalWidth || imageElement.width;
            const height = imageElement.naturalHeight || imageElement.height;
            const scale = width / maxWidth;
            const displayWidth = Math.round(width / scale);
            const displayHeight = Math.round(height / scale);
            setMultiplier(scale);
            setBboxAnnotatorStyle({
                width: displayWidth,
                height: displayHeight,
            });
            setImageFrameStyle({
                backgroundImageSrc: imageElement.src,
                width: displayWidth,
                height: displayHeight,
            });
        };
        imageElement.onerror = function () {
            throw new Error('Invalid image URL: ' + url);
        };
    }, [url]);

    const crop = (pageX: number, pageY: number) => {
        return {
            x:
                bBoxAnnotatorRef.current && imageFrameStyle.width
                    ? Math.min(
                          Math.max(Math.round(pageX - bBoxAnnotatorRef.current.offsetLeft), 0),
                          Math.round(imageFrameStyle.width - 1),
                      )
                    : 0,
            y:
                bBoxAnnotatorRef.current && imageFrameStyle.height
                    ? Math.min(
                          Math.max(Math.round(pageY - bBoxAnnotatorRef.current.offsetTop), 0),
                          Math.round(imageFrameStyle.height - 1),
                      )
                    : 0,
        };
    };
    const updateRectangle = (pageX: number, pageY: number) => {
        setPointer(crop(pageX, pageY));
    };

    useEffect(() => {
        const mouseMoveHandler = (e: MouseEvent) => {
            switch (status) {
                case 'hold':
                    updateRectangle(e.pageX, e.pageY);
            }
        };
        window.addEventListener('mousemove', mouseMoveHandler);
        return () => window.removeEventListener('mousemove', mouseMoveHandler);
    }, [status]);

    useEffect(() => {
        const mouseUpHandler = (e: MouseEvent) => {
            switch (status) {
                case 'hold':
                    updateRectangle(e.pageX, e.pageY);
                    setStatus('input');
                    labelInputRef.current?.focus();
            }
        };
        window.addEventListener('mouseup', mouseUpHandler);
        return () => window.removeEventListener('mouseup', mouseUpHandler);
    }, [status, labelInputRef]);

    const addEntry = (label: string) => {
        setEntries([...entries, { ...rect, label, id: crypto.randomUUID(), showCloseButton: false }]);
        setStatus('free');
        setPointer(null);
        setOffset(null);
    };

    const submitEditLabel = (label: string) => {
        if (!editingLabelForId) return;
        setEntries((prev) => prev.map((e) => (e.id === editingLabelForId ? { ...e, label } : e)));
        setEditingLabelForId(null);
    };

    const mouseDownHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // clicking the background starts a new rectangle
        switch (status) {
            case 'free':
            case 'input':
                if (e.button !== 2) {
                    setOffset(crop(e.pageX, e.pageY));
                    setPointer(crop(e.pageX, e.pageY));
                    setStatus('hold');
                    setSelectedId(null);
                    setEditingLabelForId(null);
                }
        }
    };

    const rectangle = () => {
        const x1 = offset && pointer ? Math.min(offset.x, pointer.x) : 0;
        const x2 = offset && pointer ? Math.max(offset.x, pointer.x) : 0;
        const y1 = offset && pointer ? Math.min(offset.y, pointer.y) : 0;
        const y2 = offset && pointer ? Math.max(offset.y, pointer.y) : 0;
        return {
            left: x1,
            top: y1,
            width: x2 - x1 + 1,
            height: y2 - y1 + 1,
        };
    };

    useImperativeHandle(ref, () => ({
        reset() {
            setEntries([]);
        },
    }));
    const rect = rectangle();

    // drag existing entry around
    useEffect(() => {
        if (!dragging) return;
        const onMove = (e: MouseEvent) => {
            const pos = crop(e.pageX, e.pageY);
            setEntries((prev) =>
                prev.map((entry) => {
                    if (entry.id !== dragging.id) return entry;
                    const newLeft = Math.max(
                        0,
                        Math.min((imageFrameStyle.width || 0) - entry.width - 1, pos.x - dragging.offsetX),
                    );
                    const newTop = Math.max(
                        0,
                        Math.min((imageFrameStyle.height || 0) - entry.height - 1, pos.y - dragging.offsetY),
                    );
                    return { ...entry, left: newLeft, top: newTop };
                }),
            );
        };
        const onUp = () => {
            setDragging(null);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dragging, imageFrameStyle.height, imageFrameStyle.width]);

    // resize existing entry
    useEffect(() => {
        if (!resizing) return;
        const onMove = (e: MouseEvent) => {
            const pos = crop(e.pageX, e.pageY);
            const imgW = imageFrameStyle.width || 0;
            const imgH = imageFrameStyle.height || 0;
            const minW = 1;
            const minH = 1;
            const dx = pos.x - resizing.startX;
            const dy = pos.y - resizing.startY;
            setEntries((prev) =>
                prev.map((entry) => {
                    if (entry.id !== resizing.id) return entry;
                    let newLeft = resizing.startRect.left;
                    let newTop = resizing.startRect.top;
                    let newWidth = resizing.startRect.width;
                    let newHeight = resizing.startRect.height;
                    switch (resizing.handle) {
                        case 'e': {
                            const maxWidth = imgW - resizing.startRect.left - 1;
                            newWidth = Math.max(minW, Math.min(resizing.startRect.width + dx, maxWidth));
                            break;
                        }
                        case 's': {
                            const maxHeight = imgH - resizing.startRect.top - 1;
                            newHeight = Math.max(minH, Math.min(resizing.startRect.height + dy, maxHeight));
                            break;
                        }
                        case 'se': {
                            const maxWidth = imgW - resizing.startRect.left - 1;
                            const maxHeight = imgH - resizing.startRect.top - 1;
                            newWidth = Math.max(minW, Math.min(resizing.startRect.width + dx, maxWidth));
                            newHeight = Math.max(minH, Math.min(resizing.startRect.height + dy, maxHeight));
                            break;
                        }
                        case 'w': {
                            const maxLeft = resizing.startRect.left + resizing.startRect.width - minW;
                            newLeft = Math.max(0, Math.min(resizing.startRect.left + dx, maxLeft));
                            newWidth = resizing.startRect.width - (newLeft - resizing.startRect.left);
                            break;
                        }
                        case 'n': {
                            const maxTop = resizing.startRect.top + resizing.startRect.height - minH;
                            newTop = Math.max(0, Math.min(resizing.startRect.top + dy, maxTop));
                            newHeight = resizing.startRect.height - (newTop - resizing.startRect.top);
                            break;
                        }
                        case 'nw': {
                            const maxLeft = resizing.startRect.left + resizing.startRect.width - minW;
                            const maxTop = resizing.startRect.top + resizing.startRect.height - minH;
                            newLeft = Math.max(0, Math.min(resizing.startRect.left + dx, maxLeft));
                            newTop = Math.max(0, Math.min(resizing.startRect.top + dy, maxTop));
                            newWidth = resizing.startRect.width - (newLeft - resizing.startRect.left);
                            newHeight = resizing.startRect.height - (newTop - resizing.startRect.top);
                            break;
                        }
                        case 'ne': {
                            const maxTop = resizing.startRect.top + resizing.startRect.height - minH;
                            const maxWidth = imgW - resizing.startRect.left - 1;
                            newTop = Math.max(0, Math.min(resizing.startRect.top + dy, maxTop));
                            newHeight = resizing.startRect.height - (newTop - resizing.startRect.top);
                            newWidth = Math.max(minW, Math.min(resizing.startRect.width + dx, maxWidth));
                            break;
                        }
                        case 'sw': {
                            const maxLeft = resizing.startRect.left + resizing.startRect.width - minW;
                            const maxHeight = imgH - resizing.startRect.top - 1;
                            newLeft = Math.max(0, Math.min(resizing.startRect.left + dx, maxLeft));
                            newWidth = resizing.startRect.width - (newLeft - resizing.startRect.left);
                            newHeight = Math.max(minH, Math.min(resizing.startRect.height + dy, maxHeight));
                            break;
                        }
                        default:
                            break;
                    }
                    // clamp to image bounds for safety
                    newLeft = Math.max(0, Math.min(newLeft, imgW - newWidth - 1));
                    newTop = Math.max(0, Math.min(newTop, imgH - newHeight - 1));
                    return { ...entry, left: newLeft, top: newTop, width: newWidth, height: newHeight };
                }),
            );
        };
        const onUp = () => {
            setResizing(null);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [resizing, imageFrameStyle.height, imageFrameStyle.width]);

    return (
        <div
            style={{
                cursor: status === 'hold' ? 'crosshair' : dragging ? 'grabbing' : 'crosshair',
                width: `${bBoxAnnotatorStyle.width}px`,
                height: `${bBoxAnnotatorStyle.height}px`,
            }}
            ref={bBoxAnnotatorRef}
            onMouseDown={mouseDownHandler}
        >
            <div
                style={{
                    position: 'relative',
                    backgroundSize: '100%',
                    width: `${imageFrameStyle.width}px`,
                    height: `${imageFrameStyle.height}px`,
                    backgroundImage: `url(${imageFrameStyle.backgroundImageSrc})`,
                }}
            >
                {status === 'hold' || status === 'input' ? <BBoxSelector rectangle={rect} /> : null}
                {status === 'input' ? (
                    <LabelBox
                        inputMethod={inputMethod}
                        top={rect.top + rect.height + borderWidth}
                        left={rect.left - borderWidth}
                        labels={labels}
                        onSubmit={addEntry}
                        ref={labelInputRef}
                    />
                ) : null}
                {entries.map((entry, i) => (
                    <div
                        style={{
                            border:
                                selectedId === entry.id
                                    ? `${borderWidth}px solid rgb(0,128,255)`
                                    : `${borderWidth}px solid rgb(255,0,0)`,
                            position: 'absolute',
                            top: `${entry.top - borderWidth}px`,
                            left: `${entry.left - borderWidth}px`,
                            width: `${entry.width}px`,
                            height: `${entry.height}px`,
                            color: 'rgb(255,0,0)',
                            fontFamily: 'monospace',
                            fontSize: 'small',
                            cursor: selectedId === entry.id ? 'move' : 'default',
                        }}
                        key={i}
                        onMouseOver={() =>
                            setEntries((prevEntries) =>
                                prevEntries.map((e) => (e.id === entry.id ? { ...e, showCloseButton: true } : e)),
                            )
                        }
                        onMouseLeave={() =>
                            setEntries((prevEntries) =>
                                prevEntries.map((e) => (e.id === entry.id ? { ...e, showCloseButton: false } : e)),
                            )
                        }
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedId(entry.id);
                            const pos = crop(e.pageX, e.pageY);
                            setDragging({
                                id: entry.id,
                                offsetX: pos.x - entry.left,
                                offsetY: pos.y - entry.top,
                            });
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(entry.id);
                            setEditingLabelForId(entry.id);
                        }}
                    >
                        {entry.showCloseButton ? (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    width: '16px',
                                    height: '0',
                                    padding: '16px 0 0 0',
                                    overflow: 'hidden',
                                    color: '#fff',
                                    backgroundColor: '#030',
                                    border: '2px solid #fff',
                                    borderRadius: '18px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    textAlign: 'center',
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                }}
                                onClick={() => {
                                    setEntries(entries.filter((e) => e.id !== entry.id));
                                    if (selectedId === entry.id) setSelectedId(null);
                                    if (editingLabelForId === entry.id) setEditingLabelForId(null);
                                }}
                            >
                                <div
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        width: '16px',
                                        position: 'absolute',
                                        top: '-2px',
                                        left: '0',
                                        fontSize: '16px',
                                        lineHeight: '16px',
                                        fontFamily:
                                            '"Helvetica Neue", Consolas, Verdana, Tahoma, Calibri, ' +
                                            'Helvetica, Menlo, "Droid Sans", sans-serif',
                                    }}
                                >
                                    &#215;
                                </div>
                            </div>
                        ) : null}
                        <div style={{ overflow: 'hidden' }}>{entry.label}</div>
                        {selectedId === entry.id ? (
                            <>
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        top: '-5px',
                                        left: '-5px',
                                        cursor: 'nwse-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 'nw',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        top: '-5px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        cursor: 'ns-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 'n',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        top: '-5px',
                                        right: '-5px',
                                        cursor: 'nesw-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 'ne',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        top: '50%',
                                        right: '-5px',
                                        transform: 'translateY(-50%)',
                                        cursor: 'ew-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 'e',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        bottom: '-5px',
                                        right: '-5px',
                                        cursor: 'nwse-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 'se',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        bottom: '-5px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        cursor: 'ns-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 's',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        bottom: '-5px',
                                        left: '-5px',
                                        cursor: 'nesw-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 'sw',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '8px',
                                        height: '8px',
                                        background: '#fff',
                                        border: '1px solid #007bff',
                                        top: '50%',
                                        left: '-5px',
                                        transform: 'translateY(-50%)',
                                        cursor: 'ew-resize',
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const pos = crop(e.pageX, e.pageY);
                                        setResizing({
                                            id: entry.id,
                                            handle: 'w',
                                            startX: pos.x,
                                            startY: pos.y,
                                            startRect: {
                                                left: entry.left,
                                                top: entry.top,
                                                width: entry.width,
                                                height: entry.height,
                                            },
                                        });
                                    }}
                                />
                            </>
                        ) : null}
                        {editingLabelForId === entry.id ? (
                            <LabelBox
                                inputMethod={inputMethod}
                                top={entry.height + borderWidth}
                                left={-borderWidth}
                                labels={labels}
                                initialValue={entry.label}
                                onSubmit={submitEditLabel}
                            />
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
});
BBoxAnnotator.displayName = 'BBoxAnnotator';
export default BBoxAnnotator;
