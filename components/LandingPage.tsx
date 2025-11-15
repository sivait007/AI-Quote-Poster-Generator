import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import TextIcon from './icons/TextIcon';
import PaletteIcon from './icons/PaletteIcon';

interface LandingPageProps {
  onStartCreating: () => void;
}

const SamplePoster: React.FC<{ background: string; text: string; fontFamily: string;}> = ({ background, text, fontFamily }) => (
    <div
        className={`aspect-[4/5] w-full rounded-2xl flex items-center justify-center p-8 text-center text-white font-bold text-3xl shadow-xl transform transition-transform duration-300 hover:scale-105 ${fontFamily}`}
        style={{
            background: background,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
        {text}
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onStartCreating }) => {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      <header className="py-4 px-6 md:px-12 flex justify-between items-center">
        <h1 className="text-3xl font-bold font-serif text-posterly-indigo">Posterly</h1>
        <button
          onClick={onStartCreating}
          className="hidden md:inline-block bg-posterly-indigo text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Create Now
        </button>
      </header>

      <main>
        {/* Hero Section */}
        <section className="text-center py-20 px-4 bg-white">
          <h2 className="text-4xl md:text-6xl font-extrabold font-serif mb-4">
            Create Stunning Quote Posters with <span className="text-posterly-purple">AI</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your words into beautiful, shareable art. Generate quotes, design with ease, and let our AI create unique backgrounds for you.
          </p>
          <button
            onClick={onStartCreating}
            className="bg-posterly-indigo text-white font-bold text-xl px-10 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Start Creating Now
          </button>
        </section>

        {/* Gallery Section */}
        <section className="py-20 px-4 md:px-12">
            <h3 className="text-3xl font-bold text-center mb-12">Unleash Your Creativity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <SamplePoster 
                    background="linear-gradient(to top right, #f857a6, #ff5858)" 
                    text="Dream big and dare to fail."
                    fontFamily="font-lobster"
                />
                <SamplePoster 
                    background="linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1542224562-23842320b522?q=80&w=1887&auto=format&fit=crop)" 
                    text="The best view comes after the hardest climb."
                    fontFamily="font-serif"
                />
                <SamplePoster 
                    background="linear-gradient(to top right, #9b5de5, #4cc9f0)" 
                    text="Creativity is intelligence having fun."
                    fontFamily="font-caveat"
                />
                <SamplePoster 
                    background="linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1887&auto=format&fit=crop)" 
                    text="Art washes away from the soul the dust of everyday life."
                    fontFamily="font-sans"
                />
                <SamplePoster 
                    background="linear-gradient(to top right, #00c9ff, #92fe9d)" 
                    text="Do what you love, love what you do."
                    fontFamily="font-pacifico"
                />
                <SamplePoster 
                    background="linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop)" 
                    text="In every walk with nature one receives far more than he seeks."
                    fontFamily="font-merriweather"
                />
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 md:px-12 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Powerful Features at Your Fingertips</h3>
            <p className="text-gray-600 mb-12">Everything you need to create the perfect design.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="bg-posterly-pink/20 p-4 rounded-full mb-4">
                   <TextIcon className="w-8 h-8 text-posterly-pink" />
                </div>
                <h4 className="text-xl font-bold mb-2">AI Quote Generation</h4>
                <p className="text-gray-600">
                  Stuck for words? Generate unique and inspiring quotes on any topic, in multiple languages, with a single click.
                </p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="bg-posterly-purple/20 p-4 rounded-full mb-4">
                    <SparklesIcon className="w-8 h-8 text-posterly-purple" />
                 </div>
                <h4 className="text-xl font-bold mb-2">AI Backgrounds</h4>
                <p className="text-gray-600">
                  Describe a theme or mood, and let our AI create a beautiful, abstract background image for your poster.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-posterly-blue/20 p-4 rounded-full mb-4">
                    <PaletteIcon className="w-8 h-8 text-posterly-blue" />
                </div>
                <h4 className="text-xl font-bold mb-2">Powerful Customization</h4>
                <p className="text-gray-600">
                  Fine-tune everything from fonts, colors, and gradients to padding, shadows, and aspect ratios for a truly unique look.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-8 text-gray-500">
        <p>&copy; {new Date().getFullYear()} Posterly. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;