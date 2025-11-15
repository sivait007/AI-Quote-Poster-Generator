import React, { forwardRef, useRef, useEffect, useState } from 'react';
import type { StyleSettings } from '../types';
import InlineToolbar from './InlineToolbar';

interface QuoteEditorProps {
  quote: string;
  onQuoteChange: (newQuote: string) => void;
  styles: StyleSettings;
  setStyles: React.Dispatch<React.SetStateAction<StyleSettings>>;
  emojiInsertion: { emoji: string; timestamp: number } | null;
}

const QuoteEditor = forwardRef<HTMLDivElement, QuoteEditorProps>(({ quote, onQuoteChange, styles, setStyles, emojiInsertion }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const lastRangeRef = useRef<Range | null>(null);
  const internalHTMLRef = useRef<string | null>(null);

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
    activeRange: null as Range | null,
  });

  useEffect(() => {
    if (editorRef.current && quote !== editorRef.current.innerHTML) {
      if (editorRef.current.innerHTML === internalHTMLRef.current) {
        return;
      }
      const selection = window.getSelection();
      const isCurrentlyFocused = editorRef.current.contains(selection?.focusNode ?? null);
      if (!isCurrentlyFocused && !interactionRef.current.isInteracting) {
        editorRef.current.innerHTML = quote;
      }
    }
  }, [quote]);
  
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
            lastRangeRef.current = range;
        }
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const toolbarEl = document.getElementById('inline-toolbar');
        if (
            draggableRef.current && 
            !draggableRef.current.contains(event.target as Node) &&
            (!toolbarEl || !toolbarEl.contains(event.target as Node))
        ) {
            if (editorRef.current && editorRef.current.innerHTML !== quote) {
                onQuoteChange(editorRef.current.innerHTML);
            }
            setIsActive(false);
            setIsEditing(false);
            hideInlineToolbar();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [quote, onQuoteChange]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const preventDefault = (e: Event) => e.preventDefault();
      editor.addEventListener('contextmenu', preventDefault);
      return () => editor.removeEventListener('contextmenu', preventDefault);
    }
  }, []);
  
  useEffect(() => {
    if (emojiInsertion && editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
  
      const selection = window.getSelection();
      if (!selection) return;
  
      let range;
      // Use the last saved range if it's valid within the editor
      if (lastRangeRef.current && editor.contains(lastRangeRef.current.commonAncestorContainer)) {
        range = lastRangeRef.current;
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback to the end of the content
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false); // false means to the end
        selection.removeAllRanges();
        selection.addRange(range);
      }
  
      // Manually insert the emoji as a text node
      const emojiNode = document.createTextNode(emojiInsertion.emoji);
      range.deleteContents(); // Clear any selected text
      range.insertNode(emojiNode);
  
      // Move the cursor to after the inserted emoji
      range.setStartAfter(emojiNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
  
      // Save the new cursor position
      lastRangeRef.current = range.cloneRange();
  
      // Update parent state with new HTML
      const newHTML = editor.innerHTML;
      internalHTMLRef.current = newHTML;
      onQuoteChange(newHTML);
    }
  }, [emojiInsertion]);


  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newHTML = e.currentTarget.innerHTML;
    internalHTMLRef.current = newHTML;
    onQuoteChange(newHTML);
    hideInlineToolbar();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const handleBlur = () => {
    const selection = window.getSelection();
    if(selection && selection.rangeCount > 0) {
        const currentRange = selection.getRangeAt(0);
        // Only save the range if it's inside the editor
        if (editorRef.current && editorRef.current.contains(currentRange.commonAncestorContainer)) {
            lastRangeRef.current = currentRange.cloneRange();
        }
    }
    // Don't set editing to false immediately, wait for potential emoji click
    // setIsEditing(false); 
    hideInlineToolbar();
  };
  
  const hideInlineToolbar = () => {
     if (inlineToolbar.isVisible) {
        setInlineToolbar({ isVisible: false, position: { top: 0, left: 0 }, activeRange: null });
     }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(true);
    setIsEditing(true);
  };

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const touch = ('touches' in e && e.touches[0]) || ('changedTouches' in e && e.changedTouches[0]);
    return {
      clientX: touch ? touch.clientX : (e as MouseEvent).clientX,
      clientY: touch ? touch.clientY : (e as MouseEvent).clientY,
    };
  };

  const handleInteractionStart = (type: 'move' | 'resize' | 'rotate', e: React.MouseEvent | React.TouchEvent, handle: string | null = null) => {
    if (isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    const posterRect = (ref as React.RefObject<HTMLDivElement>)?.current?.getBoundingClientRect();
    if (!posterRect) return;

    const coords = getEventCoords(e);

    interactionRef.current = {
        type,
        handle,
        startX: coords.clientX,
        startY: coords.clientY,
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
        const startAngle = Math.atan2(coords.clientY - centerY, coords.clientX - centerX) * (180 / Math.PI);
        interactionRef.current.initialStyles.startAngle = startAngle - styles.rotation;
    }

    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleInteractionMove, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);
  };

  const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
    const { type, startX, startY, handle, initialStyles } = interactionRef.current;
    if (!type) return;

    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    
    const coords = getEventCoords(e);
    const dx = coords.clientX - startX;
    const dy = coords.clientY - startY;

    if (!interactionRef.current.isInteracting && Math.sqrt(dx*dx + dy*dy) > 5) {
        interactionRef.current.isInteracting = true;
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
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
            const currentAngle = Math.atan2(coords.clientY - centerY, coords.clientX - centerX) * (180 / Math.PI);
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
       setIsActive(true);
    }

    interactionRef.current.isInteracting = false;
    interactionRef.current.type = null;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    window.removeEventListener('mousemove', handleInteractionMove);
    window.removeEventListener('mouseup', handleInteractionEnd);
    window.removeEventListener('touchmove', handleInteractionMove);
    window.removeEventListener('touchend', handleInteractionEnd);
  };
  
  const handleEditorMouseUp = () => {
    setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const currentRange = selection.getRangeAt(0).cloneRange();
            lastRangeRef.current = currentRange;

            if (!selection.isCollapsed) {
                const rect = currentRange.getBoundingClientRect();
                const containerRect = draggableRef.current?.getBoundingClientRect();
                if (containerRect) {
                    setInlineToolbar({
                        isVisible: true,
                        position: {
                            top: rect.top - containerRect.top,
                            left: rect.left - containerRect.left + rect.width / 2,
                        },
                        activeRange: currentRange,
                    });
                }
            } else {
                hideInlineToolbar();
            }
        }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText.length >= 150 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      const selection = window.getSelection();
      if (selection && selection.isCollapsed) e.preventDefault();
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastRangeRef.current = selection.getRangeAt(0).cloneRange();
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
    WebkitTouchCallout: 'none',
  };

  const shadowClasses = ['shadow-none', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'];
  const maxWidthClass = { 'aspect-square': 'max-w-2xl', 'aspect-[4/5]': 'max-w-xl', 'aspect-[9/16]': 'max-w-md' }[styles.aspectRatio] || 'max-w-2xl';
  const resizeHandles = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];
  const handleCursors: { [key: string]: string } = { tl: 'nwse-resize', t: 'ns-resize', tr: 'nesw-resize', l: 'ew-resize', r: 'ew-resize', bl: 'nesw-resize', b: 'ns-resize', br: 'nwse-resize'};
  const handlePositions: { [key: string]: string } = { tl: 'top-0 left-0', t: 'top-0 left-1/2', tr: 'top-0 right-0', l: 'top-1/2 left-0', r: 'top-1/2 right-0', bl: 'bottom-0 left-0', b: 'bottom-0 left-1/2', br: 'bottom-0 right-0' };

  return (
    <div className="flex items-center justify-center w-full h-full">
        <div 
          ref={ref} 
          style={posterStyle} 
          className={`w-full ${maxWidthClass} ${styles.aspectRatio} transition-all duration-300 ${shadowClasses[styles.shadow]} overflow-hidden`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              if (editorRef.current && editorRef.current.innerHTML !== quote) {
                 onQuoteChange(editorRef.current.innerHTML);
              }
              setIsActive(false);
              setIsEditing(false);
              hideInlineToolbar();
            }
          }}
        >
            <div 
              ref={draggableRef} 
              style={textContainerStyle} 
              onMouseDown={(e) => handleInteractionStart('move', e)} 
              onTouchStart={(e) => handleInteractionStart('move', e)}
              onDoubleClick={handleDoubleClick}
            >
                 <div className={`w-full h-full relative ${isEditing ? '' : 'cursor-move'}`}>
                    {isActive && <div className="absolute inset-0 border border-dashed border-gray-400 pointer-events-none html2canvas-ignore" />}
                    <InlineToolbar 
                      isVisible={inlineToolbar.isVisible} 
                      position={inlineToolbar.position} 
                      activeRange={inlineToolbar.activeRange}
                      className="html2canvas-ignore" 
                      onStyleApplied={() => {
                        if (editorRef.current) {
                           const newHTML = editorRef.current.innerHTML;
                           internalHTMLRef.current = newHTML;
                           onQuoteChange(newHTML);
                        }
                      }}
                    />
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
                            <div 
                              className="absolute left-1/2 -translate-x-1/2 -top-12 w-6 h-7 flex flex-col items-center z-20 html2canvas-ignore" 
                              onMouseDown={(e) => handleInteractionStart('rotate', e, 'rotate')}
                              onTouchStart={(e) => handleInteractionStart('rotate', e, 'rotate')}
                            >
                                <div className="w-px h-3 bg-gray-500" />
                                <div className="w-4 h-4 rounded-full bg-white border border-gray-500" style={{ cursor: "url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M12.67%204.14C12.67%204.14%2012.67%204.14%2012.67%204.14C11.53%202.99%209.88%202.33%208.06%202.33C4.83%202.33%202.17%204.83%202.17%208C2.17%2011.17%204.83%2013.67%208.06%2013.67C9.53%2013.67%2010.86%2013.14%2011.88%2012.27L10.93%2011.32C10.21%2011.9%209.18%2012.27%208.06%2012.27C5.61%2012.27%203.58%2010.37%203.58%208C3.58%205.63%205.61%203.73%208.06%203.73C9.43%203.73%2010.65%204.28%2011.53%205.16L10.28%206.42H13.67V3L12.67%204.14Z%22%20fill%3D%22black%22/%3E%3C/svg%3E')%208%208%2C%20auto" }} />
                            </div>
                            {/* Resize Handles */}
                            {resizeHandles.map(handle => (
                                <div 
                                    key={handle}
                                    className={`absolute w-3 h-3 bg-white border border-gray-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 ${handlePositions[handle]} html2canvas-ignore`}
                                    style={{ cursor: handleCursors[handle] }}
                                    onMouseDown={(e) => handleInteractionStart('resize', e, handle)}
                                    onTouchStart={(e) => handleInteractionStart('resize', e, handle)}
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