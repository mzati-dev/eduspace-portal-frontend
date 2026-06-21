import { fetchCurrentTerm } from "./attendanceService";

// const API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';


// ====================== NEW CODE: School ID Helpers ======================

// const getSchoolId = () => {
//   const userStr = localStorage.getItem('user');
//   if (userStr) {
//     try {
//       const user = JSON.parse(userStr);
//       console.log('USER OBJECT FROM LOCALSTORAGE:', user); // ADD THIS
//       return user.schoolId || null;
//     } catch (e) {
//       return null;
//     }
//   }
//   return null;
// };

const getSchoolId = () => {
  // First try from logged-in user
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.schoolId) return user.schoolId;
    } catch (e) { }
  }

  // Then try from currentSchoolId (set by useSchoolBranding for school subdomains)
  const schoolIdFromStorage = localStorage.getItem('currentSchoolId');
  if (schoolIdFromStorage) return schoolIdFromStorage;

  return null;
};

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});
// ====================== END NEW CODE ======================

// --- TYPES --- 
export interface Class {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  class_code: string;
  created_at: string;
  student_count?: number;
}

export interface Subject {
  name: string;
  qa1: number;
  qa2: number;
  endOfTerm: number;
  grade: string;
  finalScore?: number;
  // ADD THESE THREE LINES:
  qa1_absent?: boolean;
  qa2_absent?: boolean;
  endOfTerm_absent?: boolean;
}

export interface StudentData {
  id: string;
  name: string;
  examNumber: string;
  class: string;
  term: string;
  photo: string;
  subjects: Subject[];
  attendance: { present: number; absent: number; late: number };
  classRank: number;
  totalStudents: number;
  teacherRemarks: string;

  // ADD THIS:
  reportCards?: Array<{
    term: string;
    qa1_published: boolean;
    qa2_published: boolean;
    endOfTerm_published: boolean;
  }>;

  assessmentStats?: {
    qa1: {
      classRank: number;
      termAverage: number;
      overallGrade: string;
      attendance?: {
        present: number;
        absent: number;
        late: number;
      };
    };
    qa2: {
      classRank: number;
      termAverage: number;
      overallGrade: string;
      attendance?: {
        present: number;
        absent: number;
        late: number;
      };
    };
    endOfTerm: {
      classRank: number;
      termAverage: number;
      overallGrade: string;
      attendance: {
        present: number;
        absent: number;
        late: number;
      };
    };
    overall: {
      termAverage: number;
      calculationMethod: string;
    };
  };

  gradeConfiguration?: {
    configuration_name: string;
    calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
    weight_qa1: number;
    weight_qa2: number;
    weight_end_of_term: number;
    pass_mark: number;
  };
}

export interface SubjectRecord {
  id: string;
  name: string;
}

// ====================== PUBLIC FUNCTIONS (NO SCHOOL ID) ======================
// export async function fetchStudentByExamNumber(examNumber: string): Promise<StudentData | null> {
//     try {
//         // const response = await fetch(`${API_BASE_URL}/api/students/results/${examNumber.toUpperCase()}`);
//         const response = await fetch(`${API_BASE_URL}/api/students/results/${examNumber}`);
//         if (!response.ok) return null;
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Failed to fetch student data:', error);
//         return null;
//     }
// }

export async function fetchStudentByExamNumber(examNumber: string): Promise<StudentData | null> {
  try {
    // ADD THESE LINES: Get school ID from localStorage
    const schoolId = getSchoolId();

    // ADD THIS: Build URL with schoolId parameter
    const url = schoolId
      ? `${API_BASE_URL}/api/students/results/${examNumber}?schoolId=${schoolId}`
      : `${API_BASE_URL}/api/students/results/${examNumber}`;

    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch student data:', error);
    return null;
  }
}

// ====================== ADMIN FUNCTIONS (WITH SCHOOL ID) ======================
export const fetchAllStudents = async () => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/students?schoolId=${schoolId}` : `${API_BASE_URL}/api/students`;

  const res = await fetch(url, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
};

export const fetchAllSubjects = async () => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/subjects?schoolId=${schoolId}` : `${API_BASE_URL}/api/subjects`;

  const res = await fetch(url, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
};

