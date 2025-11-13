import React, { useState, useRef, useEffect } from 'react';
import QuoteEditor from './components/QuoteEditor';
import Toolbar from './components/Toolbar';
import DownloadButton from './components/DownloadButton';
import type { StyleSettings } from './types';
import { GRADIENTS, FONT_FAMILIES, FALLBACK_QUOTES } from './constants';
import { generateQuote, generateBackground } from './services/geminiService';

const App: React.FC = () => {
    const posterRef = useRef<HTMLDivElement>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [quote, setQuote] = useState('');

    const [styles, setStyles] = useState<StyleSettings>({
        background: GRADIENTS[0].css,
        fontSize: 48,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        fontFamily: FONT_FAMILIES[0].className,
        textColor: '#ffffff',
        padding: 80,
        borderRadius: 24,
        shadow: 3,
        aspectRatio: 'aspect-square',
        position: { x: 50, y: 50 }, // Center of the poster
    });

    useEffect(() => {
        // Load initial quote
        setQuote(FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)].quote);
    }, []);

    const handleGenerateQuote = async (topic: string) => {
        setIsAiLoading(true);
        const newQuote = await generateQuote(topic);
        setQuote(newQuote);
        setIsAiLoading(false);
    };

    const handleGenerateBackground = async (prompt: string) => {
        setIsAiLoading(true);
        const newBackground = await generateBackground(prompt);
        if (newBackground) {
            setStyles(prev => ({ ...prev, background: `url(${newBackground}) center center / cover no-repeat` }));
        }
        setIsAiLoading(false);
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row items-start">
            <header className="w-full md:hidden p-4 bg-white/80 backdrop-blur-sm fixed top-0 z-10 flex items-center justify-center shadow-md">
                 <h1 className="text-2xl font-bold font-serif text-posterly-indigo">Posterly</h1>
            </header>
            
            <main className="w-full h-full flex-grow flex items-center justify-center p-4 pt-20 md:p-8 md:pt-8">
                 <QuoteEditor 
                    ref={posterRef} 
                    quote={quote} 
                    onQuoteChange={setQuote} 
                    styles={styles} 
                    setStyles={setStyles}
                    fontFamilies={FONT_FAMILIES}
                />
            </main>

            <aside className="w-full md:w-auto p-4 md:p-8">
                 <Toolbar 
                    styles={styles} 
                    setStyles={setStyles}
                    gradients={GRADIENTS}
                    fontFamilies={FONT_FAMILIES}
                    onGenerateQuote={handleGenerateQuote}
                    onGenerateBackground={handleGenerateBackground}
                    isAiLoading={isAiLoading}
                />
            </aside>
            
            <DownloadButton elementRef={posterRef} isAiLoading={isAiLoading} />
        </div>
    );
};

export default App;
