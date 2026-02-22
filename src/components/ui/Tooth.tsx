"use client";

import React from 'react';

interface ToothProps {
    number: number;
    data?: { [surface: string]: string };
    onSurfaceClick: (tooth: number, surface: string) => void;
    selectedTool: string;
}

const toolColors: Record<string, string> = {
    caries: '#ef4444',
    restauracion: '#3b82f6',
    ausente: '#64748b',
    protesis: '#f59e0b',
    limpieza: '#10b981',
};

/**
 * Determine if a tooth number corresponds to an anterior tooth (incisors/canines).
 * FDI notation: 11-13, 21-23, 31-33, 41-43
 */
function isAnterior(num: number): boolean {
    const n = num % 10;
    return n >= 1 && n <= 3;
}

/**
 * Upper arch: 11-18, 21-28   →  quadrant 1 or 2
 * Lower arch: 31-38, 41-48   →  quadrant 3 or 4
 */
function isUpper(num: number): boolean {
    const q = Math.floor(num / 10);
    return q === 1 || q === 2;
}

interface SurfacePath {
    id: string;
    d: string;
    label: string;
    labelX: number;
    labelY: number;
}

/**
 * Build the 5 SVG surface paths for a tooth cell in a 100×100 viewBox.
 * 
 * For POSTERIOR teeth (molars / premolars):
 *   The standard cross-pentagonal layout:
 *     Vestibular  = top trapezoid
 *     Lingual     = bottom trapezoid
 *     Mesial      = left trapezoid
 *     Distal      = right trapezoid
 *     Oclusal     = center square
 *
 * For ANTERIOR teeth (incisors / canines):
 *   Same layout but the "center" is called Incisal (I) instead of Oclusal.
 *
 * Mesial side follows FDI: for upper-right (q1) and lower-left (q3) it is the RIGHT side;
 * for upper-left (q2) and lower-right (q4) it is the LEFT side.
 * We keep it simple and always label the surfaces correctly regardless of side flip — 
 * the practitioner understands from tooth number which is which.
 */
function buildSurfaces(toothNum: number): SurfacePath[] {
    // Outer boundary: 10..90
    // Inner box: 30..70
    const anterior = isAnterior(toothNum);
    const centerLabel = anterior ? 'I' : 'O'; // Incisal or Oclusal

    // For upper-right (q1) mesial is on the right, distal on the left.
    // For upper-left (q2) mesial is on the left, distal on the right.
    // We present them left=L_SURFACE right=R_SURFACE based on quadrant.
    const q = Math.floor(toothNum / 10);
    // q1, q4: tooth number increases away from midline → mesial is RIGHT side of the cell
    // q2, q3: tooth number increases away from midline → mesial is LEFT side of the cell
    const mesialOnRight = q === 1 || q === 4;

    const [leftLabel, rightLabel] = mesialOnRight
        ? ['D', 'M']
        : ['M', 'D'];

    const upper = isUpper(toothNum);
    // For upper teeth, vestibular is physically towards lip (top of cell).
    // For lower teeth, vestibular is also towards lip (bottom of cell in standard layout),
    // but conventionally in 2D charts upper arch is drawn root-up, lower arch root-down.
    // We flip V/L for lower teeth so that:
    //   upper → V on top, L on bottom
    //   lower → V on bottom, L on top  (matches standard printed chart orientation)
    const [topLabel, bottomLabel] = upper ? ['V', 'L'] : ['L', 'V'];

    return [
        // top trapezoid
        {
            id: upper ? 'vestibular' : 'lingual',
            label: topLabel,
            labelX: 50,
            labelY: 22,
            d: 'M 10,10 L 90,10 L 70,30 L 30,30 Z',
        },
        // bottom trapezoid
        {
            id: upper ? 'lingual' : 'vestibular',
            label: bottomLabel,
            labelX: 50,
            labelY: 78,
            d: 'M 10,90 L 90,90 L 70,70 L 30,70 Z',
        },
        // left trapezoid
        {
            id: mesialOnRight ? 'distal' : 'mesial',
            label: leftLabel,
            labelX: 20,
            labelY: 50,
            d: 'M 10,10 L 10,90 L 30,70 L 30,30 Z',
        },
        // right trapezoid
        {
            id: mesialOnRight ? 'mesial' : 'distal',
            label: rightLabel,
            labelX: 80,
            labelY: 50,
            d: 'M 90,10 L 90,90 L 70,70 L 70,30 Z',
        },
        // center
        {
            id: anterior ? 'incisal' : 'oclusal',
            label: centerLabel,
            labelX: 50,
            labelY: 52,
            d: 'M 30,30 L 70,30 L 70,70 L 30,70 Z',
        },
    ];
}

export default function Tooth({ number, data = {}, onSurfaceClick, selectedTool }: ToothProps) {
    const surfaces = buildSurfaces(number);
    const absent = Object.values(data).includes('ausente');

    const getFill = (id: string) => {
        const treatment = data[id];
        return treatment ? toolColors[treatment] ?? '#e2e8f0' : 'white';
    };

    const getStroke = (id: string) => {
        const treatment = data[id];
        return treatment ? toolColors[treatment] ?? '#cbd5e1' : '#cbd5e1';
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            opacity: absent ? 0.45 : 1,
        }}>
            <span style={{
                fontSize: '0.65rem', fontWeight: 800, color: '#64748b',
                lineHeight: 1, letterSpacing: '-0.01em',
            }}>
                {number}
            </span>

            <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                {absent && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', color: '#64748b', zIndex: 2, pointerEvents: 'none',
                    }}>
                        ✕
                    </div>
                )}
                <svg
                    viewBox="0 0 100 100"
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* Outer border */}
                    <rect x="10" y="10" width="80" height="80" rx="4"
                        fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

                    {surfaces.map(s => (
                        <g key={s.id} onClick={() => onSurfaceClick(number, s.id)} style={{ cursor: 'pointer' }}>
                            <path
                                d={s.d}
                                fill={getFill(s.id)}
                                stroke={getStroke(s.id)}
                                strokeWidth="1"
                                style={{ transition: 'fill 0.15s' }}
                            />
                            {/* Surface label */}
                            <text
                                x={s.labelX}
                                y={s.labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="13"
                                fontWeight="800"
                                fill={data[s.id] ? 'white' : '#94a3b8'}
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >
                                {s.label}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}