// export const createStudent = async (data: {
//   name: string;
//   class_id: string;
//   photo_url?: string;
// }) => {
//   const schoolId = getSchoolId();
//   const requestData = schoolId ? { ...data, schoolId } : data;

//   const res = await fetch(`${API_BASE_URL}/api/students`, {
//     method: 'POST',
//     headers: authHeaders(),
//     body: JSON.stringify(requestData),
//   });
//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.message || 'Failed to create student');
//   }
//   return res.json();
// };

export const createStudent = async (data: {
  name: string;
  class_id: string;
  photo_url?: string;
}) => {
  const schoolId = getSchoolId();

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  const url = `${API_BASE_URL}/api/students?schoolId=${schoolId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...data, schoolId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create student');
  }
  return res.json();
};

export const updateStudent = async (id: string, data: {
  name?: string;
  class_id?: string;
  photo_url?: string;
}) => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/students/${id}?schoolId=${schoolId}` : `${API_BASE_URL}/api/students/${id}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update student');
  }
  return res.json();
};

export const deleteStudent = async (id: string) => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/students/${id}?schoolId=${schoolId}` : `${API_BASE_URL}/api/students/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete student');
  }
  return res.json();
};

export const upsertAssessment = async (data: any) => {
  const schoolId = getSchoolId();
  const requestData = schoolId ? { ...data, schoolId } : data;

  const res = await fetch(`${API_BASE_URL}/api/assessments/upsert`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(requestData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to save assessment');
  }
  return res.json();
};

export const upsertReportCard = async (data: any) => {
  const schoolId = getSchoolId();
  const requestData = schoolId ? { ...data, schoolId } : data;

  const res = await fetch(`${API_BASE_URL}/api/report-cards/upsert`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(requestData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to save report card');
  }
  return res.json();
};

export const fetchStudentAssessments = async (id: string) => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/students/${id}/assessments?schoolId=${schoolId}` : `${API_BASE_URL}/api/students/${id}/assessments`;

  const res = await fetch(url, {
    headers: authHeaders()
  });
  if (!res.ok) {
    console.error('Failed to fetch assessments');
    return [];
  }
  return res.json();
};

export const fetchStudentReportCard = async (id: string, term: string) => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/students/${id}/report-cards/${term}?schoolId=${schoolId}` : `${API_BASE_URL}/api/students/${id}/report-cards/${term}`;

  const res = await fetch(url, {
    headers: authHeaders()
  });
  if (!res.ok) {
    if (res.status === 404) {
      console.log('No report card found for this term');
      return null;
    }
    console.error('Failed to fetch report card');
    return null;
  }
  return res.json();
};
// 
// export const calculateGrade = (score: number, passMark: number = 50, isAbsent?: boolean) => {
export const calculateGrade = (score: number, passMark: number = 50, isAbsent?: boolean, className?: string) => {
  if (isAbsent) return 'AB';

  const isForm3Or4 = className && (
    className.includes('Form 3') ||
    className.includes('Form 4') ||
    className.includes('Form3') ||
    className.includes('Form4')
  );

  if (isForm3Or4) {
    if (score >= 80) return '1';
    if (score >= 75) return '2';
    if (score >= 70) return '3';
    if (score >= 65) return '4';
    if (score >= 60) return '5';
    if (score >= 55) return '6';
    if (score >= 51) return '7';
    if (score >= passMark) return '8';
    return '9';
  }

  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= passMark) return 'D';
  return 'F';
};

// export const createSubject = async (data: { name: string }) => {
//   const schoolId = getSchoolId();
//   const requestData = schoolId ? { ...data, schoolId } : data;

//   const res = await fetch(`${API_BASE_URL}/api/subjects`, {
//     method: 'POST',
//     headers: authHeaders(),
//     body: JSON.stringify(requestData),
//   });
//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.message || 'Failed to create subject');
//   }
//   return res.json();
// };

export const createSubject = async (data: { name: string }) => {
  const schoolId = getSchoolId();

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  const url = `${API_BASE_URL}/api/subjects?schoolId=${schoolId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create subject');
  }
  return res.json();
};

export const deleteSubject = async (id: string) => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/subjects/${id}?schoolId=${schoolId}` : `${API_BASE_URL}/api/subjects/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete subject');
  }
  return res.json();
};

