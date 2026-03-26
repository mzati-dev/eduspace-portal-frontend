import React from 'react';
import TutorFinder from './TutorFinder';

function FindTutorPage() {
    return <TutorFinder />;
}

export default FindTutorPage;

// import React, { useState, useEffect } from 'react';
// import TutorFinder from './TutorFinder';
// import TeacherTutorDashboard from './TeacherTutorDashboard';


// function FindTutorPage({ user, tutors, searchTerm, onContactTutor, isLoading, updateTutor }) {
//     return (
//         <>

//             <div>
//                 {user?.role === 'teacher' ? (
//                     <TeacherTutorDashboard user={user} updateTutor={updateTutor} />
//                 ) : (
//                     <TutorFinder
//                         tutors={tutors}
//                         searchTerm={searchTerm}
//                         onContactTutor={onContactTutor}
//                         isLoading={isLoading}
//                     />

//                 )}

//             </div>
//         </>
//     );
// }

// export default FindTutorPage;