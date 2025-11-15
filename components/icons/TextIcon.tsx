import React from 'react';

const TextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 3h9m4.5-9H21m-2.25 3h2.25m-2.25 3h2.25M3 12l3 3 3-3m-3 6l3 3 3-3" />
  </svg>
);

export default TextIcon;