export const fetchAllClasses = async (): Promise<Class[]> => {
  try {
    const schoolId = getSchoolId();
    const url = schoolId ? `${API_BASE_URL}/api/classes?schoolId=${schoolId}` : `${API_BASE_URL}/api/classes`;

    const res = await fetch(url, {
      headers: authHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

// export const createClass = async (data: {
//   name: string;
//   academic_year: string;
//   term: string;
// }): Promise<Class> => {
//   const schoolId = getSchoolId();
//   const requestData = schoolId ? { ...data, schoolId } : data;

//   const res = await fetch(`${API_BASE_URL}/api/classes`, {
//     method: 'POST',
//     headers: authHeaders(),
//     body: JSON.stringify(requestData),
//   });
//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.message || 'Failed to create class');
//   }
//   return res.json();
// };
export const createClass = async (data: {
  name: string;
  academic_year: string;
  term: string;
  start_date: string;
  end_date: string;
}): Promise<Class> => {
  const schoolId = getSchoolId();
  console.log('createClass - schoolId:', schoolId); // Should show the same ID

  const url = `${API_BASE_URL}/api/classes${schoolId ? `?schoolId=${schoolId}` : ''}`;
  console.log('createClass - URL:', url); // Should show schoolId in URL

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  console.log('createClass - Response status:', res.status);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create class');
  }
  return res.json();
};
export const deleteClass = async (id: string): Promise<void> => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/classes/${id}?schoolId=${schoolId}` : `${API_BASE_URL}/api/classes/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete class');
  }
};

export const addStudentsToClass = async (classId: string, studentIds: string[]) => {
  const schoolId = getSchoolId();

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  const url = `${API_BASE_URL}/api/classes/add-students?schoolId=${schoolId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ classId, studentIds }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to add students to class');
  }
  return res.json();
};

export const fetchStudentsByClass = async (classId: string): Promise<any[]> => {
  try {
    const schoolId = getSchoolId();
    const url = schoolId ? `${API_BASE_URL}/api/classes/${classId}/students?schoolId=${schoolId}` : `${API_BASE_URL}/api/classes/${classId}/students`;

    const res = await fetch(url, {
      headers: authHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching class students:', error);
    return [];
  }
};

// export const fetchClassResults = async (classId: string): Promise<any[]> => {
//   try {
//     const schoolId = getSchoolId();
//     const url = schoolId ? `${API_BASE_URL}/api/students/class/${classId}/results?schoolId=${schoolId}` : `${API_BASE_URL}/api/students/class/${classId}/results`;

//     const res = await fetch(url, {
//       headers: authHeaders()
//     });
//     if (!res.ok) {
//       if (res.status === 404) {
//         console.log('No results found for this class');
//         return [];
//       }
//       throw new Error('Failed to fetch class results');
//     }
//     return await res.json();
//   } catch (error) {
//     console.error('Error fetching class results:', error);
//     return [];
//   }
// };

export const fetchClassResults = async (classId: string): Promise<any[]> => {
  try {
    const schoolId = getSchoolId();
    const url = schoolId ? `${API_BASE_URL}/api/students/class/${classId}/results?schoolId=${schoolId}` : `${API_BASE_URL}/api/students/class/${classId}/results`;

    // Get teacher ID from localStorage
    const userStr = localStorage.getItem('user');
    let teacherId = '';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        teacherId = user.id || ''; // Use user.id as teacher ID
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    const headers: Record<string, string> = {
      ...authHeaders(),
    };

    // Add teacher ID header if available
    if (teacherId) {
      headers['x-teacher-id'] = teacherId;
    }

    const res = await fetch(url, {
      headers: headers
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.log('No results found for this class');
        return [];
      }
      throw new Error('Failed to fetch class results');
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching class results:', error);
    return [];
  }
};

export const fetchGradeConfigurations = async () => {
  try {
    const schoolId = getSchoolId();
    const url = schoolId ? `${API_BASE_URL}/api/grade-configs?schoolId=${schoolId}` : `${API_BASE_URL}/api/grade-configs`;

    const res = await fetch(url, {
      headers: authHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch grade configurations:', error);
    return [];
  }
};

export const calculateAndUpdateRanks = async (classId: string, term: string) => {
  const schoolId = getSchoolId();
  const requestData = schoolId ? { class_id: classId, term, schoolId } : { class_id: classId, term };

  const response = await fetch(`${API_BASE_URL}/api/students/calculate-ranks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(requestData),
  });
  if (!response.ok) throw new Error('Failed to calculate ranks');
  return response.json();
};

