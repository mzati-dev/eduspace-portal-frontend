//index file

// Or keep your local type but make it match exactly:
export interface StudentData {
    name: string;
    examNumber: string;
    class: string;
    term: string;
    academicYear?: string; // <-- ADD THIS LINE
    photo: string;
    classRank: number;
    totalStudents: number;
    attendance: {
        present: number;
        absent: number;
        late: number;
    };
    teacherRemarks: string;
    subjects: Subject[];
    // ADD THESE TWO LINES HERE
    resultsLocked?: boolean;
    message?: string;

    assessmentStats?: {
        qa1: {
            classRank: number;
            termAverage: number;
            overallGrade: string;
        };
        qa2: {
            classRank: number;
            termAverage: number;
            overallGrade: string;
        };
        endOfTerm: {
            classRank: number;
            termAverage: number;
            overallGrade: string;
            attendance: {
                present: number;
                absent: number;
            };
        };
        overall?: {
            termAverage: number;
        };
    };
    gradeConfiguration?: GradeConfiguration; // This MUST match the GradeConfiguration from @/types
}

export interface Subject {
    name: string;
    qa1: number;
    qa2: number;
    endOfTerm: number;
    finalScore?: number;
    grade: string;
    // ADD THESE THREE LINES:
    qa1_absent?: boolean;
    qa2_absent?: boolean;
    endOfTerm_absent?: boolean;
}

export interface Class {
    id: string;
    name: string;
    year: number;
    teacher: string;
    studentCount: number;
}

export interface GradeConfiguration {
    id?: string; // Make optional if not always provided
    configuration_name: string;
    calculation_method: 'weighted_average' | 'end_of_term_only' | 'average_all';
    weight_qa1: number;
    weight_qa2: number;
    weight_end_of_term: number;
    pass_mark: number;
    grade_ranges?: any[]; // Make optional
    is_active?: boolean; // Make optional
    created_at?: string; // Make optional
}

// ====================== ADD AT THE BOTTOM ======================

export interface Parent {
    id: string;
    name: string;
    phone: string;
    email?: string;
    national_id?: string;
    alternate_phone?: string;
    address?: string;
    occupation?: string;
    preferred_contact?: 'sms' | 'whatsapp' | 'email' | 'call';
    created_at?: string;
    school_id?: string;
    is_active?: boolean;
}

export interface StudentParent {
    student_id: string;
    parent_id: string;
    relationship: 'father' | 'mother' | 'guardian' | 'grandparent' | 'aunt' | 'uncle' | 'other';
}