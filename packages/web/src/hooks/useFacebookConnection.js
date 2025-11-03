import { useMemo } from 'react';

export default function useFacebookConnection(connection) {
  return useMemo(() => {
    if (!connection?.data) {
      return {
        isConnected: false,
        pages: [],
        instagramPages: [],
        facebookOnlyPages: [],
        userName: null,
        userEmail: null,
      };
    }

    const { data } = connection;
    const pages = data.pages || [];
    
    const instagramPages = pages.filter(page => page.instagram_business_account);
    const facebookOnlyPages = pages.filter(page => !page.instagram_business_account);

    return {
      isConnected: true,
      pages,
      instagramPages,
      facebookOnlyPages,
      userName: data.userName,
      userEmail: data.userEmail,
      hasInstagramPages: instagramPages.length > 0,
      hasFacebookPages: pages.length > 0,
    };
  }, [connection]);
}