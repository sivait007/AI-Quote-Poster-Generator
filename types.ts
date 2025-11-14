export interface StyleSettings {
  background: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
  textColor: string;
  padding: number;
  borderRadius: number;
  shadow: number;
  aspectRatio: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  rotation: number;
}

export interface Gradient {
  name: string;
  css: string;
}

export interface FontFamily {
  name: string;
  className: string;
  value: string;
  lang: string;
}

export interface Quote {
  quote: string;
  category: string;
  lang: string;
}