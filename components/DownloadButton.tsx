import React from 'react';

// Make html2canvas available from the global scope
declare const html2canvas: any;

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
    const handleDownload = () => {
        const element = elementRef.current;
        if (element) {
            // Temporarily set position to relative for watermark positioning
            const originalPosition = element.style.position;
            element.style.position = 'relative';

            // Add watermark
            const watermark = document.createElement('div');
            watermark.innerText = 'Posterly';
            Object.assign(watermark.style, {
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                fontSize: '18px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.7)',
                pointerEvents: 'none',
                zIndex: '1000',
            });
            element.appendChild(watermark);

            html2canvas(element, { 
                scale: 3, // for high-resolution
                useCORS: true,
                backgroundColor: null, 
            }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = 'posterly-quote.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).finally(() => {
                // Cleanup: Remove watermark and restore original position
                element.removeChild(watermark);
                element.style.position = originalPosition;
            });
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