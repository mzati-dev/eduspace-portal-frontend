import React from 'react';
import { MessageSquare } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';

// Mock tutors data
const mockTutors = [
    {
        id: '1',
        title: 'Mr.',
        name: 'John Phiri',
        bio: 'Experienced Mathematics and Physics tutor with 5 years of teaching experience. I help students understand complex concepts easily.',
        subjects: ['Mathematics', 'Physics'],
        monthlyRate: 50000,
        user: {
            id: '1',
            name: 'John Phiri',
            profileImageUrl: null
        }
    },
    {
        id: '2',
        title: 'Mrs.',
        name: 'Mary Banda',
        bio: 'English and Literature specialist. Passionate about helping students improve their writing and comprehension skills.',
        subjects: ['English', 'Literature'],
        monthlyRate: 45000,
        user: {
            id: '2',
            name: 'Mary Banda',
            profileImageUrl: null
        }
    },
    {
        id: '3',
        title: 'Mr.',
        name: 'David Mwale',
        bio: 'Chemistry and Biology tutor. Making science fun and easy to understand for all students.',
        subjects: ['Chemistry', 'Biology'],
        monthlyRate: 55000,
        user: {
            id: '3',
            name: 'David Mwale',
            profileImageUrl: null
        }
    },
    {
        id: '4',
        title: 'Ms.',
        name: 'Grace Chisale',
        bio: 'Computer Science and ICT tutor. Teaching programming and digital literacy skills.',
        subjects: ['Computer Science', 'ICT'],
        monthlyRate: 60000,
        user: {
            id: '4',
            name: 'Grace Chisale',
            profileImageUrl: null
        }
    }
];

const TutorCard = ({ tutor, onContactTutor }) => {
    const fullAvatarUrl = tutor.user?.profileImageUrl;
    const nameParts = tutor.name?.split(' ') || [];
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : tutor.name;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    {fullAvatarUrl ? (
                        <img
                            src={fullAvatarUrl}
                            alt={tutor.name}
                            className="h-16 w-16 rounded-full object-cover flex-shrink-0 mr-4"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold flex-shrink-0 mr-4">
                            {tutor.name?.split(' ').pop()?.[0] || '?'}
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-white">{`${tutor.title} ${surname}`}</h3>
                    </div>
                </div>

                <p className="text-slate-400 text-sm mb-4">{tutor.bio}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {tutor.subjects?.map((subject) => (
                        <span key={subject} className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                            {subject}
                        </span>
                    ))}
                </div>

                {tutor.monthlyRate && (
                    <div className="border-t border-slate-700 pt-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="font-semibold text-white">
                                <span className="text-green-400">MWK </span>
                                {tutor.monthlyRate.toLocaleString()}
                            </span>
                            <span className="text-slate-400">monthly / subject</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => onContactTutor(tutor)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center justify-center"
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact {`${tutor.title} ${surname}`}
                </button>
            </div>
        </div>
    );
};

function TutorFinder() {
    return (
        <>
            <Header onShowAdmin={() => { }} />
            <main className="bg-slate-900 text-white p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Find Your Perfect Tutor</h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Search for qualified tutors by subject and connect with them for part time lessons.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {mockTutors.map(tutor => (
                            <TutorCard
                                key={tutor.id}
                                tutor={tutor}
                                onContactTutor={(tutor) => console.log('Contact tutor:', tutor.name)}
                            />
                        ))}
                    </div>

                    <div className="text-center mt-20 py-12 bg-slate-800/50 rounded-lg">
                        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
                        <div className="flex flex-col md:flex-row justify-center gap-8 px-4">
                            <div className="flex-1 max-w-xs mx-auto">
                                <div className="text-3xl font-bold text-blue-400 mb-2">1.</div>
                                <h3 className="text-xl font-semibold mb-2">Search & Find</h3>
                                <p className="text-slate-400">Use the search bar to find tutors who specialize in the subject you need help with.</p>
                            </div>
                            <div className="flex-1 max-w-xs mx-auto">
                                <div className="text-3xl font-bold text-blue-400 mb-2">2.</div>
                                <h3 className="text-xl font-semibold mb-2">Contact & Schedule</h3>
                                <p className="text-slate-400">Use the contact button to message a tutor and arrange a time that works for both of you.</p>
                            </div>
                            <div className="flex-1 max-w-xs mx-auto">
                                <div className="text-3xl font-bold text-blue-400 mb-2">3.</div>
                                <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
                                <p className="text-slate-400">Meet your tutor for your scheduled online session and start improving your skills.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>

        </>
    );
}

export default TutorFinder;

// import React, { useState, useEffect } from 'react';
// import { Star, MessageSquare, DollarSign } from 'lucide-react';
// import Header from '../common/Header';
// import Footer from '../common/Footer';

// // Mock tutors data
// const mockTutors = [
//     {
//         id: '1',
//         title: 'Mr.',
//         name: 'John Phiri',
//         bio: 'Experienced Mathematics and Physics tutor with 5 years of teaching experience. I help students understand complex concepts easily.',
//         subjects: ['Mathematics', 'Physics'],
//         monthlyRate: 50000,
//         user: {
//             id: '1',
//             name: 'John Phiri',
//             profileImageUrl: null
//         }
//     },
//     {
//         id: '2',
//         title: 'Mrs.',
//         name: 'Mary Banda',
//         bio: 'English and Literature specialist. Passionate about helping students improve their writing and comprehension skills.',
//         subjects: ['English', 'Literature'],
//         monthlyRate: 45000,
//         user: {
//             id: '2',
//             name: 'Mary Banda',
//             profileImageUrl: null
//         }
//     },
//     {
//         id: '3',
//         title: 'Mr.',
//         name: 'David Mwale',
//         bio: 'Chemistry and Biology tutor. Making science fun and easy to understand for all students.',
//         subjects: ['Chemistry', 'Biology'],
//         monthlyRate: 55000,
//         user: {
//             id: '3',
//             name: 'David Mwale',
//             profileImageUrl: null
//         }
//     },
//     {
//         id: '4',
//         title: 'Ms.',
//         name: 'Grace Chisale',
//         bio: 'Computer Science and ICT tutor. Teaching programming and digital literacy skills.',
//         subjects: ['Computer Science', 'ICT'],
//         monthlyRate: 60000,
//         user: {
//             id: '4',
//             name: 'Grace Chisale',
//             profileImageUrl: null
//         }
//     }
// ];

