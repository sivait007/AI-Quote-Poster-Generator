import React, { forwardRef, useRef, useEffect, useState } from 'react';
import type { StyleSettings, FontFamily } from '../types';
import InlineToolbar from './InlineToolbar';

interface QuoteEditorProps {
  quote: string;
  onQuoteChange: (newQuote: string) => void;
  styles: StyleSettings;
  setStyles: React.Dispatch<React.SetStateAction<StyleSettings>>;
  fontFamilies: FontFamily[];
}

interface ToolbarState {
    visible: boolean;
    top: number;
    left: number;
}

const QuoteEditor = forwardRef<HTMLDivElement, QuoteEditorProps>(({ quote, onQuoteChange, styles, setStyles, fontFamilies }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialTextPos = useRef({ x: 0, y: 0 });
  const dragThreshold = 5;

  const [toolbarState, setToolbarState] = useState<ToolbarState>({ visible: false, top: 0, left: 0 });
  
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== quote) {
      editorRef.current.innerHTML = quote;
    }
  }, [quote]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onQuoteChange(e.currentTarget.innerHTML);
  };

  const handleStyleCommand = (command: string, value: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      if (editorRef.current) {
          onQuoteChange(editorRef.current.innerHTML);
      }
      setToolbarState({ ...toolbarState, visible: false });
  };

  const handleFontSizeChange = (amount: number) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      let node = selection.anchorNode;
      if (node?.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
      }
      if (!node || !editorRef.current?.contains(node)) return;

      const currentSize = parseFloat(window.getComputedStyle(node as Element).fontSize);
      const newSize = Math.max(8, currentSize + amount);

      // Use execCommand with a placeholder size to wrap the selection.
      // This handles complex selections across multiple nodes robustly.
      document.execCommand('fontSize', false, '7'); 

      const editor = editorRef.current;
      if (editor) {
          // Find all the <font> tags that execCommand created
          const fontElements = editor.querySelectorAll('font[size="7"]');
          
          fontElements.forEach(fontElement => {
              // Create a new span to replace the font tag
              const newSpan = document.createElement('span');
              newSpan.style.fontSize = `${newSize}px`;

              // Move the content from the font tag to the new span
              while (fontElement.firstChild) {
                  newSpan.appendChild(fontElement.firstChild);
              }

              // Replace the font tag with the new span
              fontElement.parentNode?.replaceChild(newSpan, fontElement);
          });

          // Update the state with the new HTML
          onQuoteChange(editor.innerHTML);
      }

      // Clean up
      selection.removeAllRanges();
      setToolbarState({ ...toolbarState, visible: false });
  };
  
  const showOrHideToolbar = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const posterRect = (ref as React.RefObject<HTMLDivElement>)?.current?.getBoundingClientRect();

      if(posterRect) {
          setToolbarState({
              visible: true,
              top: rect.top - posterRect.top,
              left: (rect.left - posterRect.left) + rect.width / 2,
          });
      }
    } else {
      setToolbarState({ ...toolbarState, visible: false });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialTextPos.current = { x: styles.position.x, y: styles.position.y };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) >= dragThreshold) {
        isDragging.current = true;
        document.body.style.userSelect = 'none';
        window.getSelection()?.removeAllRanges();
        setToolbarState({ ...toolbarState, visible: false });
      } else {
        return;
      }
    }

    if (!(ref as React.RefObject<HTMLDivElement>)?.current) return;

    const posterRect = (ref as React.RefObject<HTMLDivElement>).current!.getBoundingClientRect();
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    const newX = initialTextPos.current.x + (dx / posterRect.width) * 100;
    const newY = initialTextPos.current.y + (dy / posterRect.height) * 100;
    
    setStyles(prev => ({
        ...prev,
        position: { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) }
    }));
  };

  const handleMouseUp = () => {
    if (!isDragging.current) {
        showOrHideToolbar();
    }
    
    isDragging.current = false;
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const posterStyle: React.CSSProperties = {
    background: styles.background,
    padding: `${styles.padding}px`,
    borderRadius: `${styles.borderRadius}px`,
    position: 'relative'
  };

  const textContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${styles.position.y}%`,
    left: `${styles.position.x}%`,
    transform: 'translate(-50%, -50%)',
    width: '90%', 
    cursor: 'move',
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${styles.fontSize}px`,
    fontWeight: styles.fontWeight,
    fontStyle: styles.fontStyle,
    color: styles.textColor,
    textAlign: styles.textAlign,
    minHeight: `${styles.fontSize * 1.2}px`,
    lineHeight: '1.4',
  };

  const shadowClasses = ['shadow-none', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'];
  const maxWidthClass = {
    'aspect-square': 'max-w-2xl',
    'aspect-[4/5]': 'max-w-xl',
    'aspect-[9/16]': 'max-w-md'
  }[styles.aspectRatio] || 'max-w-2xl';

  return (
    <div className="flex items-center justify-center w-full h-full">
        <div
            ref={ref} 
            style={posterStyle}
            className={`w-full ${maxWidthClass} ${styles.aspectRatio} transition-all duration-300 ${shadowClasses[styles.shadow]} overflow-hidden`}
        >
            <InlineToolbar
              visible={toolbarState.visible}
              top={toolbarState.top}
              left={toolbarState.left}
              onStyleCommand={handleStyleCommand}
              onFontSizeChange={handleFontSizeChange}
              fontFamilies={fontFamilies}
            />
            <div ref={draggableRef} style={textContainerStyle} onMouseDown={handleMouseDown}>
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    className={`focus:outline-none w-full ${styles.fontFamily}`}
                    style={textStyle}
                    spellCheck="false"
                />
            </div>
        </div>
    </div>
  );
});

QuoteEditor.displayName = 'QuoteEditor';
export default QuoteEditor;