// src/utils/helpers.ts
export const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 2; i++) {
        const year = currentYear + i;
        years.push(`${year}/${year + 1}`);
    }
    return years;
};

export const getGradeColor = (grade: string) => {
    if (grade === 'N/A') return 'text-slate-600 bg-slate-100';
    if (grade.includes('A')) return 'text-emerald-600 bg-emerald-50';
    if (grade === 'B') return 'text-blue-600 bg-blue-50';
    if (grade === 'C') return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
};

export const formatExamNumber = (
    selectedClass: { name: string },
    studentCount: number
): string => {
    const classNumberMatch = selectedClass.name.match(/\d+/);
    const classNumber = classNumberMatch ? classNumberMatch[0] : '0';
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const nextNumber = studentCount + 1;
    return `${currentYear}-${classNumber}${nextNumber.toString().padStart(3, '0')}`;
};