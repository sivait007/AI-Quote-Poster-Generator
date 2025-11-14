import React, { useState, useRef, useEffect } from 'react';
import type { StyleSettings, Gradient, FontFamily } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import AdBanner from './AdBanner';

interface ToolbarProps {
  styles: StyleSettings;
  setStyles: React.Dispatch<React.SetStateAction<StyleSettings>>;
  gradients: Gradient[];
  fontFamilies: FontFamily[];
  onGenerateQuote: (topic: string, lang: string) => void;
  onGenerateBackground: (prompt: string) => void;
  isAiLoading: boolean;
  onInsertEmoji: (emoji: string) => void;
  onFontSizeAdjust: (amount: number) => void;
}

type Tab = 'style' | 'text' | 'ai';
type CustomBgMode = 'solid' | 'gradient';

const Toolbar: React.FC<ToolbarProps> = ({ styles, setStyles, gradients, fontFamilies, onGenerateQuote, onGenerateBackground, isAiLoading, onInsertEmoji, onFontSizeAdjust }) => {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [aiQuoteTopic, setAiQuoteTopic] = useState('Motivation');
  const [aiBgPrompt, setAiBgPrompt] = useState('Calm blue waves');
  const [aiLang, setAiLang] = useState('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customBgMode, setCustomBgMode] = useState<CustomBgMode>('solid');
  const [gradientColors, setGradientColors] = useState(['#ff7eb3', '#9b5de5']);

  const updateStyle = <K extends keyof StyleSettings,>(key: K, value: StyleSettings[K]) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (customBgMode === 'gradient') {
      updateStyle('background', `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`);
    }
  }, [gradientColors, customBgMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const imageUrl = event.target?.result as string;
              updateStyle('background', `url(${imageUrl}) center center / cover no-repeat`);
          };
          reader.readAsDataURL(file);
      }
  };
  
  const emojis = ['😊', '❤️', '✨', '🎉', '👍', '🙏', '😂', '🔥', '🚀', '💡', '🌟', '🤔'];

  const TabButton: React.FC<{tab: Tab, label: string}> = ({tab, label}) => (
     <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
          activeTab === tab ? 'bg-posterly-purple text-white' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        {label}
      </button>
  );

  const ModeButton: React.FC<{mode: CustomBgMode, label: string}> = ({mode, label}) => (
    <button
        onClick={() => setCustomBgMode(mode)}
        className={`px-3 py-1 text-sm rounded-md transition-colors w-full ${
            customBgMode === mode ? 'bg-posterly-indigo text-white' : 'text-gray-500 hover:bg-gray-300'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl shadow-black/10 p-4 md:p-6 text-gray-800 flex flex-col">
      <h2 className="text-2xl font-bold font-serif text-posterly-indigo mb-4">Customize</h2>
      <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <TabButton tab="text" label="Text" />
        <TabButton tab="style" label="Style" />
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-2 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'ai' 
              ? 'text-white bg-gradient-to-r from-posterly-pink to-posterly-purple shadow-md scale-105' 
              : 'text-white bg-gradient-to-r from-posterly-pink/90 to-posterly-purple/90 hover:opacity-95'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          <span>AI Magic</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {activeTab === 'style' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Background Gradient</h3>
              <div className="grid grid-cols-4 gap-2">
                {gradients.map(g => (
                  <button key={g.name} onClick={() => updateStyle('background', g.css)} style={{ background: g.css }} className="w-full h-12 rounded-lg border-2 border-white/50 hover:scale-105 transition-transform" />
                ))}
              </div>
            </div>
            
            <div>
                <h3 className="font-bold mb-2">Custom Background</h3>
                <div className="bg-gray-100 rounded-lg p-1 flex space-x-1 mb-3">
                    <ModeButton mode="solid" label="Solid"/>
                    <ModeButton mode="gradient" label="Gradient"/>
                </div>
                {customBgMode === 'solid' && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="customColor" className="text-sm">Color:</label>
                        <input id="customColor" type="color" value={typeof styles.background === 'string' && styles.background.startsWith('#') ? styles.background : '#ffffff'} onChange={(e) => updateStyle('background', e.target.value)} className="w-8 h-8 rounded border-gray-300" />
                    </div>
                )}
                {customBgMode === 'gradient' && (
                    <div className="flex items-center gap-3">
                        <label className="text-sm">Colors:</label>
                        <input type="color" value={gradientColors[0]} onChange={e => setGradientColors([e.target.value, gradientColors[1]])} className="w-8 h-8 rounded border-gray-300" />
                        <input type="color" value={gradientColors[1]} onChange={e => setGradientColors([gradientColors[0], e.target.value])} className="w-8 h-8 rounded border-gray-300" />
                    </div>
                )}
                 <div className="mt-3">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">Upload Image</button>
                 </div>
            </div>

             <div>
                <h3 className="font-bold mb-2">Aspect Ratio</h3>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => updateStyle('aspectRatio', 'aspect-square')}
                        className={`py-2 text-sm rounded-lg border transition-colors ${styles.aspectRatio === 'aspect-square' ? 'bg-posterly-indigo text-white border-posterly-indigo' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                    >
                        Square
                    </button>
                    <button
                        onClick={() => updateStyle('aspectRatio', 'aspect-[4/5]')}
                        className={`py-2 text-sm rounded-lg border transition-colors ${styles.aspectRatio === 'aspect-[4/5]' ? 'bg-posterly-indigo text-white border-posterly-indigo' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                    >
                        Portrait
                    </button>
                    <button
                        onClick={() => updateStyle('aspectRatio', 'aspect-[9/16]')}
                        className={`py-2 text-sm rounded-lg border transition-colors ${styles.aspectRatio === 'aspect-[9/16]' ? 'bg-posterly-indigo text-white border-posterly-indigo' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                    >
                        Story
                    </button>
                </div>
            </div>
            <div>
                <h3 className="font-bold mb-2">Poster Style</h3>
                <div className="space-y-3">
                    <label className="flex items-center justify-between">
                        <span>Padding</span>
                        <input type="range" min="20" max="150" value={styles.padding} onChange={e => updateStyle('padding', +e.target.value)} className="w-3/4" />
                    </label>
                    <label className="flex items-center justify-between">
                        <span>Corners</span>
                        <input type="range" min="0" max="100" value={styles.borderRadius} onChange={e => updateStyle('borderRadius', +e.target.value)} className="w-3/4" />
                    </label>
                    <label className="flex items-center justify-between">
                        <span>Shadow</span>
                        <input type="range" min="0" max="4" step="1" value={styles.shadow} onChange={e => updateStyle('shadow', +e.target.value)} className="w-3/4" />
                    </label>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Font Family</h3>
              <select onChange={e => updateStyle('fontFamily', e.target.value)} value={styles.fontFamily} className="w-full p-2 rounded-lg border border-gray-300 bg-white">
                {fontFamilies.map(f => <option key={f.name} value={f.className}>{f.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Tip: You can type in any language directly into the editor.
              </p>
            </div>
             <div>
              <h3 className="font-bold mb-2">Emojis</h3>
              <div className="grid grid-cols-6 gap-2 bg-gray-100 p-2 rounded-lg">
                {emojis.map(emoji => (
                    <button 
                        key={emoji} 
                        onClick={() => onInsertEmoji(emoji)}
                        className="text-2xl p-1 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        {emoji}
                    </button>
                ))}
              </div>
            </div>
            <div>
                <h3 className="font-bold mb-2">Size & Weight</h3>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => onFontSizeAdjust(-2)} className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300">-</button>
                    <span className="text-center w-10">{styles.fontSize}px</span>
                    <button onClick={() => onFontSizeAdjust(2)} className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300">+</button>
                    <div className="flex-grow" />
                    <button onClick={() => updateStyle('fontWeight', styles.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded-lg ${styles.fontWeight === 'bold' ? 'bg-posterly-indigo text-white' : 'bg-gray-200'}`}>B</button>
                    <button onClick={() => updateStyle('fontStyle', styles.fontStyle === 'italic' ? 'normal' : 'italic')} className={`p-2 rounded-lg italic ${styles.fontStyle === 'italic' ? 'bg-posterly-indigo text-white' : 'bg-gray-200'}`}>I</button>
                 </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Alignment & Color</h3>
              <div className="flex items-center space-x-2">
                <button onClick={() => updateStyle('textAlign', 'left')} className={`p-2 rounded-lg ${styles.textAlign === 'left' ? 'bg-posterly-indigo text-white' : 'bg-gray-200'}`}>L</button>
                <button onClick={() => updateStyle('textAlign', 'center')} className={`p-2 rounded-lg ${styles.textAlign === 'center' ? 'bg-posterly-indigo text-white' : 'bg-gray-200'}`}>C</button>
                <button onClick={() => updateStyle('textAlign', 'right')} className={`p-2 rounded-lg ${styles.textAlign === 'right' ? 'bg-posterly-indigo text-white' : 'bg-gray-200'}`}>R</button>
                <div className="flex-grow" />
                <button onClick={() => updateStyle('textColor', '#ffffff')} className="w-8 h-8 rounded-full bg-white border-2 border-gray-300"></button>
                <button onClick={() => updateStyle('textColor', '#000000')} className="w-8 h-8 rounded-full bg-black border-2 border-gray-300"></button>
                <input type="color" value={styles.textColor} onChange={e => updateStyle('textColor', e.target.value)} className="w-8 h-8 rounded border-gray-300" />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'ai' && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-posterly-purple" /> AI Quote Generator</h3>
                    <p className="text-xs text-gray-500 mb-2">Generate a unique quote on any topic in your chosen language.</p>
                    <div className="flex space-x-2">
                        <input type="text" value={aiQuoteTopic} onChange={e => setAiQuoteTopic(e.target.value)} placeholder="e.g. Success" className="w-full p-2 rounded-lg border border-gray-300 bg-white" />
                        <select value={aiLang} onChange={e => setAiLang(e.target.value)} className="p-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-posterly-purple">
                            <option value="en">EN</option>
                            <option value="ta">TA</option>
                            <option value="hi">HI</option>
                        </select>
                        <button onClick={() => onGenerateQuote(aiQuoteTopic, aiLang)} disabled={isAiLoading} className="px-4 py-2 bg-posterly-purple text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                            {isAiLoading ? '...' : 'Go'}
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-posterly-purple" /> AI Background Generator</h3>
                    <p className="text-xs text-gray-500 mb-2">Describe a theme for an abstract background.</p>
                    <div className="flex space-x-2">
                        <input type="text" value={aiBgPrompt} onChange={e => setAiBgPrompt(e.target.value)} placeholder="e.g. Cosmic nebula" className="w-full p-2 rounded-lg border border-gray-300 bg-white" />
                        <button onClick={() => onGenerateBackground(aiBgPrompt)} disabled={isAiLoading} className="px-4 py-2 bg-posterly-purple text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                            {isAiLoading ? '...' : 'Create'}
                        </button>
                    </div>
                     {isAiLoading && <p className="text-xs text-center mt-2 text-gray-500">AI is thinking... this can take a moment.</p>}
                </div>
            </div>
        )}
      </div>
      <AdBanner />
    </div>
  );
};

export default Toolbar;