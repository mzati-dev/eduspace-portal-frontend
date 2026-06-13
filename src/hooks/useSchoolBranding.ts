import { useEffect, useState } from 'react';

const API_URL = 'https://eduspace-portal-backend.onrender.com';

export function useSchoolBranding() {
  const [school, setSchool] = useState<{ name: string; logo: string; slogan: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    const match = hostname.match(/^(.+)\.eduspace\.mzatinova\.com$/);

    if (match && match[1] !== 'portal') {
      const subdomain = match[1];
      fetch(`${API_URL}/schools/by-subdomain/${subdomain}`)
        .then(res => res.json())
        .then(data => {
          setSchool({ 
            name: data.name, 
            logo: data.logo_url || '/eduspace-logo.png',
            slogan: data.slogan || "A window to a child's academic success"
          });
          setLoading(false);
        })
        .catch(() => {
          setSchool(null);
          setLoading(false);
        });
    } else {
      setSchool(null);
      setLoading(false);
    }
  }, []);

  return { school, loading };
}