// ====================== ADDITIONAL GRADE CONFIG FUNCTIONS ======================
export const getActiveGradeConfig = async () => {
  try {
    const schoolId = getSchoolId();
    const url = schoolId ? `${API_BASE_URL}/api/grade-configs/active?schoolId=${schoolId}` : `${API_BASE_URL}/api/grade-configs/active`;

    const res = await fetch(url, {
      headers: authHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch active grade config:', error);
    return null;
  }
};

// export const createGradeConfig = async (data: any) => {
//   const schoolId = getSchoolId();
//   const requestData = schoolId ? { ...data, schoolId } : data;

//   const res = await fetch(`${API_BASE_URL}/api/grade-configs`, {
//     method: 'POST',
//     headers: authHeaders(),
//     body: JSON.stringify(requestData),
//   });
//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.message || 'Failed to create grade config');
//   }
//   return res.json();
// };

export const createGradeConfig = async (data: any) => {
  const schoolId = getSchoolId();

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  const url = `${API_BASE_URL}/api/grade-configs?schoolId=${schoolId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...data, schoolId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create grade config');
  }
  return res.json();
};

export const updateGradeConfig = async (id: string, data: any) => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/grade-configs/${id}?schoolId=${schoolId}` : `${API_BASE_URL}/api/grade-configs/${id}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update grade config');
  }
  return res.json();
};

export const setActiveConfig = async (id: string) => {
  const schoolId = getSchoolId();
  const url = schoolId ? `${API_BASE_URL}/api/grade-configs/${id}/activate?schoolId=${schoolId}` : `${API_BASE_URL}/api/grade-configs/${id}/activate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to activate config');
  }
  return res.json();
};

export const calculateFinalScore = async (subject: any, gradeConfig: any) => {
  const qa1 = subject.qa1 || 0;
  const qa2 = subject.qa2 || 0;
  const endOfTerm = subject.endOfTerm || 0;

  switch (gradeConfig.calculation_method) {
    case 'average_all':
      return (qa1 + qa2 + endOfTerm) / 3;
    case 'end_of_term_only':
      return endOfTerm;
    case 'weighted_average':
      return (qa1 * gradeConfig.weight_qa1 +
        qa2 * gradeConfig.weight_qa2 +
        endOfTerm * gradeConfig.weight_end_of_term) / 100;
    default:
      return (qa1 + qa2 + endOfTerm) / 3;
  }
};
// ====================== PUBLISH / ARCHIVE FUNCTIONS ======================
export const publishAssessment = async (classId: string, term: string, assessmentType: 'qa1' | 'qa2' | 'endOfTerm', publish: boolean) => {
  const schoolId = getSchoolId();
  // const url = `${API_BASE_URL}/api/students/publish-assessment`;
  const url = `${API_BASE_URL}/api/classes/publish-assessment`;  // ✅ FIXED

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ classId, term, assessmentType, publish, schoolId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update publish status');
  }
  return res.json();
};

export const archiveResults = async (classId: string, term: string, academicYear: string) => {
  const schoolId = getSchoolId();
  // const url = `${API_BASE_URL}/api/students/archive-results`;
  const url = `${API_BASE_URL}/api/classes/archive-results`;  // ✅ FIXED

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ classId, term, academicYear, schoolId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to archive results');
  }
  return res.json();
};

// export const fetchArchivedResults = async (classId: string, term: string, academicYear: string) => {
//   const schoolId = getSchoolId();
//   // const url = `${API_BASE_URL}/api/students/archived-results?classId=${classId}&term=${term}&academicYear=${academicYear}${schoolId ? `&schoolId=${schoolId}` : ''}`;
//   const url = `${API_BASE_URL}/api/classes/archived-results?classId=${classId}&term=${term}&academicYear=${academicYear}${schoolId ? `&schoolId=${schoolId}` : ''}`;  // ✅ FIXED
//   const res = await fetch(url, {
//     headers: authHeaders()
//   });

//   if (!res.ok) {
//     if (res.status === 404) return null;
//     throw new Error('Failed to fetch archived results');
//   }
//   return res.json();
// };

