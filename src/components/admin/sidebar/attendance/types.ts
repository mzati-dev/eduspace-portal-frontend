// components/attendance/types.ts
export interface StudentAttendance {
    id: string;
    name: string;
    examNumber: string;
    class: string;
    classId: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'unmarked';
    checkInTime?: string;
    parentContact?: string;
    parentEmail?: string;
}

export interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: string;
}

export interface Props {
    classes: any[];
    students: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

export interface WeeklyStats {
    day: string;
    date: string;
    rate: number;
    present: number;
    total: number;
}

export interface MonthlyStats {
    weekName: string;
    rate: number;
    present: number;
    total: number;
    date: string;
}

export interface TermStats {
    averageRate: number;
    highestRate: number;
    lowestRate: number;
    totalDays: number;
    termName: string;
}

export interface ClassAttendanceSummary {
    classId: string;
    className: string;
    averageRate: number;
    totalStudents: number;
}