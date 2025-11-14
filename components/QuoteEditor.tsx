import React, { forwardRef, useRef, useEffect, useState } from 'react';
import type { StyleSettings } from '../types';
import InlineToolbar from './InlineToolbar';

interface QuoteEditorProps {
  quote: string;
  onQuoteChange: (newQuote: string) => void;
  styles: StyleSettings;
  setStyles: React.Dispatch<React.SetStateAction<StyleSettings>>;
}

const QuoteEditor = forwardRef<HTMLDivElement, QuoteEditorProps>(({ quote, onQuoteChange, styles, setStyles }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const interactionRef = useRef({
    type: null as 'move' | 'resize' | 'rotate' | null,
    handle: null as string | null,
    startX: 0,
    startY: 0,
    isInteracting: false,
    initialStyles: {} as Partial<StyleSettings & { initialWidthPx: number, initialHeightPx: number, startAngle: number }>,
  });

  const [inlineToolbar, setInlineToolbar] = useState({
    isVisible: false,
    position: { top: 0, left: 0 },
  });

  useEffect(() => {
    if (editorRef.current && quote !== editorRef.current.innerHTML && !isEditing) {
      editorRef.current.innerHTML = quote;
    }
  }, [quote, isEditing]);
  
  useEffect(() => {
    if (isEditing && editorRef.current) {
        editorRef.current.focus();
        const selection = window.getSelection();
        if (selection) {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false); // to end
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (draggableRef.current && !draggableRef.current.contains(event.target as Node)) {
            setIsActive(false);
            setIsEditing(false);
            hideInlineToolbar();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onQuoteChange(e.currentTarget.innerHTML);
    hideInlineToolbar();
  };

  const handleBlur = () => {
    setIsEditing(false);
    hideInlineToolbar();
  };
  
  const hideInlineToolbar = () => {
     if (inlineToolbar.isVisible) {
        setInlineToolbar({ isVisible: false, position: { top: 0, left: 0 } });
     }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(true);
    setIsEditing(true);
  };

  const handleInteractionStart = (type: 'move' | 'resize' | 'rotate', e: React.MouseEvent, handle: string | null = null) => {
    if (isEditing) return; // Don't interact if in edit mode
    e.preventDefault();
    e.stopPropagation();
    
    const posterRect = (ref as React.RefObject<HTMLDivElement>)?.current?.getBoundingClientRect();
    if (!posterRect) return;

    interactionRef.current = {
        type,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        isInteracting: false,
        initialStyles: {
            ...styles,
            initialWidthPx: (styles.width / 100) * posterRect.width,
            initialHeightPx: (styles.height / 100) * posterRect.height,
        }
    };

    if (type === 'rotate') {
        const textRect = draggableRef.current!.getBoundingClientRect();
        const centerX = textRect.left + textRect.width / 2;
        const centerY = textRect.top + textRect.height / 2;
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        interactionRef.current.initialStyles.startAngle = startAngle - styles.rotation;
    }

    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
  };

  const handleInteractionMove = (e: MouseEvent) => {
    const { type, startX, startY, handle, initialStyles } = interactionRef.current;
    if (!type) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!interactionRef.current.isInteracting && Math.sqrt(dx*dx + dy*dy) > 5) {
        interactionRef.current.isInteracting = true;
        document.body.style.userSelect = 'none';
        window.getSelection()?.removeAllRanges();
        hideInlineToolbar();
    }
    
    if (interactionRef.current.isInteracting) {
        const posterRect = (ref as React.RefObject<HTMLDivElement>)!.current!.getBoundingClientRect();
        
        if (type === 'move') {
            const newX = initialStyles.position!.x + (dx / posterRect.width) * 100;
            const newY = initialStyles.position!.y + (dy / posterRect.height) * 100;
            setStyles(prev => ({ ...prev, position: { x: newX, y: newY } }));
        } else if (type === 'rotate') {
            const textRect = draggableRef.current!.getBoundingClientRect();
            const centerX = textRect.left + textRect.width / 2;
            const centerY = textRect.top + textRect.height / 2;
            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
            setStyles(prev => ({ ...prev, rotation: currentAngle - initialStyles.startAngle! }));
        } else if (type === 'resize') {
            let { initialWidthPx, initialHeightPx, position } = initialStyles;
            let newWidthPx = initialWidthPx!;
            let newHeightPx = initialHeightPx!;
            let newX = position!.x;
            let newY = position!.y;

            if (handle?.includes('r')) newWidthPx += dx;
            if (handle?.includes('l')) newWidthPx -= dx;
            if (handle?.includes('b')) newHeightPx += dy;
            if (handle?.includes('t')) newHeightPx -= dy;

            if (handle?.includes('l')) newX += (dx / posterRect.width) * 100 / 2;
            if (handle?.includes('r')) newX += (dx / posterRect.width) * 100 / 2;
            if (handle?.includes('t')) newY += (dy / posterRect.height) * 100 / 2;
            if (handle?.includes('b')) newY += (dy / posterRect.height) * 100 / 2;

            setStyles(prev => ({ 
                ...prev, 
                width: (newWidthPx / posterRect.width) * 100,
                height: (newHeightPx / posterRect.height) * 100,
                position: { x: newX, y: newY }
            }));
        }
    }
  };

  const handleInteractionEnd = () => {
    if (!interactionRef.current.isInteracting && !isEditing) {
       // A simple click when not in edit mode should select the box.
       setIsActive(true);
    }

    interactionRef.current.isInteracting = false;
    interactionRef.current.type = null;
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleInteractionMove);
    window.removeEventListener('mouseup', handleInteractionEnd);
  };
  
  const handleEditorMouseUp = () => {
    // Use a timeout to allow the selection to update
    setTimeout(() => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const containerRect = draggableRef.current?.getBoundingClientRect();
            if (containerRect) {
                setInlineToolbar({
                    isVisible: true,
                    position: {
                        top: rect.top - containerRect.top,
                        left: rect.left - containerRect.left + rect.width / 2,
                    },
                });
            }
        } else {
            hideInlineToolbar();
        }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText.length >= 150 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      const selection = window.getSelection();
      if (selection && selection.isCollapsed) e.preventDefault();
    }
  };

  const posterStyle: React.CSSProperties = { background: styles.background, padding: `${styles.padding}px`, borderRadius: `${styles.borderRadius}px`, position: 'relative' };
  const textContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${styles.position.y}%`,
    left: `${styles.position.x}%`,
    width: `${styles.width}%`,
    height: `${styles.height}%`,
    transform: `translate(-50%, -50%) rotate(${styles.rotation}deg)`,
  };
  const textStyle: React.CSSProperties = {
    fontSize: `${styles.fontSize}px`,
    fontWeight: styles.fontWeight,
    fontStyle: styles.fontStyle,
    color: styles.textColor,
    textAlign: styles.textAlign,
    lineHeight: '1.4',
  };

  const shadowClasses = ['shadow-none', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'];
  const maxWidthClass = { 'aspect-square': 'max-w-2xl', 'aspect-[4/5]': 'max-w-xl', 'aspect-[9/16]': 'max-w-md' }[styles.aspectRatio] || 'max-w-2xl';
  const resizeHandles = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];
  const handleCursors: { [key: string]: string } = { tl: 'nwse-resize', t: 'ns-resize', tr: 'nesw-resize', l: 'ew-resize', r: 'ew-resize', bl: 'nesw-resize', b: 'ns-resize', br: 'nwse-resize'};
  const handlePositions: { [key: string]: string } = { tl: 'top-0 left-0', t: 'top-0 left-1/2', tr: 'top-0 right-0', l: 'top-1/2 left-0', r: 'top-1/2 right-0', bl: 'bottom-0 left-0', b: 'bottom-0 left-1/2', br: 'bottom-0 right-0' };

  return (
    <div className="flex items-center justify-center w-full h-full">
        <div ref={ref} style={posterStyle} className={`w-full ${maxWidthClass} ${styles.aspectRatio} transition-all duration-300 ${shadowClasses[styles.shadow]} overflow-hidden`}>
            <div ref={draggableRef} style={textContainerStyle} onMouseDown={(e) => handleInteractionStart('move', e)} onDoubleClick={handleDoubleClick}>
                 <div className={`w-full h-full relative ${isEditing ? '' : 'cursor-move'}`}>
                    {isActive && <div className="absolute inset-0 border border-dashed border-gray-400 pointer-events-none" />}
                    <InlineToolbar isVisible={inlineToolbar.isVisible} position={inlineToolbar.position} />
                    <div
                        ref={editorRef}
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onInput={handleInput}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onMouseUp={handleEditorMouseUp}
                        className={`focus:outline-none w-full h-full overflow-y-hidden ${styles.fontFamily}`}
                        style={textStyle}
                        spellCheck="false"
                    />
                    {isActive && (
                        <>
                           {/* Rotation Handle */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-6 h-7 flex flex-col items-center z-20" onMouseDown={(e) => handleInteractionStart('rotate', e, 'rotate')}>
                                <div className="w-px h-3 bg-gray-500" />
                                <div className="w-4 h-4 rounded-full bg-white border border-gray-500" style={{ cursor: "url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M12.67%204.14C12.67%204.14%2012.67%204.14%2012.67%204.14C11.53%202.99%209.88%202.33%208.06%202.33C4.83%202.33%202.17%204.83%202.17%208C2.17%2011.17%204.83%2013.67%208.06%2013.67C9.53%2013.67%2010.86%2013.14%2011.88%2012.27L10.93%2011.32C10.21%2011.9%209.18%2012.27%208.06%2012.27C5.61%2012.27%203.58%2010.37%203.58%208C3.58%205.63%205.61%203.73%208.06%203.73C9.43%203.73%2010.65%204.28%2011.53%205.16L10.28%206.42H13.67V3L12.67%204.14Z%22%20fill%3D%22black%22/%3E%3C/svg%3E')%208%208%2C%20auto" }} />
                            </div>
                            {/* Resize Handles */}
                            {resizeHandles.map(handle => (
                                <div 
                                    key={handle}
                                    className={`absolute w-3 h-3 bg-white border border-gray-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 ${handlePositions[handle]}`}
                                    style={{ cursor: handleCursors[handle] }}
                                    onMouseDown={(e) => handleInteractionStart('resize', e, handle)}
                                />
                            ))}
                        </>
                    )}
                 </div>
            </div>
        </div>
    </div>
  );
});

QuoteEditor.displayName = 'QuoteEditor';
export default QuoteEditor;