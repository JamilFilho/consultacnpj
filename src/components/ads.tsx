import React, { useEffect } from 'react';

interface AdComponentProps {
  adSlot: string;
  adFormat?: string;
  adLayout?: string;
}

const AdComponent: React.FC<AdComponentProps> = ({ adSlot, adFormat = 'auto', adLayout = '' }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const interval = setInterval(() => {
      if ((window as any).adsbygoogle) {
        try {
          (window as any).adsbygoogle.push({});
        } catch (e) {
          console.error('AdSense error:', e);
        }
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-8744567957048944"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      {...(adLayout ? { 'data-ad-layout': adLayout } : {})} // só inclui se não for vazio
    />
  );
};

export default AdComponent;