const API_BASE_URL = 'http://localhost:8080/prueba';

export interface Patient {
    dniPaciente: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    direccion?: string;
    obraSocial?: string;
    fecha_nac?: string;
    antecedents?: string;
}

export interface Appointment {
    id?: number;
    fecha: string;
    hora: string;
    motivo: string;
    estado: string;
    observaciones?: string;
    dniPaciente: string; // Used for creation
    paciente?: {
        dni: string;
        nombre: string;
        apellido: string;
    };
}

export interface DashboardData {
    stats: {
        totalPacientes: number;
        turnosHoy: number;
        consultasMes: number;
        pendientes: number;
    };
    proximosTurnos: Array<{
        hora: string;
        paciente: string;
        motivo: string;
        estado: string;
    }>;
    pacientesRecientes: Array<{
        dni: string;
        nombre: string;
        apellido: string;
        telefono: string;
        email: string;
    }>;
}

export const api = {
    // Patients
    async getPatients(): Promise<Patient[]> {
        const res = await fetch(`${API_BASE_URL}/SvPaciente`);
        if (!res.ok) throw new Error('Error al obtener pacientes');
        return res.json();
    },

    async getPatient(dni: string): Promise<Patient> {
        const res = await fetch(`${API_BASE_URL}/SvPaciente?dni=${dni}`);
        if (!res.ok) throw new Error('Paciente no encontrado');
        return res.json();
    },

    async createPatient(patient: Patient): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/SvPaciente`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        const text = await res.text();
        if (!res.ok) {
            let msg = `Error HTTP ${res.status}`;
            try { msg = JSON.parse(text).error || msg; } catch { }
            throw new Error(msg);
        }
        return text ? JSON.parse(text) : {};
    },

    async updatePatient(patient: Patient): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/SvPaciente`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        const text = await res.text();
        if (!res.ok) {
            let msg = `Error HTTP ${res.status}`;
            try { msg = JSON.parse(text).error || msg; } catch { }
            throw new Error(msg);
        }
        return text ? JSON.parse(text) : {};
    },

    async deletePatient(dni: string): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/SvPaciente?dni=${dni}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error al eliminar paciente');
        return res.json();
    },

    // Appointments (Turnos)
    async getAppointments(): Promise<Appointment[]> {
        const res = await fetch(`${API_BASE_URL}/SvTurno`);
        if (!res.ok) throw new Error('Error al obtener turnos');
        return res.json();
    },

    async saveAppointment(appointment: Appointment): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/SvTurno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
        });
        if (!res.ok) throw new Error('Error al guardar turno');
        return res.json();
    },

    // Dashboard Stats
    async getStats(): Promise<DashboardData> {
        const res = await fetch(`${API_BASE_URL}/SvDashboard`);
        if (!res.ok) throw new Error('Error al obtener estadísticas');
        return res.json();
    },

    // Odontogram
    async getOdontogram(dni: string): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/SvOdontograma?dni=${dni}`);
        if (!res.ok) throw new Error('Error al obtener odontograma');
        return res.json();
    },

    async saveOdontogram(dni: string, estadoDientes: string, observaciones: string): Promise<any> {
        // SvOdontograma uses request.getParameter, so we use URLSearchParams
        const params = new URLSearchParams();
        params.append('dni', dni);
        params.append('estadoDientes', estadoDientes);
        params.append('observaciones', observaciones);

        const res = await fetch(`${API_BASE_URL}/SvOdontograma`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        });
        if (!res.ok) throw new Error('Error al guardar odontograma');
        return res.json();
    }
};