// export const fetchArchivedResults = async (classId: string, term: string, academicYear: string) => {
//   const schoolId = getSchoolId();
//   const url = `${API_BASE_URL}/api/classes/archived-results?classId=${classId}&term=${term}&academicYear=${academicYear}${schoolId ? `&schoolId=${schoolId}` : ''}`;

//   try {
//     const res = await fetch(url, {
//       headers: authHeaders()
//     });

//     if (!res.ok) {
//       if (res.status === 404) return [];
//       throw new Error('Failed to fetch archived results');
//     }

//     // Check if response has content
//     const text = await res.text();
//     if (!text) return [];

//     // Parse JSON
//     const data = JSON.parse(text);

//     // Always return an array
//     return Array.isArray(data) ? data : (data ? [data] : []);

//   } catch (error) {
//     console.error('Error fetching archived results:', error);
//     return []; // Return empty array on error
//   }
// };

export const fetchArchivedResults = async (classId?: string, term?: string, academicYear?: string) => {
  const schoolId = getSchoolId();

  let url = `${API_BASE_URL}/api/classes/archived-results?schoolId=${schoolId}`;

  // Only add filters if provided
  if (classId && classId !== '') {
    url += `&classId=${classId}&term=${term}&academicYear=${academicYear}`;
  }

  try {
    const res = await fetch(url, {
      headers: authHeaders()
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error('Failed to fetch archived results');
    }

    const text = await res.text();
    if (!text) return [];

    const data = JSON.parse(text);
    return Array.isArray(data) ? data : (data ? [data] : []);

  } catch (error) {
    console.error('Error fetching archived results:', error);
    return [];
  }
};

// ====================== LOCK FUNCTIONS ======================
// export const lockResults = async (classId: string, term: string, lock: boolean) => {
//   const schoolId = getSchoolId();
//   // const url = `${API_BASE_URL}/api/students/lock-results`;
//   const url = `${API_BASE_URL}/api/classes/lock-results`;  // ✅ FIXED

//   const res = await fetch(url, {
//     method: 'POST',
//     headers: authHeaders(),
//     body: JSON.stringify({ classId, term, lock, schoolId }),
//   });

//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.message || 'Failed to lock/unlock results');
//   }
//   return res.json();
// };

// ====================== LOCK FUNCTIONS ======================
// export const lockResults = async (
//   classId: string,
//   term: string,
//   assessmentType: 'qa1' | 'qa2' | 'endOfTerm',
//   lock: boolean,
//   studentIds?: string[] // Add this parameter
// ) => {
//   const schoolId = getSchoolId();
//   const url = `${API_BASE_URL}/api/classes/lock-results`;  // ✅ FIXED

//   const requestBody: any = {
//     classId,
//     term,
//     assessmentType, // Add this
//     lock,
//     schoolId
//   };

//   // Only add studentIds if provided and not empty
//   if (studentIds && studentIds.length > 0) {
//     requestBody.studentIds = studentIds;
//   }

//   const res = await fetch(url, {
//     method: 'POST',
//     headers: authHeaders(),
//     body: JSON.stringify(requestBody),
//   });

//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.message || 'Failed to lock/unlock results');
//   }
//   return res.json();
// };

export const lockResults = async (
  classId: string,
  term: string,
  assessmentType: 'qa1' | 'qa2' | 'endOfTerm',
  lock: boolean,
  lockReason: 'fee' | 'teacher',  // ADD THIS PARAMETER
  studentIds?: string[]
) => {
  const schoolId = getSchoolId();
  const url = `${API_BASE_URL}/api/classes/lock-results`;

  const requestBody: any = {
    classId,
    term,
    assessmentType,
    lock,
    lockReason,  // ADD THIS
    schoolId
  };

  if (studentIds && studentIds.length > 0) {
    requestBody.studentIds = studentIds;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to lock/unlock results');
  }
  return res.json();
};

// ====================== LOCKED ASSESSMENTS FUNCTIONS ======================
export const fetchLockedAssessments = async (classId: string, term: string) => {
  const schoolId = getSchoolId();
  // const url = `${API_BASE_URL}/api/students/locked-assessments?classId=${classId}&term=${term}${schoolId ? `&schoolId=${schoolId}` : ''}`;
  const url = `${API_BASE_URL}/api/classes/locked-assessments?classId=${classId}&term=${term}${schoolId ? `&schoolId=${schoolId}` : ''}`;  // ✅ FIXED

  const res = await fetch(url, {
    headers: authHeaders()
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error('Failed to fetch locked assessments');
  }
  return res.json();
};

// ====================== STUDENT REPORT ARCHIVE FUNCTIONS ======================
export const archiveStudentReports = async (classId: string, term: string, assessmentType: 'qa1' | 'qa2' | 'endOfTerm') => {
  const schoolId = getSchoolId();
  const url = `${API_BASE_URL}/api/classes/archive-student-reports`;  // ✅ FIXED

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ classId, term, assessmentType, schoolId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to archive student reports');
  }
  return res.json();
};

export const sendReportEmail = async (archiveId: string) => {
  const schoolId = getSchoolId();
  const url = `${API_BASE_URL}/api/classes/send-report/${archiveId}/email?schoolId=${schoolId}`;  // ✅ FIXED

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send email');
  }
  return res.json();
};

