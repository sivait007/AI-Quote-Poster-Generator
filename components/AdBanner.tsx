import React, { useEffect } from 'react';

// Extend the Window interface to include the adsbygoogle property
declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const AdBanner: React.FC = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="w-full mt-6 text-center">
        <h4 className="text-xs text-gray-400 mb-2">Advertisement</h4>
        {/* 
          This is a sample AdSense ad unit.
          IMPORTANT: Replace the data-ad-client and data-ad-slot 
          with your own values from your AdSense account.
        */}
        <ins className="adsbygoogle"
             style={{ display: 'block', minHeight: '50px' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your client ID
             data-ad-slot="YYYYYYYYYY"               // Replace with your slot ID
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdBanner;
