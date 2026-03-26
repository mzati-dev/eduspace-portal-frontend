import React, { useState, useEffect } from 'react';
import { FileText, Book, PenSquare, FilePlus2, Download, UploadCloud, GraduationCap, School, Filter, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';

// --- TYPE DEFINITIONS ---
const EducationLevel = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary'
};

const ResourceType = {
    TEXTBOOKS: 'textbooks',
    PAMPHLETS: 'pamphlets',
    SCHEMES: 'schemes',
    SYLLABUS: 'syllabus',
    PAST_PAPERS: 'pastPapers'
};

const PaperType = {
    PSLCE: 'pslce',
    JCE: 'jce',
    MSCE: 'msce',
    MOCK: 'mock',
    GENERAL: 'general'
};

// --- AVAILABLE YEARS ---
const availableYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

// --- SUBJECTS BY LEVEL AND GRADE ---
const primarySubjects = ['Mathematics', 'English', 'Chichewa', 'Science', 'Social Studies'];
const form2Subjects = ['Mathematics', 'English', 'Biology', 'Physical Science', 'History', 'Geography'];
const form4Subjects = ['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography'];

// --- MOCK DATA STRUCTURED BY LEVEL, GRADE, AND TYPE ---
const mockData = [
    // PRIMARY SCHOOL - Standard 1-7 (No past papers)
    ...(['standard1', 'standard2', 'standard3', 'standard4', 'standard5', 'standard6', 'standard7']).flatMap(grade => [
        // Textbooks
        ...primarySubjects.map((subject, index) => ({
            id: `p_${grade}_textbook_${index + 1}`,
            title: `${subject} Textbook ${grade.toUpperCase()}`,
            author: 'Malawi Institute of Education',
            subject,
            type: ResourceType.TEXTBOOKS,
            level: EducationLevel.PRIMARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Pamphlets
        ...primarySubjects.map((subject, index) => ({
            id: `p_${grade}_pamphlet_${index + 1}`,
            title: `${subject} Revision Pamphlet ${grade.toUpperCase()}`,
            author: 'Popular Publications',
            subject,
            type: ResourceType.PAMPHLETS,
            level: EducationLevel.PRIMARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Schemes of Work (with terms)
        ...primarySubjects.flatMap((subject, index) => [
            {
                id: `p_${grade}_scheme_${index + 1}_t1`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 1`,
                author: 'DEMB',
                subject,
                term: 1,
                type: ResourceType.SCHEMES,
                level: EducationLevel.PRIMARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `p_${grade}_scheme_${index + 1}_t2`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 2`,
                author: 'DEMB',
                subject,
                term: 2,
                type: ResourceType.SCHEMES,
                level: EducationLevel.PRIMARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `p_${grade}_scheme_${index + 1}_t3`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 3`,
                author: 'DEMB',
                subject,
                term: 3,
                type: ResourceType.SCHEMES,
                level: EducationLevel.PRIMARY,
                grade,
                year: undefined,
                paperType: undefined
            }
        ]).flat(),

        // Syllabus (no subject filter needed)
        {
            id: `p_${grade}_syllabus_1`,
            title: `Primary School Syllabus ${grade.toUpperCase()}`,
            author: 'Malawi Institute of Education',
            subject: 'All Subjects',
            type: ResourceType.SYLLABUS,
            level: EducationLevel.PRIMARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        }
    ]),

    // PRIMARY SCHOOL - Standard 8 (With PSLCE, Mock, and General papers)
    ...(['standard8']).flatMap(grade => [
        // Textbooks
        ...primarySubjects.map((subject, index) => ({
            id: `p_${grade}_textbook_${index + 1}`,
            title: `${subject} Textbook ${grade.toUpperCase()}`,
            author: 'Malawi Institute of Education',
            subject,
            type: ResourceType.TEXTBOOKS,
            level: EducationLevel.PRIMARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Pamphlets
        ...primarySubjects.map((subject, index) => ({
            id: `p_${grade}_pamphlet_${index + 1}`,
            title: `${subject} Revision Pamphlet ${grade.toUpperCase()}`,
            author: 'Popular Publications',
            subject,
            type: ResourceType.PAMPHLETS,
            level: EducationLevel.PRIMARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Schemes of Work (with terms)
        ...primarySubjects.flatMap((subject, index) => [
            {
                id: `p_${grade}_scheme_${index + 1}_t1`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 1`,
                author: 'DEMB',
                subject,
                term: 1,
                type: ResourceType.SCHEMES,
                level: EducationLevel.PRIMARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `p_${grade}_scheme_${index + 1}_t2`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 2`,
                author: 'DEMB',
                subject,
                term: 2,
                type: ResourceType.SCHEMES,
                level: EducationLevel.PRIMARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `p_${grade}_scheme_${index + 1}_t3`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 3`,
                author: 'DEMB',
                subject,
                term: 3,
                type: ResourceType.SCHEMES,
                level: EducationLevel.PRIMARY,
                grade,
                year: undefined,
                paperType: undefined
            }
        ]).flat(),

        // Syllabus (no subject filter needed)
        {
            id: `p_${grade}_syllabus_1`,
            title: `Primary School Syllabus ${grade.toUpperCase()}`,
            author: 'Malawi Institute of Education',
            subject: 'All Subjects',
            type: ResourceType.SYLLABUS,
            level: EducationLevel.PRIMARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        },

        // PSLCE Past Papers (MANEB - Standard 8 only)
        ...availableYears.flatMap(year =>
            primarySubjects.map((subject, index) => ({
                id: `p_${grade}_pslce_${year}_${index + 1}`,
                title: `PSLCE ${subject} Paper ${year}`,
                author: 'MANEB',
                subject,
                year,
                paperType: PaperType.PSLCE,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.PRIMARY,
                grade,
                term: undefined
            }))
        ),

        // Mock Examinations (Standard 8)
        ...availableYears.flatMap(year =>
            primarySubjects.map((subject, index) => ({
                id: `p_${grade}_mock_${year}_${index + 1}`,
                title: `Mock ${subject} Paper ${year}`,
                author: 'District Education Office',
                subject,
                year,
                paperType: PaperType.MOCK,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.PRIMARY,
                grade,
                term: undefined
            }))
        ),

        // General Papers (Standard 8)
        ...availableYears.flatMap(year =>
            primarySubjects.map((subject, index) => ({
                id: `p_${grade}_general_${year}_${index + 1}`,
                title: `General ${subject} Paper ${year}`,
                author: 'Various Schools',
                subject,
                year,
                paperType: PaperType.GENERAL,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.PRIMARY,
                grade,
                term: undefined
            }))
        )
    ]),

    // SECONDARY SCHOOL - Form 1 & 3 (No past papers)
    ...(['form1', 'form3']).flatMap(grade => [
        // Textbooks
        ...(grade === 'form1' ?
            ['Mathematics', 'English', 'Biology', 'Physical Science', 'History', 'Geography'] :
            ['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography']
        ).map((subject, index) => ({
            id: `s_${grade}_textbook_${index + 1}`,
            title: `${subject} Textbook ${grade.toUpperCase()}`,
            author: grade === 'form1' ? 'Longman Malawi' : 'Oxford University Press',
            subject,
            type: ResourceType.TEXTBOOKS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Pamphlets
        ...(grade === 'form1' ?
            ['Mathematics', 'English', 'Biology', 'Physical Science', 'History', 'Geography'] :
            ['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography']
        ).map((subject, index) => ({
            id: `s_${grade}_pamphlet_${index + 1}`,
            title: `${subject} Revision Pamphlet ${grade.toUpperCase()}`,
            author: 'MK Publications',
            subject,
            type: ResourceType.PAMPHLETS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Schemes of Work (with terms)
        ...(grade === 'form1' ?
            ['Mathematics', 'English', 'Biology', 'Physical Science', 'History', 'Geography'] :
            ['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography']
        ).flatMap((subject, index) => [
            {
                id: `s_${grade}_scheme_${index + 1}_t1`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 1`,
                author: 'MoEST',
                subject,
                term: 1,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `s_${grade}_scheme_${index + 1}_t2`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 2`,
                author: 'MoEST',
                subject,
                term: 2,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `s_${grade}_scheme_${index + 1}_t3`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 3`,
                author: 'MoEST',
                subject,
                term: 3,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            }
        ]).flat(),

        // Syllabus (no subject filter needed)
        {
            id: `s_${grade}_syllabus_1`,
            title: `Secondary School Syllabus ${grade.toUpperCase()}`,
            author: 'Malawi Institute of Education',
            subject: 'All Subjects',
            type: ResourceType.SYLLABUS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        }
    ]),

    // SECONDARY SCHOOL - Form 2 (With JCE, Mock, and General papers)
    ...(['form2']).flatMap(grade => [
        // Textbooks
        ...form2Subjects.map((subject, index) => ({
            id: `s_${grade}_textbook_${index + 1}`,
            title: `${subject} Textbook ${grade.toUpperCase()}`,
            author: 'Longman Malawi',
            subject,
            type: ResourceType.TEXTBOOKS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Pamphlets
        ...form2Subjects.map((subject, index) => ({
            id: `s_${grade}_pamphlet_${index + 1}`,
            title: `${subject} Revision Pamphlet ${grade.toUpperCase()}`,
            author: 'MK Publications',
            subject,
            type: ResourceType.PAMPHLETS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Schemes of Work (with terms)
        ...form2Subjects.flatMap((subject, index) => [
            {
                id: `s_${grade}_scheme_${index + 1}_t1`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 1`,
                author: 'MoEST',
                subject,
                term: 1,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `s_${grade}_scheme_${index + 1}_t2`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 2`,
                author: 'MoEST',
                subject,
                term: 2,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `s_${grade}_scheme_${index + 1}_t3`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 3`,
                author: 'MoEST',
                subject,
                term: 3,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            }
        ]).flat(),

        // Syllabus (no subject filter needed)
        {
            id: `s_${grade}_syllabus_1`,
            title: `Secondary School Syllabus ${grade.toUpperCase()}`,
            author: 'Malawi Institute of Education',
            subject: 'All Subjects',
            type: ResourceType.SYLLABUS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        },

        // JCE Past Papers (MANEB - Form 2 only)
        ...availableYears.flatMap(year =>
            form2Subjects.map((subject, index) => ({
                id: `s_${grade}_jce_${year}_${index + 1}`,
                title: `JCE ${subject} Paper ${year}`,
                author: 'MANEB',
                subject,
                year,
                paperType: PaperType.JCE,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.SECONDARY,
                grade,
                term: undefined
            }))
        ),

        // Mock Examinations (Form 2)
        ...availableYears.flatMap(year =>
            form2Subjects.map((subject, index) => ({
                id: `s_${grade}_mock_${year}_${index + 1}`,
                title: `Mock ${subject} Paper ${year}`,
                author: 'District Education Office',
                subject,
                year,
                paperType: PaperType.MOCK,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.SECONDARY,
                grade,
                term: undefined
            }))
        ),

        // General Papers (Form 2)
        ...availableYears.flatMap(year =>
            form2Subjects.map((subject, index) => ({
                id: `s_${grade}_general_${year}_${index + 1}`,
                title: `General ${subject} Paper ${year}`,
                author: 'Various Schools',
                subject,
                year,
                paperType: PaperType.GENERAL,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.SECONDARY,
                grade,
                term: undefined
            }))
        )
    ]),

    // SECONDARY SCHOOL - Form 4 (With MSCE, Mock, and General papers)
    ...(['form4']).flatMap(grade => [
        // Textbooks
        ...form4Subjects.map((subject, index) => ({
            id: `s_${grade}_textbook_${index + 1}`,
            title: `${subject} Textbook ${grade.toUpperCase()}`,
            author: 'Oxford University Press',
            subject,
            type: ResourceType.TEXTBOOKS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Pamphlets
        ...form4Subjects.map((subject, index) => ({
            id: `s_${grade}_pamphlet_${index + 1}`,
            title: `${subject} Revision Pamphlet ${grade.toUpperCase()}`,
            author: 'MK Publications',
            subject,
            type: ResourceType.PAMPHLETS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        })),

        // Schemes of Work (with terms)
        ...form4Subjects.flatMap((subject, index) => [
            {
                id: `s_${grade}_scheme_${index + 1}_t1`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 1`,
                author: 'MoEST',
                subject,
                term: 1,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `s_${grade}_scheme_${index + 1}_t2`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 2`,
                author: 'MoEST',
                subject,
                term: 2,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            },
            {
                id: `s_${grade}_scheme_${index + 1}_t3`,
                title: `${subject} Scheme of Work ${grade.toUpperCase()} - Term 3`,
                author: 'MoEST',
                subject,
                term: 3,
                type: ResourceType.SCHEMES,
                level: EducationLevel.SECONDARY,
                grade,
                year: undefined,
                paperType: undefined
            }
        ]).flat(),

        // Syllabus (no subject filter needed)
        {
            id: `s_${grade}_syllabus_1`,
            title: `Secondary School Syllabus ${grade.toUpperCase()}`,
            author: 'Malawi Institute of Education',
            subject: 'All Subjects',
            type: ResourceType.SYLLABUS,
            level: EducationLevel.SECONDARY,
            grade,
            year: undefined,
            paperType: undefined,
            term: undefined
        },

        // MSCE Past Papers (MANEB - Form 4 only)
        ...availableYears.flatMap(year =>
            form4Subjects.map((subject, index) => ({
                id: `s_${grade}_msce_${year}_${index + 1}`,
                title: `MSCE ${subject} Paper ${year}`,
                author: 'MANEB',
                subject,
                year,
                paperType: PaperType.MSCE,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.SECONDARY,
                grade,
                term: undefined
            }))
        ),

        // Mock Examinations (Form 4)
        ...availableYears.flatMap(year =>
            form4Subjects.map((subject, index) => ({
                id: `s_${grade}_mock_${year}_${index + 1}`,
                title: `Mock ${subject} Paper ${year}`,
                author: 'District Education Office',
                subject,
                year,
                paperType: PaperType.MOCK,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.SECONDARY,
                grade,
                term: undefined
            }))
        ),

        // General Papers (Form 4)
        ...availableYears.flatMap(year =>
            form4Subjects.map((subject, index) => ({
                id: `s_${grade}_general_${year}_${index + 1}`,
                title: `General ${subject} Paper ${year}`,
                author: 'Various Schools',
                subject,
                year,
                paperType: PaperType.GENERAL,
                type: ResourceType.PAST_PAPERS,
                level: EducationLevel.SECONDARY,
                grade,
                term: undefined
            }))
        )
    ])
].flat();

// --- ICON MAPPING FOR RESOURCE TYPES ---
const resourceIcons = {
    textbooks: Book,
    pamphlets: FileText,
    schemes: FilePlus2,
    syllabus: GraduationCap,
    pastPapers: FileText
};

const resourceLabels = {
    textbooks: 'Textbooks',
    pamphlets: 'Pamphlets',
    schemes: 'Schemes of Work',
    syllabus: 'Syllabus',
    pastPapers: 'Past Papers'
};

const paperTypeLabels = {
    pslce: 'PSLCE (MANEB)',
    jce: 'JCE (MANEB)',
    msce: 'MSCE (MANEB)',
    mock: 'Mock Examinations',
    general: 'General Papers'
};

// --- REUSABLE COMPONENTS ---
const ResourceCard = ({ icon: Icon, title, subtitle, year, paperType, term }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center gap-4 transform hover:-translate-y-1 transition-transform duration-300">
        <Icon className="h-8 w-8 text-blue-400 flex-shrink-0" />
        <div className="flex-grow">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-slate-400">{subtitle}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
                {year && <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">Year: {year}</span>}
                {paperType && paperTypeLabels[paperType] && (
                    <span className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
                        {paperTypeLabels[paperType]}
                    </span>
                )}
                {term && <span className="text-xs bg-green-900 text-green-200 px-2 py-0.5 rounded">Term {term}</span>}
            </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full">
            <Download className="h-5 w-5" />
        </button>
    </div>
);

const GradeSection = ({
    level,
    grade,
    label,
    selectedType,
    selectedYear,
    selectedSubject,
    selectedPaperType,
    selectedGrade,
    selectedTerm
}) => {
    let resources = mockData.filter(r => r.level === level && r.grade === grade && r.type === selectedType);

    // Apply filters based on resource type
    if (selectedType === ResourceType.TEXTBOOKS || selectedType === ResourceType.PAMPHLETS) {
        // Textbooks and pamphlets: filter by subject and grade
        if (selectedSubject && selectedSubject !== 'All Subjects') {
            resources = resources.filter(r => r.subject === selectedSubject);
        }
        if (selectedGrade && selectedGrade !== 'all') {
            resources = resources.filter(r => r.grade === selectedGrade);
        }
    }

    if (selectedType === ResourceType.SCHEMES) {
        // Schemes of work: filter by subject, grade, and term
        if (selectedSubject && selectedSubject !== 'All Subjects') {
            resources = resources.filter(r => r.subject === selectedSubject);
        }
        if (selectedGrade && selectedGrade !== 'all') {
            resources = resources.filter(r => r.grade === selectedGrade);
        }
        if (selectedTerm && selectedTerm !== 'all') {
            resources = resources.filter(r => r.term === parseInt(selectedTerm));
        }
    }

    if (selectedType === ResourceType.SYLLABUS) {
        // Syllabus: filter by grade only
        if (selectedGrade && selectedGrade !== 'all') {
            resources = resources.filter(r => r.grade === selectedGrade);
        }
    }

    if (selectedType === ResourceType.PAST_PAPERS) {
        // Past papers: filter by year, subject, and paper type (no grade filter)
        if (selectedYear) {
            resources = resources.filter(r => r.year === selectedYear);
        }
        if (selectedSubject && selectedSubject !== 'All Subjects') {
            resources = resources.filter(r => r.subject === selectedSubject);
        }
        if (selectedPaperType) {
            resources = resources.filter(r => r.paperType === selectedPaperType);
        }
        // Note: No grade filtering for past papers
    }

    if (resources.length === 0) return null;

    // Group past papers by paper type for better organization
    if (selectedType === ResourceType.PAST_PAPERS && !selectedPaperType) {
        const papersByType = resources.reduce((acc, resource) => {
            const type = resource.paperType || 'general';
            if (!acc[type]) acc[type] = [];
            acc[type].push(resource);
            return acc;
        }, {});

        return (
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3 bg-slate-800 p-2 rounded-lg border-l-4 border-yellow-500">
                    {label}
                </h4>
                {Object.entries(papersByType).map(([paperType, paperResources]) => {
                    // Explicitly cast to array
                    const resourcesArray = paperResources;
                    return (
                        <div key={paperType} className="mb-4">
                            <h5 className="text-md font-semibold text-blue-400 mb-2 ml-2">
                                {paperTypeLabels[paperType]}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array.isArray(resourcesArray) && resourcesArray.map(resource => (
                                    <ResourceCard
                                        key={resource.id}
                                        icon={resourceIcons[resource.type]}
                                        title={resource.title}
                                        subtitle={resource.author}
                                        year={resource.year}
                                        paperType={resource.paperType}
                                        term={resource.term}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (


        <div className="mb-6">

            <h4 className="text-lg font-semibold text-white mb-3 bg-slate-800 p-2 rounded-lg border-l-4 border-yellow-500">
                {label}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resources.map(resource => (
                    <ResourceCard
                        key={resource.id}
                        icon={resourceIcons[resource.type]}
                        title={resource.title}
                        subtitle={resource.author}
                        year={resource.year}
                        paperType={resource.paperType}
                        term={resource.term}
                    />
                ))}
            </div>
        </div>
    );
};

const TeacherToolCard = ({ icon: Icon, title, description, href, ctaText = "Create New", className = "bg-green-600 hover:bg-green-700" }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
        <div className="flex items-center mb-3">
            <Icon className="h-7 w-7 text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400 flex-grow mb-4">{description}</p>
        <Link to={href} className={`mt-auto text-center text-white font-bold py-2 px-4 rounded-lg transition-colors ${className}`}>
            {ctaText}
        </Link>
    </div>
);

// --- MAIN PAGE COMPONENT ---
function ResourcesPage() {
    // Mock user data since AppContext is not available
    const [user] = useState({
        role: 'teacher' // or 'student' - you can change this to test different views
    });

    const [selectedLevel, setSelectedLevel] = useState(EducationLevel.PRIMARY);
    const [selectedType, setSelectedType] = useState(ResourceType.TEXTBOOKS);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');
    const [selectedPaperType, setSelectedPaperType] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [selectedTerm, setSelectedTerm] = useState('all');
    const [isSideMenuOpen, setSideMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const primaryGrades = [
        { value: 'standard1', label: 'Standard 1' },
        { value: 'standard2', label: 'Standard 2' },
        { value: 'standard3', label: 'Standard 3' },
        { value: 'standard4', label: 'Standard 4' },
        { value: 'standard5', label: 'Standard 5' },
        { value: 'standard6', label: 'Standard 6' },
        { value: 'standard7', label: 'Standard 7' },
        { value: 'standard8', label: 'Standard 8' }
    ];

    const secondaryGrades = [
        { value: 'form1', label: 'Form 1' },
        { value: 'form2', label: 'Form 2' },
        { value: 'form3', label: 'Form 3' },
        { value: 'form4', label: 'Form 4' }
    ];

    // Get current grades based on selected level
    const currentGrades = selectedLevel === EducationLevel.PRIMARY ? primaryGrades : secondaryGrades;

    // Resource types - filter out 'schemes' for students
    const allResourceTypes = [
        { value: ResourceType.TEXTBOOKS, label: 'Textbooks' },
        { value: ResourceType.PAMPHLETS, label: 'Pamphlets' },
        { value: ResourceType.SCHEMES, label: 'Schemes of Work' },
        { value: ResourceType.SYLLABUS, label: 'Syllabus' },
        { value: ResourceType.PAST_PAPERS, label: 'Past Papers' }
    ];

    // For students, remove the 'schemes' option completely
    const resourceTypes = user.role === 'student'
        ? allResourceTypes.filter(type => type.value !== ResourceType.SCHEMES)
        : allResourceTypes;

    const paperTypes = [
        { value: PaperType.PSLCE, label: 'PSLCE (MANEB)' },
        { value: PaperType.JCE, label: 'JCE (MANEB)' },
        { value: PaperType.MSCE, label: 'MSCE (MANEB)' },
        { value: PaperType.MOCK, label: 'Mock Examinations' },
        { value: PaperType.GENERAL, label: 'General Papers' }
    ];

    // Get available subjects based on selected level and grade
    const getAvailableSubjects = () => {
        if (selectedLevel === EducationLevel.PRIMARY) {
            return primarySubjects;
        } else {
            if (selectedPaperType === PaperType.JCE || selectedPaperType === PaperType.MOCK || selectedPaperType === PaperType.GENERAL) {
                return form2Subjects;
            } else if (selectedPaperType === PaperType.MSCE) {
                return form4Subjects;
            }
            return ['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography'];
        }
    };

    // Get available paper types based on selected level
    const getAvailablePaperTypes = () => {
        if (selectedLevel === EducationLevel.PRIMARY) {
            return paperTypes.filter(pt => pt.value === PaperType.PSLCE || pt.value === PaperType.MOCK || pt.value === PaperType.GENERAL);
        } else {
            return paperTypes.filter(pt => pt.value !== PaperType.PSLCE); // Remove PSLCE for secondary
        }
    };

    const clearFilters = () => {
        setSelectedYear('');
        setSelectedSubject('All Subjects');
        setSelectedPaperType('');
        setSelectedGrade('all');
        setSelectedTerm('all');
    };

    // Determine which filters to show based on resource type
    const showGradeFilter = selectedType !== ResourceType.PAST_PAPERS; // Hide grade filter for past papers
    const showSubjectFilter = selectedType !== ResourceType.SYLLABUS; // Show subject filter for all except syllabus
    const showTermFilter = selectedType === ResourceType.SCHEMES; // Show term filter only for schemes
    const showPaperTypeFilter = selectedType === ResourceType.PAST_PAPERS;
    const showYearFilter = selectedType === ResourceType.PAST_PAPERS;

    return (
        <>
            <Header onShowAdmin={() => { }} />
            <div className={`transition-all duration-300`}>
                <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold mb-2">Library</h1>
                        <p className="text-slate-400 mb-8">Your central library for all educational materials organized by level, grade, and resource type.</p>

                        {/* Teacher-Only Tools Section */}
                        {user.role === 'teacher' && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold mb-4 border-l-4 border-green-500 pl-3">Teacher Toolkit</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <TeacherToolCard
                                        icon={PenSquare}
                                        title="Lesson Plan Creator"
                                        description="Use our template to build and manage your lesson plans."
                                        href="/resources/create-lesson-plan"
                                    />
                                    <TeacherToolCard
                                        icon={FilePlus2}
                                        title="Scheme of Work Generator"
                                        description="Design your termly schemes of work with our intuitive tool."
                                        href="/resources/create-scheme-of-work"
                                    />
                                    <TeacherToolCard
                                        icon={UploadCloud}
                                        title="Upload Resource"
                                        description="Share your own books, papers, or tutorials with the community."
                                        href="/resources/upload"
                                        ctaText="Upload Now"
                                        className="bg-purple-600 hover:bg-purple-700"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Library Navigation */}
                        <div className="mb-8">
                            {/* Level Selection */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => {
                                        setSelectedLevel(EducationLevel.PRIMARY);
                                        clearFilters();
                                    }}
                                    className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${selectedLevel === EducationLevel.PRIMARY
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    <School className="inline-block mr-2 h-6 w-6" />
                                    Primary School (Standard 1-8)
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedLevel(EducationLevel.SECONDARY);
                                        clearFilters();
                                    }}
                                    className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${selectedLevel === EducationLevel.SECONDARY
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    <GraduationCap className="inline-block mr-2 h-6 w-6" />
                                    Secondary School (Form 1-4)
                                </button>
                            </div>

                            {/* Resource Type Selection */}
                            <div className="flex flex-wrap gap-2 border-b border-slate-700 mb-6 pb-2">
                                {resourceTypes.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => {
                                            setSelectedType(type.value);
                                            setSelectedGrade('all');
                                            setSelectedTerm('all');
                                        }}
                                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${selectedType === type.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Dynamic Filters based on Resource Type */}
                            {(showGradeFilter || showSubjectFilter || showTermFilter || showPaperTypeFilter || showYearFilter) && (
                                <div className="bg-slate-800 p-4 rounded-lg mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Filter className="h-5 w-5 text-blue-400" />
                                        <h3 className="font-semibold text-white">Filter Resources</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Grade Filter - Hidden for past papers */}
                                        {showGradeFilter && (
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Class/Grade</label>
                                                <select
                                                    value={selectedGrade}
                                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                                    className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600"
                                                >
                                                    <option value="all">All Classes</option>
                                                    {currentGrades.map(grade => (
                                                        <option key={grade.value} value={grade.value}>{grade.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Subject Filter - Show for all except syllabus */}
                                        {showSubjectFilter && (
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Subject</label>
                                                <select
                                                    value={selectedSubject}
                                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                                    className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600"
                                                >
                                                    <option value="All Subjects">All Subjects</option>
                                                    {getAvailableSubjects().map(subject => (
                                                        <option key={subject} value={subject}>{subject}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Term Filter - Only for schemes of work */}
                                        {showTermFilter && (
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">
                                                    <Calendar className="inline-block h-4 w-4 mr-1" />
                                                    Term
                                                </label>
                                                <select
                                                    value={selectedTerm}
                                                    onChange={(e) => setSelectedTerm(e.target.value)}
                                                    className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600"
                                                >
                                                    <option value="all">All Terms</option>
                                                    <option value="1">Term 1</option>
                                                    <option value="2">Term 2</option>
                                                    <option value="3">Term 3</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Paper Type Filter - Only for past papers */}
                                        {showPaperTypeFilter && (
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Paper Type</label>
                                                <select
                                                    value={selectedPaperType}
                                                    onChange={(e) => setSelectedPaperType(e.target.value)}
                                                    className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600"
                                                >
                                                    <option value="">All Paper Types</option>
                                                    {getAvailablePaperTypes().map(pt => (
                                                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Year Filter - Only for past papers */}
                                        {showYearFilter && (
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Year</label>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                    className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600"
                                                >
                                                    <option value="">All Years</option>
                                                    {availableYears.map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Clear Filters Button */}
                                        <div className="flex items-end">
                                            <button
                                                onClick={clearFilters}
                                                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resource Display by Grade */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold border-l-4 border-blue-500 pl-3">
                                {selectedLevel === EducationLevel.PRIMARY ? 'Primary School' : 'Secondary School'} - {resourceLabels[selectedType]}
                                <span className="text-sm font-normal text-slate-400 ml-4">
                                    {selectedGrade !== 'all' && showGradeFilter && `Class: ${currentGrades.find(g => g.value === selectedGrade)?.label} `}
                                    {selectedSubject !== 'All Subjects' && showSubjectFilter && `Subject: ${selectedSubject} `}
                                    {selectedTerm !== 'all' && showTermFilter && `Term: ${selectedTerm} `}
                                    {selectedYear && showYearFilter && `Year: ${selectedYear} `}
                                    {selectedPaperType && showPaperTypeFilter && `Type: ${paperTypeLabels[selectedPaperType]} `}
                                </span>
                            </h2>

                            {selectedLevel === EducationLevel.PRIMARY
                                ? primaryGrades.map(grade => (
                                    <GradeSection
                                        key={grade.value}
                                        level={EducationLevel.PRIMARY}
                                        grade={grade.value}
                                        label={grade.label}
                                        selectedType={selectedType}
                                        selectedYear={selectedYear}
                                        selectedSubject={selectedSubject}
                                        selectedPaperType={selectedPaperType || undefined}
                                        selectedGrade={selectedGrade}
                                        selectedTerm={selectedTerm}
                                    />
                                ))
                                : secondaryGrades.map(grade => (
                                    <GradeSection
                                        key={grade.value}
                                        level={EducationLevel.SECONDARY}
                                        grade={grade.value}
                                        label={grade.label}
                                        selectedType={selectedType}
                                        selectedYear={selectedYear}
                                        selectedSubject={selectedSubject}
                                        selectedPaperType={selectedPaperType || undefined}
                                        selectedGrade={selectedGrade}
                                        selectedTerm={selectedTerm}
                                    />
                                ))
                            }
                        </div>
                    </div>
                    <Footer />
                </main>

            </div>

        </>
    );
}

// --- EXPORT THE COMPONENT ---
export default ResourcesPage;