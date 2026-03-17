//admin.ts
export interface Student {
    id: string;
    examNumber: string;
    name: string;
    class?: {
        id: string;
        name: string;
        term: string;
        academic_year: string;
        class_code: string;
    };
    term?: string;
    photo_url?: string;
    // ADD THESE 2 LINES:
    emis_code?: string;
    parent_id?: string;
    // ADD THIS:
    parent?: {
        name?: string;
        phone?: string;
        email?: string;
        national_id?: string;
        relationship?: string;
        alternate_phone?: string;
        address?: string;
        occupation?: string;
        preferred_contact?: string;
    };
    emergency_contact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
}

export interface Assessment {
    subject_id: string;
    subject_name: string;
    qa1: number | null;
    qa2: number | null;
    end_of_term: number | null;
    qa1_absent?: boolean;
    qa2_absent?: boolean;
    end_of_term_absent?: boolean;
}

export interface ClassResultStudent {
    id: string;
    name: string;
    examNumber: string;
    rank: number;
    totalScore: number;
    average: number;
    overallGrade: string;
    subjects: {
        name: string;
        qa1: number;
        qa2: number;
        endOfTerm: number;
        finalScore: number;
        grade: string;
        // 👇 ADD THESE THREE LINES
        qa1_absent?: boolean;
        qa2_absent?: boolean;
        endOfTerm_absent?: boolean;
    }[];
}

export interface ClassFormData {
    name: string;
    academic_year: string;
    term: string;
}

export interface StudentFormData {
    exam_number: string;
    name: string;
    class_id: string;
    photo_url: string;
    // ADD ALL THESE LINES:
    emis_code?: string;
    parent_name?: string;
    parent_phone?: string;
    parent_email?: string;
    parent_national_id?: string;
    parent_relationship?: string;
    parent_alternate_phone?: string;
    parent_address?: string;
    parent_occupation?: string;
    preferred_contact?: 'sms' | 'whatsapp' | 'email' | 'call';
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    parent_password?: string;
    send_credentials?: boolean;
}

export interface ConfigFormData {
    configuration_name: string;
    calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
    weight_qa1: number;
    weight_qa2: number;
    weight_end_of_term: number;
    pass_mark: number;
}

export interface ReportCardData {
    class_rank: number;
    qa1_rank: number;
    qa2_rank: number;
    total_students: number;
    days_present: number;
    days_absent: number;
    days_late: number;
    teacher_remarks: string;
}