import { useEffect } from 'react';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';

export const DynamicMeta: React.FC = () => {
  const { school } = useSchoolBranding();

  useEffect(() => {
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      let selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    let title = 'EduSpace Portal';
    let description = 'EduSpace Portal: Your window to your child\'s academic success. Check exam results, download report cards, and stay updated with your child\'s progress. Simple, secure, and always accessible.';
    let ogTitle = 'EduSpace Portal | Your Child\'s Academic Success at Your Fingertips';

    if (school) {
      title = `${school.name} Portal`;
      description = `Check your child's exam results at ${school.name} portal. Enter your child's exam number to access academic performance and download report cards.`;
      ogTitle = `${school.name} Portal | Your Child's Academic Success at Your Fingertips`;
    }

    document.title = title;
    setMetaTag('description', description);
    setMetaTag('og:title', ogTitle, true);
    setMetaTag('og:description', description, true);
  }, [school]);

  return null;
};