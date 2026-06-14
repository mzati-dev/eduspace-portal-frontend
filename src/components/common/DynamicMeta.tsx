import { useEffect } from 'react';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';

export const DynamicMeta: React.FC = () => {
  const { school } = useSchoolBranding();

  useEffect(() => {
    let title = 'EduSpace Portal';
    let description = 'EduSpace Portal: Your window to your child\'s academic success. Check exam results, download report cards, and stay updated with your child\'s progress. Simple, secure, and always accessible.';
    let ogTitle = 'EduSpace Portal | Your Child\'s Academic Success at Your Fingertips';

    if (school) {
      title = `${school.name} Portal`;
      description = `Check your child's exam results at ${school.name} portal. Enter your child's exam number to access academic performance and download report cards.`;
      ogTitle = `${school.name} Portal | Your Child's Academic Success at Your Fingertips`;
    }

    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);
    
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) ogTitleTag.setAttribute('content', ogTitle);
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);
  }, [school]);

  return null;
};