export const sendReportWhatsApp = async (archiveId: string) => {
  const schoolId = getSchoolId();
  const url = `${API_BASE_URL}/api/classes/send-report/${archiveId}/whatsapp?schoolId=${schoolId}`;  // ✅ FIXED

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send WhatsApp');
  }
  return res.json();
};

// export const fetchStudentReportArchives = async (classId?: string, term?: string) => {
//   const schoolId = getSchoolId();
//   let url = `${API_BASE_URL}/api/classes/student-report-archives?schoolId=${schoolId}`;  // ✅ FIXED
//   if (classId) url += `&classId=${classId}`;
//   if (term) url += `&term=${term}`;

//   const res = await fetch(url, {
//     headers: authHeaders()
//   });

//   if (!res.ok) {
//     if (res.status === 404) return [];
//     throw new Error('Failed to fetch student report archives');
//   }
//   return res.json();
// };
export const fetchStudentReportArchives = async (classId?: string, term?: string, academicYear?: string) => {
  const schoolId = getSchoolId();
  let url = `${API_BASE_URL}/api/classes/student-report-archives?schoolId=${schoolId}`;
  if (classId && classId !== '') url += `&classId=${classId}`;
  if (term && term !== '') url += `&term=${term}`;
  if (academicYear && academicYear !== '') url += `&academicYear=${academicYear}`;

  const res = await fetch(url, {
    headers: authHeaders()
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error('Failed to fetch student report archives');
  }
  return res.json();
};
// ====================== REPORT CARD GENERATION FUNCTIONS ======================
export const generateReportCards = async (classId: string, term: string, assessmentType: 'qa1' | 'qa2' | 'endOfTerm') => {
  const schoolId = getSchoolId();
  const url = `${API_BASE_URL}/api/classes/generate-report-cards?schoolId=${schoolId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ classId, term, assessmentType, schoolId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to generate report cards');
  }
  return res.json();
};

export const previewReportCards = async (classId: string, term: string, assessmentType: 'qa1' | 'qa2' | 'endOfTerm') => {
  const schoolId = getSchoolId();
  const url = `${API_BASE_URL}/api/classes/preview-report-cards/${classId}?term=${term}&assessmentType=${assessmentType}&schoolId=${schoolId}`;

  const res = await fetch(url, {
    headers: authHeaders()
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to preview report cards');
  }
  return res.json();
};
// ====================== IMPORT STUDENTS FROM FILE FUNCTIONS ======================

/**
 * Upload and preview file before import
 * Shows parsed data with auto-generated exam numbers
 */
export const previewImportFile = async (file: File, classId: string) => {
  const schoolId = getSchoolId();

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('classId', classId);
  formData.append('schoolId', schoolId);

  const url = `${API_BASE_URL}/api/classes/import/preview`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to preview file');
  }
  return res.json();
};

/**
 * Import selected students from preview data
 */
export const importSelectedStudents = async (classId: string, selectedStudents: any[]) => {
  const schoolId = getSchoolId();

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  const url = `${API_BASE_URL}/api/classes/import/batch?schoolId=${schoolId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      classId,
      students: selectedStudents,
      schoolId
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to import students');
  }
  return res.json();
};
// Add this function to your studentService.ts
// Add this function to your studentService.ts - REPLACE the existing fetchCurrentTermPassRates
export const fetchCurrentTermPassRates = async () => {
  try {
    const schoolId = getSchoolId();
    const term = await fetchCurrentTerm();

    // Fetch all classes
    const classesRes = await fetch(`${API_BASE_URL}/api/classes?schoolId=${schoolId}`, {
      headers: authHeaders()
    });
    const classes = await classesRes.json();

    // Get active grade configuration for pass mark
    const activeConfig = await getActiveGradeConfig();
    const passMark = activeConfig?.pass_mark || 50;

    const passRatesData = [];

    for (const cls of classes) {
      // Fetch results for each class
      const resultsRes = await fetch(`${API_BASE_URL}/api/students/class/${cls.id}/results?schoolId=${schoolId}&term=${term?.name}`, {
        headers: authHeaders()
      });

      let qa1PassCount = 0;
      let qa2PassCount = 0;
      let endOfTermPassCount = 0;
      let qa1StudentsWithScores = 0;
      let qa2StudentsWithScores = 0;
      let endOfTermStudentsWithScores = 0;

      if (resultsRes.ok) {
        const classResults = await resultsRes.json();

        // Calculate each student's performance per assessment type
        classResults.forEach((student: any) => {
          // For QA1 - calculate student's average for QA1 across all subjects
          let qa1Total = 0;
          let qa1SubjectCount = 0;
          let hasQa1Scores = false;

          // For QA2 - calculate student's average for QA2 across all subjects
          let qa2Total = 0;
          let qa2SubjectCount = 0;
          let hasQa2Scores = false;

          // For End of Term - calculate student's average for End of Term across all subjects
          let endOfTermTotal = 0;
          let endOfTermSubjectCount = 0;
          let hasEndOfTermScores = false;

          student.subjects?.forEach((subject: any) => {
            // QA1
            if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
              qa1Total += subject.qa1;
              qa1SubjectCount++;
              hasQa1Scores = true;
            } else if (subject.qa1_absent) {
              // Absent counts as 0 for average calculation
              qa1Total += 0;
              qa1SubjectCount++;
              hasQa1Scores = true;
            }

            // QA2
            if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
              qa2Total += subject.qa2;
              qa2SubjectCount++;
              hasQa2Scores = true;
            } else if (subject.qa2_absent) {
              qa2Total += 0;
              qa2SubjectCount++;
              hasQa2Scores = true;
            }

            // End of Term
            if (!subject.endOfTerm_absent && subject.endOfTerm !== null && subject.endOfTerm >= 0) {
              endOfTermTotal += subject.endOfTerm;
              endOfTermSubjectCount++;
              hasEndOfTermScores = true;
            } else if (subject.endOfTerm_absent) {
              endOfTermTotal += 0;
              endOfTermSubjectCount++;
              hasEndOfTermScores = true;
            }
          });

          // Calculate student's average for each assessment type
          const qa1Average = qa1SubjectCount > 0 ? qa1Total / qa1SubjectCount : 0;
          const qa2Average = qa2SubjectCount > 0 ? qa2Total / qa2SubjectCount : 0;
          const endOfTermAverage = endOfTermSubjectCount > 0 ? endOfTermTotal / endOfTermSubjectCount : 0;

          // Determine pass/fail for QA1 (only count students who have scores)
          if (hasQa1Scores) {
            qa1StudentsWithScores++;
            const qa1Grade = calculateGrade(qa1Average, passMark, false, cls.name);
            if (qa1Grade !== 'F' && qa1Grade !== '9') {
              qa1PassCount++;
            }
          }

          // Determine pass/fail for QA2
          if (hasQa2Scores) {
            qa2StudentsWithScores++;
            const qa2Grade = calculateGrade(qa2Average, passMark, false, cls.name);
            if (qa2Grade !== 'F' && qa2Grade !== '9') {
              qa2PassCount++;
            }
          }

          // Determine pass/fail for End of Term
          if (hasEndOfTermScores) {
            endOfTermStudentsWithScores++;
            const endOfTermGrade = calculateGrade(endOfTermAverage, passMark, false, cls.name);
            if (endOfTermGrade !== 'F' && endOfTermGrade !== '9') {
              endOfTermPassCount++;
            }
          }
        });
      }

      passRatesData.push({
        className: cls.name,
        qa1PassRate: qa1StudentsWithScores > 0 ? Math.round((qa1PassCount / qa1StudentsWithScores) * 100) : 0,
        qa2PassRate: qa2StudentsWithScores > 0 ? Math.round((qa2PassCount / qa2StudentsWithScores) * 100) : 0,
        endOfTermPassRate: endOfTermStudentsWithScores > 0 ? Math.round((endOfTermPassCount / endOfTermStudentsWithScores) * 100) : 0,
      });
    }

    return passRatesData;
  } catch (error) {
    console.error('Error fetching pass rates:', error);
    return [];
  }
};
// export const fetchCurrentTermPassRates = async () => {
//   try {
//     const schoolId = getSchoolId();
//     const term = await fetchCurrentTerm();

