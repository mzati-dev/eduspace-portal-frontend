// services/parentDataTransformer.ts

import {
    Child, ReportCard, Assessment, AttendanceRecord, Teacher,
    Notification, Announcement, FeeStatus, TimetableEntry
} from '@/types/parent';

export class ParentDataTransformer {

    /**
     * Transform raw child data from API to Child type
     */
    static transformChild(data: any): Child {
        return {
            id: data.id || '',
            name: data.name || '',
            exam_number: data.exam_number || data.examNumber || '',
            grade: data.grade || this.extractGradeFromClass(data.class),
            class: data.class_name || data.class?.name || data.class || '',
            classId: data.class_id || data.class?.id || '',
            admissionNo: data.admission_number || data.admissionNo || data.exam_number || '',
            photo_url: data.photo_url || data.photo || '',
            academic_year: data.academic_year || data.class?.academic_year || '',
            term: data.term || data.class?.term || ''
        };
    }

    /**
     * Extract grade from class name (e.g., "Grade 5A" -> "5")
     */
    private static extractGradeFromClass(classData: any): string {
        if (!classData) return '';
        const className = typeof classData === 'string' ? classData : classData.name || '';
        const match = className.match(/(\d+)/);
        return match ? match[1] : '';
    }

    /**
     * Transform raw report card data to ReportCard type
     */
    static transformReportCard(data: any): ReportCard {
        return {
            id: data.id || '',
            term: data.term || '',
            academicYear: data.academic_year || data.academicYear || '',
            publishedDate: data.published_date || data.publishedDate || data.created_at || '',
            rank: data.class_rank || data.rank || 0,
            totalStudents: data.total_students || data.totalStudents || 0,
            average: data.overall_average || data.average || 0,
            attendance: data.attendance_percentage || data.attendance || 0,
            subjects: Array.isArray(data.subjects) ? data.subjects.map((s: any) => ({
                subject_name: s.subject_name || s.name || '',
                qa1: s.qa1,
                qa1_absent: s.qa1_absent || false,
                qa1_grade: s.qa1_grade,
                qa2: s.qa2,
                qa2_absent: s.qa2_absent || false,
                qa2_grade: s.qa2_grade,
                end_of_term: s.end_of_term,
                end_of_term_absent: s.end_of_term_absent || false,
                end_of_term_grade: s.end_of_term_grade,
                final_score: s.final_score || s.finalScore || 0,
                final_grade: s.final_grade || s.grade || ''
            })) : [],
            teacherRemarks: data.teacher_remarks || data.teacherRemarks || '',
            principalRemarks: data.principal_remarks || data.principalRemarks,
            pdf_url: data.pdf_url || data.pdfUrl
        };
    }

    /**
     * Transform raw assessment data to Assessment type
     */
    static transformAssessment(data: any): Assessment {
        return {
            id: data.id,
            subject: data.subject_name || data.subject?.name || data.subject || '',
            subject_id: data.subject_id || data.subject?.id,
            type: data.assessment_type || data.type || 'end_of_term',
            score: data.is_absent ? undefined : (data.score || undefined),
            is_absent: data.is_absent || false,
            grade: data.grade,
            date: data.assessed_at || data.date || data.created_at || '',
            teacher: data.teacher_name || data.teacher?.name || data.teacher || '',
            teacher_name: data.teacher_name || data.teacher?.name
        };
    }

    /**
     * Transform raw attendance data to AttendanceRecord type
     */
    static transformAttendance(data: any): AttendanceRecord {
        return {
            id: data.id,
            date: data.date || '',
            status: data.status || 'absent',
            remarks: data.remarks,
            recorded_by: data.recorded_by || data.recordedBy
        };
    }

    /**
     * Transform raw teacher data to Teacher type
     */
    static transformTeacher(data: any): Teacher {
        return {
            id: data.id || '',
            name: data.name || '',
            email: data.email,
            phone: data.phone,
            subject: data.subject_name || data.subject?.name || data.subject,
            subject_name: data.subject_name || data.subject?.name,
            is_class_teacher: data.is_class_teacher || false,
            class_name: data.class_name
        };
    }

    /**
     * Transform raw notification data to Notification type
     */
    static transformNotification(data: any): Notification {
        return {
            id: data.id || '',
            title: data.title,
            content: data.content || data.message || '',
            type: data.type || 'announcement',
            read: data.read || false,
            created_at: data.created_at || '',
            data: data.data,
            sender: data.sender_name || data.sender,
            time: this.formatTimeAgo(data.created_at)
        };
    }

    /**
     * Transform raw announcement data to Announcement type
     */
    static transformAnnouncement(data: any): Announcement {
        return {
            id: data.id || '',
            title: data.title || '',
            content: data.content || '',
            date: data.created_at || data.date || '',
            priority: data.priority
        };
    }

    /**
     * Transform raw fee status data to FeeStatus type
     */
    static transformFeeStatus(data: any): FeeStatus {
        return {
            total_fees: data.total_fees || data.total || 0,
            paid_amount: data.paid_amount || data.paid || 0,
            balance: data.balance || 0,
            due_date: data.due_date || data.dueDate,
            term: data.term || '',
            academic_year: data.academic_year || data.academicYear || '',
            payments: Array.isArray(data.payments) ? data.payments.map((p: any) => ({
                id: p.id || '',
                amount: p.amount || 0,
                date: p.payment_date || p.date || '',
                description: p.description,
                payment_method: p.payment_method || p.paymentMethod,
                transaction_id: p.transaction_id,
                receipt_url: p.receipt_url,
                status: p.status || 'paid'
            })) : [],
            total: data.total_fees || data.total,
            paid: data.paid_amount || data.paid
        };
    }

    /**
     * Transform raw timetable data to TimetableEntry type
     */
    static transformTimetable(data: any): TimetableEntry {
        return {
            id: data.id,
            day: data.day_of_week || data.day || '',
            time: data.start_time ? `${data.start_time} - ${data.end_time}` : data.time || '',
            start_time: data.start_time,
            end_time: data.end_time,
            subject: data.subject_name || data.subject || '',
            subject_name: data.subject_name || data.subject,
            teacher: data.teacher_name || data.teacher || '',
            teacher_name: data.teacher_name || data.teacher,
            room: data.room,
            monday: data.monday,
            tuesday: data.tuesday,
            wednesday: data.wednesday,
            thursday: data.thursday,
            friday: data.friday
        };
    }

    /**
     * Format date to time ago string
     */
    private static formatTimeAgo(dateString: string): string {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }
}