import React, { useState, useRef, useEffect } from 'react';
import QuoteEditor from './components/QuoteEditor';
import Toolbar from './components/Toolbar';
import DownloadButton from './components/DownloadButton';
import type { StyleSettings } from './types';
import { GRADIENTS, FONT_FAMILIES, FALLBACK_QUOTES } from './constants';
import { generateQuote, generateBackground } from './services/geminiService';

// Helper function to determine base font size based on screen width
const getBaseFontSize = () => {
    const width = window.innerWidth;
    if (width < 768) return 27; // Mobile
    if (width < 1024) return 36; // Tablet
    return 32; // Desktop
};

const App: React.FC = () => {
    const posterRef = useRef<HTMLDivElement>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [quote, setQuote] = useState('');
    const [emojiInsertion, setEmojiInsertion] = useState<{ emoji: string; timestamp: number } | null>(null);
    const [fontSizeDelta, setFontSizeDelta] = useState(0); // User adjustments


    const [styles, setStyles] = useState<StyleSettings>({
        background: GRADIENTS[0].css,
        fontSize: getBaseFontSize(),
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
        width: 80,
        height: 50,
        rotation: 0,
    });

    // Effect to handle responsive font size on window resize and user adjustments
    useEffect(() => {
        const handleResize = () => {
            setStyles(prev => ({
                ...prev,
                fontSize: getBaseFontSize() + fontSizeDelta
            }));
        };

        handleResize(); // Set size on mount and when delta changes
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [fontSizeDelta]);

    useEffect(() => {
        // Load initial quote in English
        const englishQuotes = FALLBACK_QUOTES.filter(q => q.lang === 'en');
        setQuote(englishQuotes[Math.floor(Math.random() * englishQuotes.length)].quote);
    }, []);

    const handleGenerateQuote = async (topic: string, lang: string) => {
        setIsAiLoading(true);
        const newQuote = await generateQuote(topic, lang);
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

    const handleInsertEmoji = (emoji: string) => {
        setEmojiInsertion({ emoji, timestamp: Date.now() });
    };

    const handleFontSizeAdjust = (amount: number) => {
        setFontSizeDelta(prev => prev + amount);
    };

    return (
        <div className="w-full h-screen bg-gray-100 font-sans flex flex-col md:flex-row items-start">
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
                    emojiInsertion={emojiInsertion}
                />
            </main>

            <aside className="w-full md:w-auto p-4 md:p-8 flex-shrink-0">
                 <Toolbar 
                    styles={styles} 
                    setStyles={setStyles}
                    gradients={GRADIENTS}
                    fontFamilies={FONT_FAMILIES}
                    onGenerateQuote={handleGenerateQuote}
                    onGenerateBackground={handleGenerateBackground}
                    isAiLoading={isAiLoading}
                    onInsertEmoji={handleInsertEmoji}
                    onFontSizeAdjust={handleFontSizeAdjust}
                />
            </aside>
            
            <DownloadButton elementRef={posterRef} isAiLoading={isAiLoading} />
        </div>
    );
};

export default App;
