import React from 'react';
import type { FontFamily } from '../types';

interface InlineToolbarProps {
  visible: boolean;
  top: number;
  left: number;
  onStyleCommand: (command: string, value: string) => void;
  onFontSizeChange: (amount: number) => void;
  fontFamilies: FontFamily[];
}

const InlineToolbar: React.FC<InlineToolbarProps> = ({ visible, top, left, onStyleCommand, onFontSizeChange, fontFamilies }) => {
    
    if (!visible) return null;

    return (
        <div 
            style={{ top, left, transform: 'translate(-50%, -125%)' }} 
            className="absolute z-50 bg-gray-800 text-white rounded-lg shadow-xl flex items-center p-1 space-x-1"
            onMouseDown={(e) => e.preventDefault()} // Prevents loss of text selection when interacting with the toolbar
        >
            <input 
                type="color" 
                defaultValue="#ffffff"
                onChange={(e) => onStyleCommand('foreColor', e.target.value)} 
                className="w-7 h-7 p-0.5 border-none bg-transparent rounded cursor-pointer"
                title="Change color"
            />
            <button onClick={() => onFontSizeChange(-2)} className="w-7 h-7 text-lg hover:bg-gray-700 rounded leading-none">-</button>
            <button onClick={() => onFontSizeChange(2)} className="w-7 h-7 text-lg hover:bg-gray-700 rounded leading-none">+</button>
            <select 
                onChange={(e) => { if(e.target.value) onStyleCommand('fontName', e.target.value)}}
                className="bg-gray-800 text-white text-sm border-none focus:ring-0 rounded h-7"
            >
                <option value="">Font</option>
                {fontFamilies.map(f => (
                    <option key={f.name} value={f.value}>
                        {f.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default InlineToolbar;