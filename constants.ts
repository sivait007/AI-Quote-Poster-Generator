import { Gradient, FontFamily, Quote } from './types';

export const GRADIENTS: Gradient[] = [
  { name: 'Sunset', css: 'linear-gradient(to right, #ff7e5f, #feb47b)' },
  { name: 'Ocean', css: 'linear-gradient(to right, #00c6ff, #0072ff)' },
  { name: 'Peach', css: 'linear-gradient(to right, #ffddd2, #ff8a8a)' },
  { name: 'Aurora', css: 'linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)' },
  { name: 'Midnight', css: 'linear-gradient(to right, #2c3e50, #4ca1af)' },
  { name: 'Posterly 1', css: 'linear-gradient(to right, #ff7eb3, #9b5de5)'},
  { name: 'Posterly 2', css: 'linear-gradient(to right, #9b5de5, #3b1dd1)'},
  { name: 'Posterly 3', css: 'linear-gradient(to right, #4cc9f0, #3b1dd1)'},
];

export const FONT_FAMILIES: FontFamily[] = [
  { name: 'Playfair', className: 'font-serif', value: "'Playfair Display', serif" },
  { name: 'Inter', className: 'font-sans', value: "'Inter', sans-serif" },
  { name: 'Roboto Mono', className: "font-mono", value: "'Roboto Mono', monospace" },
  { name: 'Lobster', className: "font-['Lobster']", value: "'Lobster', cursive" },
];

export const FALLBACK_QUOTES: Quote[] = [
    { "quote": "The only way to do great work is to love what you do.", "category": "Motivational" },
    { "quote": "Your limitation—it's only your imagination.", "category": "Motivational" },
    { "quote": "The best time to plant a tree was 20 years ago. The second best time is now.", "category": "Motivational" },
    { "quote": "Love is not just looking at each other, it's looking in the same direction.", "category": "Love" },
    { "quote": "To love and be loved is to feel the sun from both sides.", "category": "Love" },
    { "quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "category": "Success" },
    { "quote": "The road to success and the road to failure are almost exactly the same.", "category": "Success" },
    { "quote": "The purpose of our lives is to be happy.", "category": "Happiness" },
    { "quote": "Happiness is not something readymade. It comes from your own actions.", "category": "Happiness" }
];