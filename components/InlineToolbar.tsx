import React from 'react';

interface InlineToolbarProps {
  isVisible: boolean;
  position: { top: number; left: number };
  className?: string;
}

const InlineToolbar: React.FC<InlineToolbarProps> = ({ isVisible, position, className }) => {
  if (!isVisible) return null;

  const handleStyleClick = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
  };

  const handleFontSize = (direction: 'increase' | 'decrease') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    
    let startElement = range.startContainer;
    if (startElement.nodeType === Node.TEXT_NODE) {
      startElement = startElement.parentElement!;
    }

    const currentSize = parseFloat(window.getComputedStyle(startElement as Element).fontSize);
    const newSize = direction === 'increase' 
        ? Math.round(currentSize) + 2 
        : Math.max(8, Math.round(currentSize) - 2);

    const span = document.createElement('span');
    span.style.fontSize = `${newSize}px`;

    try {
      range.surroundContents(span);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    } catch (e) {
      console.error("Failed to apply font size. The selection may be too complex.", e);
    }
  };

  const handleOutline = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');

    // This applies a 1px black outline.
    span.style.setProperty('-webkit-text-stroke', '1px black');
    span.style.setProperty('text-stroke', '1px black');
    // This property ensures the fill is drawn on top of the stroke,
    // which prevents the stroke from making the letter appear thinner.
    span.style.setProperty('paint-order', 'stroke fill');

    try {
      range.surroundContents(span);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    } catch (e) {
      console.error("Failed to apply outline. The selection may be too complex.", e);
    }
  };


  return (
    <div
      className={`absolute z-10 bg-gray-800 text-white rounded-lg shadow-lg flex items-center p-1 transition-opacity duration-200 ${className || ''}`}
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%) translateY(-100%)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
    >
      <button onClick={() => handleStyleClick('bold')} className="p-2 hover:bg-gray-700 rounded-md font-bold">B</button>
      <button onClick={() => handleStyleClick('italic')} className="p-2 hover:bg-gray-700 rounded-md italic">I</button>
      <button onClick={() => handleStyleClick('underline')} className="p-2 hover:bg-gray-700 rounded-md underline">U</button>
      <button
        onClick={handleOutline}
        className="p-2 hover:bg-gray-700 rounded-md font-bold"
        title="Apply text outline"
        style={{
            WebkitTextStroke: '1px black',
            textStroke: '1px black',
            paintOrder: 'stroke fill',
        } as React.CSSProperties}
      >
        O
      </button>
      <div className="w-px h-5 bg-gray-600 mx-1"></div>
      <div className="p-1 hover:bg-gray-700 rounded-md flex items-center justify-center">
        <input
            type="color"
            defaultValue="#FFFF00"
            onChange={(e) => handleStyleClick('backColor', e.target.value)}
            className="w-5 h-5 border-none bg-transparent cursor-pointer"
            title="Text highlight color"
        />
      </div>
      <div className="w-px h-5 bg-gray-600 mx-1"></div>
      <button onClick={() => handleFontSize('decrease')} className="px-2 py-1 hover:bg-gray-700 rounded-md text-lg font-mono">-</button>
      <button onClick={() => handleFontSize('increase')} className="px-2 py-1 hover:bg-gray-700 rounded-md text-lg font-mono">+</button>
    </div>
  );
};

export default InlineToolbar;