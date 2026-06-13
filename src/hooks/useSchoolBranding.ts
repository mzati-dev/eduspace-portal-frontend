import { useEffect, useState } from 'react';
import { updateBrowserBranding } from '@/utils/browserBranding';

const API_URL = 'https://eduspace-portal-backend.onrender.com';

export function useSchoolBranding() {
  const [school, setSchool] = useState<{ name: string; logo: string | null; slogan: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Check if it's a custom domain (not ending with eduspace.mzatinova.com and not portal)
    const isCustomDomain = !hostname.endsWith('.eduspace.mzatinova.com') && hostname !== 'portal.eduspace.mzatinova.com';
    
    if (isCustomDomain) {
      // Try to fetch school by custom domain
      fetch(`${API_URL}/schools/by-domain/${hostname}`)
        .then(res => {
          if (!res.ok) throw new Error('School not found');
          return res.json();
        })
        .then(data => {
          setSchool({ 
            name: data.name, 
            logo: data.logo_url,
            slogan: data.slogan
          });
          localStorage.setItem('currentSchoolId', data.id);
          updateBrowserBranding({ name: data.name, logo: data.logo_url });
          setLoading(false);
        })
        .catch(() => {
          // No custom domain found, check eduspace subdomain
          checkEduspaceSubdomain(hostname);
        });
    } else {
      // Check eduspace subdomain
      checkEduspaceSubdomain(hostname);
    }
    
    function checkEduspaceSubdomain(hostname: string) {
      const match = hostname.match(/^(.+)\.eduspace\.mzatinova\.com$/);
      
      if (match && match[1] !== 'portal') {
        const subdomain = match[1];
        fetch(`${API_URL}/schools/by-subdomain/${subdomain}`)
          .then(res => res.json())
          .then(data => {
            setSchool({ 
              name: data.name, 
              logo: data.logo_url,
              slogan: data.slogan
            });
            localStorage.setItem('currentSchoolId', data.id);
            updateBrowserBranding({ name: data.name, logo: data.logo_url });
            setLoading(false);
          })
          .catch(() => {
            setSchool(null);
            updateBrowserBranding(null);
            setLoading(false);
          });
      } else {
        setSchool(null);
        updateBrowserBranding(null);
        setLoading(false);
      }
    }
  }, []);

  return { school, loading };
}

// import { useEffect, useState } from 'react';

// const API_URL = 'https://eduspace-portal-backend.onrender.com';

// export function useSchoolBranding() {
//   const [school, setSchool] = useState<{ name: string; logo: string | null; slogan: string | null } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const hostname = window.location.hostname;
    
//     // Check if it's a custom domain (not ending with eduspace.mzatinova.com and not portal)
//     const isCustomDomain = !hostname.endsWith('.eduspace.mzatinova.com') && hostname !== 'portal.eduspace.mzatinova.com';
    
//     if (isCustomDomain) {
//       // Try to fetch school by custom domain
//       fetch(`${API_URL}/schools/by-domain/${hostname}`)
//         .then(res => {
//           if (!res.ok) throw new Error('School not found');
//           return res.json();
//         })
//         .then(data => {
//           setSchool({ 
//             name: data.name, 
//             logo: data.logo_url,
//             slogan: data.slogan
//           });
//           setLoading(false);
//         })
//         .catch(() => {
//           // No custom domain found, check eduspace subdomain
//           checkEduspaceSubdomain(hostname);
//         });
//     } else {
//       // Check eduspace subdomain
//       checkEduspaceSubdomain(hostname);
//     }
    
//     function checkEduspaceSubdomain(hostname: string) {
//       const match = hostname.match(/^(.+)\.eduspace\.mzatinova\.com$/);
      
//       if (match && match[1] !== 'portal') {
//         const subdomain = match[1];
//         fetch(`${API_URL}/schools/by-subdomain/${subdomain}`)
//           .then(res => res.json())
//           .then(data => {
//             setSchool({ 
//               name: data.name, 
//               logo: data.logo_url,
//               slogan: data.slogan
//             });
//             setLoading(false);
//           })
//           .catch(() => {
//             setSchool(null);
//             setLoading(false);
//           });
//       } else {
//         setSchool(null);
//         setLoading(false);
//       }
//     }
//   }, []);

//   return { school, loading };

// import { useEffect, useState } from 'react';

// const API_URL = 'https://eduspace-portal-backend.onrender.com';

// export function useSchoolBranding() {
//   const [school, setSchool] = useState<{ name: string; logo: string | null; slogan: string | null } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const hostname = window.location.hostname;
//     const match = hostname.match(/^(.+)\.eduspace\.mzatinova\.com$/);

//     if (match && match[1] !== 'portal') {
//       const subdomain = match[1];
//       fetch(`${API_URL}/schools/by-subdomain/${subdomain}`)
//         .then(res => res.json())
//         .then(data => {
//           setSchool({ 
//             name: data.name, 
//             logo: data.logo_url,  // ← NO FALLBACK. Keep null if none.
//             slogan: data.slogan   // ← NO FALLBACK. Keep null if none.
//           });
//           setLoading(false);
//         })
//         .catch(() => {
//           setSchool(null);
//           setLoading(false);
//         });
//     } else {
//       setSchool(null);
//       setLoading(false);
//     }
//   }, []);

//   return { school, loading };
// }

// import { useEffect, useState } from 'react';

// const API_URL = 'https://eduspace-portal-backend.onrender.com';

// export function useSchoolBranding() {
//   const [school, setSchool] = useState<{ name: string; logo: string; slogan: string } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const hostname = window.location.hostname;
//     const match = hostname.match(/^(.+)\.eduspace\.mzatinova\.com$/);

//     if (match && match[1] !== 'portal') {
//       const subdomain = match[1];
//       fetch(`${API_URL}/schools/by-subdomain/${subdomain}`)
//         .then(res => res.json())
//         .then(data => {
//           setSchool({ 
//             name: data.name, 
//             logo: data.logo_url || '/eduspace-logo.png',
//             slogan: data.slogan || "A window to a child's academic success"
//           });
//           setLoading(false);
//         })
//         .catch(() => {
//           setSchool(null);
//           setLoading(false);
//         });
//     } else {
//       setSchool(null);
//       setLoading(false);
//     }
//   }, []);

//   return { school, loading };
// }