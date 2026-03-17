// types/parent.ts

export interface Child {
    id: string;
    name: string;
    exam_number: string;
    grade: string;
    class: string;
    classId: string;
    admissionNo: string;
    photo_url?: string;
    academic_year?: string;
    term?: string;
    // ADD THIS LINE:
    emis_code?: string;
    school?: string;         // Add this
    classRank?: number;      // Add this
    totalStudents?: number;  // Add this
}

export interface ReportCard {
    id: string;
    term: string;
    academicYear: string;
    publishedDate: string;
    rank: number;
    totalStudents: number;
    average: number;
    attendance: number;
    subjects: SubjectGrade[];
    teacherRemarks: string;
    principalRemarks?: string;
    pdf_url?: string;
}

export interface SubjectGrade {
    subject_name: string;
    qa1?: number;
    qa1_absent?: boolean;
    qa1_grade?: string;
    qa2?: number;
    qa2_absent?: boolean;
    qa2_grade?: string;
    end_of_term?: number;
    end_of_term_absent?: boolean;
    end_of_term_grade?: string;
    final_score: number;
    final_grade: string;
}

export interface Assessment {
    id?: string;
    subject: string;
    subject_id?: string;
    type: 'qa1' | 'qa2' | 'end_of_term';
    score?: number;
    is_absent: boolean;
    grade?: string;
    date: string;
    teacher?: string;
    teacher_name?: string;
}

export interface AttendanceRecord {
    id?: string;
    date: string;
    status: 'present' | 'absent' | 'excused' | 'late';
    remarks?: string;
    recorded_by?: string;
}

export interface Teacher {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    subject?: string;
    subject_name?: string;
    is_class_teacher: boolean;
    class_name?: string;
}

export interface Notification {
    id: string;
    title?: string;
    content: string;
    type: 'message' | 'grade' | 'attendance' | 'fee' | 'announcement' | 'event';
    read: boolean;
    created_at: string;
    data?: any;
    sender?: string;
    time?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface FeeStatus {
    total_fees: number;
    paid_amount: number;
    balance: number;
    due_date?: string;
    term: string;
    academic_year: string;
    payments: Payment[];
    total?: number; // Alias for total_fees
    paid?: number;  // Alias for paid_amount
}

export interface Payment {
    id: string;
    amount: number;
    date: string;
    description?: string;
    payment_method?: string;
    transaction_id?: string;
    receipt_url?: string;
    status: 'paid' | 'pending' | 'failed';
}

export interface TimetableEntry {
    id?: string;
    day: string;
    time: string;
    start_time?: string;
    end_time?: string;
    subject: string;
    subject_name?: string;
    teacher: string;
    teacher_name?: string;
    room?: string;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
}

export interface ParentProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    children: Child[];
    // ADD THESE LINES:
    national_id?: string;
    alternate_phone?: string;
    occupation?: string;
    preferred_contact?: 'sms' | 'whatsapp' | 'email' | 'call';
    created_at?: string;
    is_active?: boolean;
}