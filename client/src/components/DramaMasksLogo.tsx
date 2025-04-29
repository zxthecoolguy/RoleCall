import React from 'react';

type LogoProps = {
  size?: number;
  className?: string;
};

export default function DramaMasksLogo({ size = 40, className = '' }: LogoProps) {
  return (
    <div className={`masks-logo ${className}`} style={{ width: size * 2.5, height: size }}>
      {/* Comedy Mask (Happy) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        width={size} 
        height={size} 
        className="mask-comedy"
        style={{ position: 'absolute', left: 0, zIndex: 2 }}
      >
        <path 
          d="M85 50c0 19.33-15.67 35-35 35S15 69.33 15 50 30.67 15 50 15s35 15.67 35 35z" 
          fill="#2E1A45" 
          stroke="#BE3C50" 
          strokeWidth="2"
        />
        <path 
          d="M35 40c5.52 0 10-4.48 10-10s-4.48-10-10-10-10 4.48-10 10 4.48 10 10 10zm30 0c5.52 0 10-4.48 10-10s-4.48-10-10-10-10 4.48-10 10 4.48 10 10 10z" 
          fill="#2E1A45" 
          stroke="#BE3C50" 
          strokeWidth="2"
        />
        <path 
          d="M65 60c0 8.28-6.72 15-15 15s-15-6.72-15-15h30z" 
          fill="none" 
          stroke="#BE3C50" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path d="M25 35c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm50 0c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" fill="#BE3C50"/>
      </svg>

      {/* Tragedy Mask (Sad) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        width={size} 
        height={size} 
        className="mask-tragedy"
        style={{ position: 'absolute', left: size * 1.5, zIndex: 1 }}
      >
        <path 
          d="M85 50c0 19.33-15.67 35-35 35S15 69.33 15 50 30.67 15 50 15s35 15.67 35 35z" 
          fill="#2E1A45" 
          stroke="#8C50C8" 
          strokeWidth="2"
        />
        <path 
          d="M35 40c5.52 0 10-4.48 10-10s-4.48-10-10-10-10 4.48-10 10 4.48 10 10 10zm30 0c5.52 0 10-4.48 10-10s-4.48-10-10-10-10 4.48-10 10 4.48 10 10 10z" 
          fill="#2E1A45" 
          stroke="#8C50C8" 
          strokeWidth="2"
        />
        <path 
          d="M65 70c0-8.28-6.72-15-15-15s-15 6.72-15 15" 
          fill="none" 
          stroke="#8C50C8" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path d="M25 35c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm50 0c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" fill="#8C50C8"/>
      </svg>
    </div>
  );
}