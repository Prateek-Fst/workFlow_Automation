export default async function isStillVerified($) {
  try {
    const { authMethod, pages } = $.auth.data;
    
    if (authMethod === 'manual' && pages?.length > 0) {
      // For manual auth, verify the page access token
      const page = pages[0];
      const response = await $.http.get(`/v18.0/${page.id}`, {
        params: {
          access_token: page.access_token,
          fields: 'id',
        },
      });
      return !!response.data.id;
    }
    
    // For OAuth, verify user access token
    const response = await $.http.get('/v18.0/me', {
      params: {
        access_token: $.auth.data.accessToken,
        fields: 'id',
      },
    });

    return !!response.data.id;
  } catch (error) {
    return false;
  }
}