//     // Fetch all classes
//     const classesRes = await fetch(`${API_BASE_URL}/api/classes?schoolId=${schoolId}`, {
//       headers: authHeaders()
//     });
//     const classes = await classesRes.json();

//     const passRatesData = [];

//     for (const cls of classes) {
//       // Fetch results for each class
//       const resultsRes = await fetch(`${API_BASE_URL}/api/students/class/${cls.id}/results?schoolId=${schoolId}&term=${term?.name}`, {
//         headers: authHeaders()
//       });

//       let qa1PassCount = 0;
//       let qa2PassCount = 0;
//       let endOfTermPassCount = 0;
//       let totalSubjectEntries = 0;

//       if (resultsRes.ok) {
//         const classResults = await resultsRes.json();

//         classResults.forEach((student: any) => {
//           student.subjects?.forEach((subject: any) => {
//             totalSubjectEntries++;

//             // QA1
//             if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
//               const grade = calculateGrade(subject.qa1, 50, false, cls.name);
//               if (grade !== 'F' && grade !== '9') qa1PassCount++;
//             }
//             // QA2
//             if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
//               const grade = calculateGrade(subject.qa2, 50, false, cls.name);
//               if (grade !== 'F' && grade !== '9') qa2PassCount++;
//             }
//             // End of Term
//             if (!subject.endOfTerm_absent && subject.endOfTerm !== null && subject.endOfTerm >= 0) {
//               const grade = calculateGrade(subject.endOfTerm, 50, false, cls.name);
//               if (grade !== 'F' && grade !== '9') endOfTermPassCount++;
//             }
//           });
//         });
//       }