// const TutorCard = ({ tutor, onContactTutor }) => {
//     const fullAvatarUrl = tutor.user?.profileImageUrl;
//     const nameParts = tutor.name?.split(' ') || [];
//     const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : tutor.name;

//     return (
//         <div className="bg-slate-800 border border-slate-700 flex rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
//             <div className="p-6 flex flex-col h-full">
//                 <div className="flex items-center mb-4">
//                     {fullAvatarUrl ? (
//                         <img
//                             src={fullAvatarUrl}
//                             alt={tutor.name}
//                             className="h-16 w-16 rounded-full object-cover flex-shrink-0 mr-4"
//                         />
//                     ) : (
//                         <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold flex-shrink-0 mr-4">
//                             {tutor.name?.split(' ').pop()?.[0] || '?'}
//                         </div>
//                     )}
//                     <div>
//                         <h3 className="text-xl font-bold text-white">{`${tutor.title} ${surname}`}</h3>
//                         <div className="flex items-center text-sm text-yellow-400 mt-1"></div>
//                     </div>
//                 </div>

//                 <p className="text-slate-400 text-sm mb-4 line-clamp-3">{tutor.bio}</p>

//                 <div className='mt-auto'>
//                     <div className="flex flex-wrap gap-2 mb-6">
//                         {tutor.subjects?.map((subject) => (
//                             <span key={subject} className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
//                                 {subject}
//                             </span>
//                         ))}
//                     </div>

//                     {tutor.monthlyRate && (
//                         <div className="border-t border-slate-700 pt-4 my-4">
//                             <div className="flex justify-center items-center gap-2 text-slate-300">
//                                 <span className="text-sm font-bold text-white">
//                                     <span className="h-5 w-5 text-green-400">MWK </span>
//                                     {tutor.monthlyRate.toLocaleString()}
//                                 </span>
//                                 <span className="text-slate-400">monthly / subject</span>
//                             </div>
//                         </div>
//                     )}

//                     <button
//                         onClick={() => onContactTutor(tutor)}
//                         className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 cursor-pointer rounded-lg font-semibold shadow-lg transition flex items-center justify-center"
//                     >
//                         <MessageSquare className="h-4 w-4 mr-2" />
//                         Contact {`${tutor.title} ${surname}`}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// function TutorFinder({ tutors, searchTerm, onContactTutor, isLoading }) {
//     const filteredTutors = (tutors || mockTutors).filter(tutor =>
//         searchTerm === '' ||
//         tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         tutor.subjects.some((subject) =>
//             subject.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//     );

//     if (isLoading) {
//         return (
//             <>
//                 <Header onShowAdmin={() => { }} />
//                 <main className="bg-slate-900 text-white p-8">
//                     <div className="text-center text-xl">Loading Tutors...</div>
//                 </main>
//                 <Footer />
//             </>
//         );
//     }

//     return (
//         <>
//             <Header onShowAdmin={() => { }} />
//             <main className="bg-slate-900 text-white p-4 sm:p-6 md:p-8">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="text-center mb-12">
//                         <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Find Your Perfect Tutor</h1>
//                         <p className="text-lg text-slate-400 max-w-2xl mx-auto">
//                             Search for qualified tutors by subject and connect with them for online lessons.
//                         </p>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//                         {filteredTutors.length > 0 ? (
//                             filteredTutors.map(tutor => (
//                                 <TutorCard key={tutor.id} tutor={tutor} onContactTutor={onContactTutor} />
//                             ))
//                         ) : (
//                             <p className="text-slate-400 col-span-full text-center">No tutors found.</p>
//                         )}
//                     </div>

//                     <div className="text-center mt-20 py-12 bg-slate-800/50 rounded-lg">
//                         <h2 className="text-3xl font-bold mb-8">How It Works</h2>
//                         <div className="flex flex-col md:flex-row justify-center gap-8 px-4">
//                             <div className="flex-1 max-w-xs mx-auto">
//                                 <div className="text-3xl font-bold text-blue-400 mb-2">1.</div>
//                                 <h3 className="text-xl font-semibold mb-2">Search & Find</h3>
//                                 <p className="text-slate-400">Use the search bar to find tutors who specialize in the subject you need help with.</p>
//                             </div>
//                             <div className="flex-1 max-w-xs mx-auto">
//                                 <div className="text-3xl font-bold text-blue-400 mb-2">2.</div>
//                                 <h3 className="text-xl font-semibold mb-2">Contact & Schedule</h3>
//                                 <p className="text-slate-400">Use the contact button to message a tutor and arrange a time that works for both of you.</p>
//                             </div>
//                             <div className="flex-1 max-w-xs mx-auto">
//                                 <div className="text-3xl font-bold text-blue-400 mb-2">3.</div>
//                                 <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
//                                 <p className="text-slate-400">Meet your tutor for your scheduled online session and start improving your skills.</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <Footer />
//             </main>

//         </>
//     );
// }

// export default TutorFinder;