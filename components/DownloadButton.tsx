import React from 'react';
import html2canvas from 'html2canvas';

interface DownloadButtonProps {
    elementRef: React.RefObject<HTMLDivElement>;
    isAiLoading: boolean;
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);


const DownloadButton: React.FC<DownloadButtonProps> = ({ elementRef, isAiLoading }) => {
    const handleDownload = async () => {
        const element = elementRef.current;
        if (!element) {
            console.error("Poster element not found for download.");
            alert("Could not find the poster to download. Please refresh and try again.");
            return;
        }

        if (typeof html2canvas !== 'function') {
            console.error("html2canvas library failed to load as a function.");
            alert("The download library failed to load. Please check your internet connection and refresh the page.");
            return;
        }

        const watermark = document.createElement('div');
        const style = document.createElement('style');

        try {
            watermark.id = 'temp-watermark';
            watermark.innerText = 'Posterly';
            Object.assign(watermark.style, {
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                fontSize: '18px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '1px 2px 4px rgba(0, 0, 0, 0.7)',
                fontFamily: 'sans-serif',
                zIndex: '1000',
                pointerEvents: 'none',
            });
            element.appendChild(watermark);

            style.id = 'temp-hide-style';
            style.innerHTML = '.html2canvas-ignore { display: none !important; }';
            document.head.appendChild(style);

            await new Promise(resolve => setTimeout(resolve, 150));

            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: true,
            });

            const link = document.createElement('a');
            link.download = 'posterly-quote.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error("Error generating poster with html2canvas:", error);
            alert("Sorry, something went wrong while creating your poster image. This can sometimes happen with complex backgrounds or fonts. Please try again.");
        } finally {
            if (watermark.parentNode === element) {
                element.removeChild(watermark);
            }
            if (style.parentNode === document.head) {
                document.head.removeChild(style);
            }
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isAiLoading}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-16 h-16 bg-posterly-indigo text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Download Poster"
        >
            <DownloadIcon className="w-8 h-8"/>
        </button>
    );
};

export default DownloadButton;