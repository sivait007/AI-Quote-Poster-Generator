import React from 'react';

interface InlineToolbarProps {
  isVisible: boolean;
  position: { top: number; left: number };
  activeRange: Range | null;
  className?: string;
  onStyleApplied: () => void;
}

const InlineToolbar: React.FC<InlineToolbarProps> = ({ isVisible, position, activeRange, className, onStyleApplied }) => {

  if (!isVisible) return null;

  const performStyleCommand = (action: (selection: Selection, range: Range) => void) => {
    if (!activeRange) return;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(activeRange);
      action(selection, activeRange);
      onStyleApplied(); // Sync state back to React
    }
  };

  const handleStyleClick = (command: string, value: string | null = null) => {
    performStyleCommand(() => {
        if (command === 'foreColor') {
            document.execCommand('styleWithCSS', false, 'true');
        }
        document.execCommand(command, false, value);
    });
  };

  const applyStyleWithSpan = (
    styleApplier: (span: HTMLSpanElement) => void,
    selection: Selection,
    range: Range
  ) => {
    try {
      const span = document.createElement('span');
      styleApplier(span);
      range.surroundContents(span);
      
      selection.removeAllRanges();
      range.selectNodeContents(span);
      selection.addRange(range);

    } catch (e) {
      console.warn("Manual styling with surroundContents failed, trying fallback.", e);
      try {
        const span = document.createElement('span');
        styleApplier(span);
        const selectedContent = range.extractContents();
        span.appendChild(selectedContent);
        range.insertNode(span);
        selection.removeAllRanges();
        range.selectNodeContents(span);
        selection.addRange(range);
      } catch (fallbackError) {
         console.error("Fallback manual styling also failed.", fallbackError);
      }
    }
  };

  const handleFontSize = (direction: 'increase' | 'decrease') => {
    performStyleCommand((selection, range) => {
        let parentElement = range.commonAncestorContainer;
        if (parentElement.nodeType === Node.TEXT_NODE) {
            parentElement = parentElement.parentNode!;
        }
        
        const currentSize = parseFloat(window.getComputedStyle(parentElement as Element).fontSize);
        const newSize = direction === 'increase' 
            ? Math.round(currentSize) + 2 
            : Math.max(8, Math.round(currentSize) - 2);
        
        applyStyleWithSpan(span => {
          span.style.fontSize = `${newSize}px`;
        }, selection, range);
    });
  };

  const handleOutline = () => {
    performStyleCommand((selection, range) => {
        applyStyleWithSpan(span => {
          span.style.setProperty('-webkit-text-stroke', '1px black');
          span.style.setProperty('text-stroke', '1px black');
          span.style.setProperty('paint-order', 'stroke fill');
        }, selection, range);
    });
  };


  return (
    <div
      id="inline-toolbar"
      className={`absolute z-10 bg-gray-800 text-white rounded-lg shadow-lg flex items-center p-0.5 space-x-0.5 transition-opacity duration-200 ${className || ''}`}
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%) translateY(-100%)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center">
        <button onClick={() => handleStyleClick('bold')} className="px-2 py-1 hover:bg-gray-700 rounded-l-md font-bold text-xs">B</button>
        <button onClick={() => handleStyleClick('italic')} className="px-2 py-1 hover:bg-gray-700 italic text-xs">I</button>
        <button onClick={() => handleStyleClick('underline')} className="px-2 py-1 hover:bg-gray-700 underline text-xs">U</button>
        <button
          onClick={handleOutline}
          className="px-2 py-1 hover:bg-gray-700 rounded-r-md font-bold text-xs"
          title="Apply text outline"
          style={{
              WebkitTextStroke: '1px black',
              textStroke: '1px black',
              paintOrder: 'stroke fill',
          } as React.CSSProperties}
        >
          O
        </button>
      </div>
      
      <div className="w-px h-4 bg-gray-600 mx-1"></div>
      
      <div className="px-1 py-1 hover:bg-gray-700 rounded-md flex items-center justify-center">
        <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => handleStyleClick('foreColor', e.target.value)}
            className="w-4 h-4 border-none bg-transparent cursor-pointer"
            title="Text color"
        />
      </div>
      
      <div className="w-px h-4 bg-gray-600 mx-1"></div>
      
      <div className="flex items-center">
        <button onClick={() => handleFontSize('decrease')} className="px-2 py-1 hover:bg-gray-700 rounded-l-md text-xs font-mono">-</button>
        <button onClick={() => handleFontSize('increase')} className="px-2 py-1 hover:bg-gray-700 rounded-r-md text-xs font-mono">+</button>
      </div>
    </div>
  );
};

export default InlineToolbar;