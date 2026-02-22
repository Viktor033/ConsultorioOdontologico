import { Patient, Appointment } from './api';

interface OdontogramData {
    [tooth: number]: { [surface: string]: string };
}

const toolColors: Record<string, string> = {
    caries: '#ef4444',
    restauracion: '#3b82f6',
    ausente: '#475569',
    protesis: '#f59e0b',
    limpieza: '#10b981',
};

const toolLabels: Record<string, string> = {
    caries: 'Caries',
    restauracion: 'Restauración',
    ausente: 'Ausente',
    protesis: 'Prótesis',
    limpieza: 'Limpieza',
};

const surfaceAbbrev: Record<string, string> = {
    vestibular: 'V', lingual: 'L', mesial: 'M', distal: 'D',
    oclusal: 'O', incisal: 'I',
    top: 'V', bottom: 'L', left: 'M', right: 'D', center: 'O',
};

function isAnteriorTooth(num: number): boolean {
    const n = num % 10;
    return n >= 1 && n <= 3;
}

function isUpperTooth(num: number): boolean {
    const q = Math.floor(num / 10);
    return q === 1 || q === 2;
}

/**
 * Renders an inline SVG for a single tooth with 5 individually colored surfaces.
 */
function toothSVG(num: number, data: { [surface: string]: string } | undefined): string {
    const d = data || {};
    const anterior = isAnteriorTooth(num);
    const upper = isUpperTooth(num);
    const q = Math.floor(num / 10);
    const mesialOnRight = q === 1 || q === 4;

    const topId = upper ? 'vestibular' : 'lingual';
    const bottomId = upper ? 'lingual' : 'vestibular';
    const leftId = mesialOnRight ? 'distal' : 'mesial';
    const rightId = mesialOnRight ? 'mesial' : 'distal';
    const centerId = anterior ? 'incisal' : 'oclusal';

    const topLbl = upper ? 'V' : 'L';
    const bottomLbl = upper ? 'L' : 'V';
    const leftLbl = mesialOnRight ? 'D' : 'M';
    const rightLbl = mesialOnRight ? 'M' : 'D';
    const centLbl = anterior ? 'I' : 'O';

    const fill = (id: string) => d[id] ? toolColors[d[id]] ?? '#e2e8f0' : '#f8fafc';
    const txt = (id: string) => d[id] ? 'white' : '#94a3b8';
    const str = (id: string) => d[id] ? toolColors[d[id]] ?? '#cbd5e1' : '#cbd5e1';

    const absent = Object.values(d).includes('ausente');
    const opacity = absent ? '0.5' : '1';

    return `<svg width="36" height="36" viewBox="0 0 100 100" style="display:block;opacity:${opacity}" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" rx="4" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 10,10 L 90,10 L 70,30 L 30,30 Z" fill="${fill(topId)}" stroke="${str(topId)}" stroke-width="1"/>
  <text x="50" y="23" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="900" fill="${txt(topId)}" font-family="Arial,sans-serif">${topLbl}</text>
  <path d="M 10,90 L 90,90 L 70,70 L 30,70 Z" fill="${fill(bottomId)}" stroke="${str(bottomId)}" stroke-width="1"/>
  <text x="50" y="79" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="900" fill="${txt(bottomId)}" font-family="Arial,sans-serif">${bottomLbl}</text>
  <path d="M 10,10 L 10,90 L 30,70 L 30,30 Z" fill="${fill(leftId)}" stroke="${str(leftId)}" stroke-width="1"/>
  <text x="20" y="51" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="900" fill="${txt(leftId)}" font-family="Arial,sans-serif">${leftLbl}</text>
  <path d="M 90,10 L 90,90 L 70,70 L 70,30 Z" fill="${fill(rightId)}" stroke="${str(rightId)}" stroke-width="1"/>
  <text x="80" y="51" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="900" fill="${txt(rightId)}" font-family="Arial,sans-serif">${rightLbl}</text>
  <path d="M 30,30 L 70,30 L 70,70 L 30,70 Z" fill="${fill(centerId)}" stroke="${str(centerId)}" stroke-width="1"/>
  <text x="50" y="51" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="900" fill="${txt(centerId)}" font-family="Arial,sans-serif">${centLbl}</text>
  ${absent ? '<line x1="18" y1="18" x2="82" y2="82" stroke="#475569" stroke-width="4"/><line x1="82" y1="18" x2="18" y2="82" stroke="#475569" stroke-width="4"/>' : ''}
</svg>`;
}


