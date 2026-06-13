export function updateBrowserBranding(school: { name: string; logo?: string | null } | null) {
  if (school) {
    // School mode
    document.title = `${school.name} Portal`;
    
    // Update favicon if school has logo
    if (school.logo) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = school.logo;
      link.type = 'image/png';
    }
  } else {
    // Portal mode
    document.title = 'EduSpace Portal';
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = '/eduspace-logo.png';
    }
  }
}