//       passRatesData.push({
//         className: cls.name,
//         qa1PassRate: totalSubjectEntries > 0 ? Math.round((qa1PassCount / totalSubjectEntries) * 100) : 0,
//         qa2PassRate: totalSubjectEntries > 0 ? Math.round((qa2PassCount / totalSubjectEntries) * 100) : 0,
//         endOfTermPassRate: totalSubjectEntries > 0 ? Math.round((endOfTermPassCount / totalSubjectEntries) * 100) : 0,
//       });
//     }

//     return passRatesData;
//   } catch (error) {
//     console.error('Error fetching pass rates:', error);
//     return [];
//   }
// };

// Add this function to your studentService.ts (after fetchCurrentTermPassRates or anywhere)

export const fetchSubjectPerformance = async () => {
  try {
    const schoolId = getSchoolId();
    const url = schoolId
      ? `${API_BASE_URL}/api/subjects/performance?schoolId=${schoolId}`
      : `${API_BASE_URL}/api/subjects/performance`;

    const res = await fetch(url, {
      headers: authHeaders()
    });

    if (!res.ok) {
      if (res.status === 404) return { qa1: [], qa2: [], endOfTerm: [] };
      throw new Error('Failed to fetch subject performance');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching subject performance:', error);
    return { qa1: [], qa2: [], endOfTerm: [] };
  }
};
/**
 * Fetch archived results for a specific student
 * Gets all archived report cards for a student across all terms
 */
export const fetchStudentArchivedResults = async (studentId: string) => {
  const schoolId = getSchoolId();

  try {
    const url = `${API_BASE_URL}/api/classes/student-report-archives?schoolId=${schoolId}`;

    const res = await fetch(url, {
      headers: authHeaders()
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error('Failed to fetch student archived results');
    }

    const data = await res.json();

    // Filter archives by studentId
    return data.filter((archive: any) => archive.studentId === studentId);
  } catch (error) {
    console.error('Error fetching student archived results:', error);
    return [];
  }
};