function toothRow(number: number, data: { [surface: string]: string } | undefined): string {
    if (!data || Object.keys(data).length === 0) return '';
    const surfaces = Object.entries(data)
        .filter(([, v]) => v)
        .map(([surf, treatment]) => {
            const abbrev = surfaceAbbrev[surf] ?? surf.charAt(0).toUpperCase();
            return `<span style="display:inline-block;margin:1px 3px;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;color:white;background:${toolColors[treatment] ?? '#888'}">${abbrev} — ${toolLabels[treatment] ?? treatment}</span>`;
        }).join('');
    return `<tr>
        <td style="padding:6px 10px;font-weight:700;font-size:12px;border-bottom:1px solid #f1f5f9;width:60px;">${number}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;">${surfaces}</td>
    </tr>`;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
}

export function exportClinicalHistory(
    patient: Patient,
    appointments: Appointment[],
    odontogramData: OdontogramData
): void {
    const allTeeth = [
        18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
        48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
    ];

    const patientApps = appointments
        .filter(a => a.paciente?.dni === patient.dniPaciente || (a as any).dniPaciente === patient.dniPaciente)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Build odontogram table rows
    const odontogramRows = allTeeth
        .map(n => toothRow(n, odontogramData[n]))
        .filter(Boolean)
        .join('');

    // Build appointments rows
    const appRows = patientApps.length > 0
        ? patientApps.map(a => `
            <tr>
                <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;">${formatDate(a.fecha)}</td>
                <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;">${a.hora}</td>
                <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;">${a.motivo}</td>
                <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;">
                    <span style="padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;
                        background:${a.estado === 'COMPLETADO' ? '#dcfce7' : a.estado === 'CANCELADO' ? '#fee2e2' : a.estado === 'CONFIRMADO' ? '#dbeafe' : '#fef9c3'};
                        color:${a.estado === 'COMPLETADO' ? '#166534' : a.estado === 'CANCELADO' ? '#991b1b' : a.estado === 'CONFIRMADO' ? '#1d4ed8' : '#854d0e'}">
                        ${a.estado}
                    </span>
                </td>
                <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;">${a.observaciones || '—'}</td>
            </tr>`).join('')
        : `<tr><td colspan="5" style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">Sin turnos registrados</td></tr>`;

    // Antecedents
    let antecedents = 'Sin antecedentes registrados.';
    try {
        const parsed = JSON.parse(patient.antecedents || '{}');
        const lines: string[] = [];
        if (parsed.diabetes) lines.push('• Diabetes');
        if (parsed.hipertension) lines.push('• Hipertensión');
        if (parsed.alergias) lines.push(`• Alergias: ${parsed.alergias}`);
        if (parsed.medicamentos) lines.push(`• Medicamentos: ${parsed.medicamentos}`);
        if (parsed.otros) lines.push(`• Otros: ${parsed.otros}`);
        if (lines.length) antecedents = lines.join('<br>');
    } catch { /* keep default */ }

    const now = new Date();
    const issuedAt = now.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Historia Clínica — ${patient.apellido}, ${patient.nombre}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: white; }

        .page { max-width: 800px; margin: 0 auto; padding: 36px 40px; }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #1d4ed8; margin-bottom: 28px; }
        .logo-area h1 { font-size: 22px; font-weight: 800; color: #1d4ed8; }
        .logo-area p  { font-size: 12px; color: #64748b; margin-top: 2px; }
        .issue-info   { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
        .issue-info strong { color: #1e293b; }

        /* Patient card */
        .patient-card { background: linear-gradient(135deg,#1e3a5f,#2563eb); color: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 20px; align-items: center; }
        .avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; flex-shrink: 0; }
        .patient-details h2 { font-size: 18px; font-weight: 800; }
        .patient-details p  { font-size: 12px; opacity: 0.8; margin-top: 3px; }
        .patient-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 24px; margin-top: 10px; }
        .patient-grid span { font-size: 11px; opacity: 0.85; }
        .patient-grid strong { display: block; font-size: 12px; }

        /* Section */
        .section { margin-bottom: 24px; }
        .section-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }

        /* Tables */
        table { width: 100%; border-collapse: collapse; }
        th { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; padding: 8px 10px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left; }

        /* Antecedents */
        .antecedents-box { background: #fef9c3; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; font-size: 12px; line-height: 1.8; }

        /* Legend */
        .legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; }
        .legend-dot  { width: 12px; height: 12px; border-radius: 3px; }

        /* Footer */
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }

        /* Odontogram visual grid */
        .tooth-grid { display: flex; flex-wrap: nowrap; gap: 4px; margin-bottom: 6px; justify-content: center; }
        .tooth-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .tooth-num { font-size: 8px; font-weight: 800; color: #64748b; line-height: 1; }
        .tooth-divider { border: none; border-top: 2px dashed #cbd5e1; margin: 8px 0; }

        @page { size: A4; margin: 0; }
        @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .page { padding: 20px 24px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
<div class="page">

    <!-- Header -->
    <div class="header">
        <div class="logo-area">
            <h1>🦷 DentalCare</h1>
            <p>Sistema de Gestión Odontológica</p>
        </div>
        <div class="issue-info">
            <strong>Historia Clínica</strong><br>
            Emitido: ${issuedAt}<br>
            DNI: ${patient.dniPaciente}
        </div>
    </div>

    <!-- Patient Card -->
    <div class="patient-card">
        <div class="avatar">${patient.nombre.charAt(0)}${patient.apellido.charAt(0)}</div>
        <div class="patient-details" style="flex:1">
            <h2>${patient.apellido}, ${patient.nombre}</h2>
            <p>DNI: ${patient.dniPaciente} ${patient.obraSocial ? '· ' + patient.obraSocial : ''}</p>
            <div class="patient-grid">
                <div><span>Teléfono</span><strong>${patient.telefono || '—'}</strong></div>
                <div><span>Email</span><strong>${patient.email || '—'}</strong></div>
                <div><span>Fecha de nac.</span><strong>${formatDate(patient.fecha_nac || '')}</strong></div>
                <div><span>Dirección</span><strong>${patient.direccion || '—'}</strong></div>
                <div><span>Citas registradas</span><strong>${patientApps.length}</strong></div>
            </div>
        </div>
    </div>

    <!-- Antecedents -->
    <div class="section">
        <div class="section-title">Antecedentes Médicos</div>
        <div class="antecedents-box">${antecedents}</div>
    </div>

    <!-- Appointment History -->
    <div class="section">
        <div class="section-title">Historial de Turnos (${patientApps.length} registros)</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                </tr>
            </thead>
            <tbody>${appRows}</tbody>
        </table>
    </div>

    <!-- Odontogram -->
    <div class="section">
        <div class="section-title">Estado del Odontograma</div>

        <!-- Color legend -->
        <div class="legend">
            ${Object.entries(toolLabels).map(([id, label]) =>
        `<div class="legend-item"><div class="legend-dot" style="background:${toolColors[id]}"></div><span>${label}</span></div>`
    ).join('')}
            <div class="legend-item"><div class="legend-dot" style="background:#e2e8f0"></div><span>Sin tratamiento</span></div>
        </div>

        <!-- Upper teeth visual (SVG per tooth, 5 surfaces) -->
        <div class="tooth-grid">
            ${[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map(n =>
        `<div class="tooth-cell">
                    <div class="tooth-num">${n}</div>
                    ${toothSVG(n, odontogramData[n])}
                </div>`
    ).join('')}
        </div>
        <hr class="tooth-divider">
        <div class="tooth-grid">
            ${[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map(n =>
        `<div class="tooth-cell">
                    ${toothSVG(n, odontogramData[n])}
                    <div class="tooth-num">${n}</div>
                </div>`
    ).join('')}
        </div>

        <!-- Detailed odontogram table -->
        ${odontogramRows ? `
        <table style="margin-top:16px">
            <thead><tr><th style="width:60px">Diente</th><th>Tratamientos</th></tr></thead>
            <tbody>${odontogramRows}</tbody>
        </table>` : `<p style="margin-top:12px;font-size:12px;color:#94a3b8;text-align:center">Sin tratamientos registrados en el odontograma.</p>`}
    </div>

    <!-- Footer -->
    <div class="footer">
        <span>DentalCare — Sistema de Gestión Odontológica</span>
        <span>Generado el ${issuedAt} · Documento de uso interno</span>
    </div>

</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
        alert('El navegador bloqueó la ventana emergente. Permití popups para este sitio.');
        return;
    }
    win.document.write(html);
    win.document.close();
}
