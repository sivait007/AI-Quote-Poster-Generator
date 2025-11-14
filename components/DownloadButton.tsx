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
        if (!element) {
            console.error("Poster element not found for download.");
            alert("Could not find the poster to download. Please refresh and try again.");
            return;
        }

        // Temporarily hide active editor controls to prevent them appearing in the screenshot
        const activeControls = element.querySelectorAll('.z-10, .z-20, .border-dashed');
        activeControls.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

        html2canvas(element, { 
            scale: 3, // for high-resolution
            useCORS: true,
            allowTaint: true, // Helps with cross-origin images/fonts
            backgroundColor: null, 
        }).then((canvas: HTMLCanvasElement) => {
            // Restore visibility of controls
            activeControls.forEach(el => (el as HTMLElement).style.visibility = 'visible');

            const ctx = canvas.getContext('2d');
            if (ctx) {
                // The canvas is scaled up by 3, so we need to scale our watermark position and font size too.
                const scale = 3;
                const watermarkText = 'Posterly';
                const fontSize = 18 * scale;
                const padding = 30 * scale;

                ctx.font = `500 ${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                
                // Text shadow for better visibility
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowOffsetX = 1 * scale;
                ctx.shadowOffsetY = 2 * scale;
                ctx.shadowBlur = 4 * scale;

                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                
                ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);
            }

            // Trigger download
            const link = document.createElement('a');
            link.download = 'posterly-quote.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
        }).catch((error: any) => {
            // Also restore visibility in case of an error
            activeControls.forEach(el => (el as HTMLElement).style.visibility = 'visible');
            console.error("Error generating poster with html2canvas:", error);
            alert("Sorry, something went wrong while creating your poster image. This can sometimes happen with complex backgrounds or fonts. Please try again.");
        });
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
