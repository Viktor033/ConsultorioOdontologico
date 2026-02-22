import React from 'react';

export const ToothIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M7 3C4.23858 3 2 5.23858 2 8V11C2 13.7614 4.23858 16 7 16V19C7 20.6569 8.34315 22 10 22H14C15.6569 22 17 20.6569 17 19V16C19.7614 16 22 13.7614 22 11V8C22 5.23858 19.7614 3 17 3H7Z" />
        <path d="M7 3C7 6 9 8 12 8C15 8 17 6 17 3" />
    </svg>
);
