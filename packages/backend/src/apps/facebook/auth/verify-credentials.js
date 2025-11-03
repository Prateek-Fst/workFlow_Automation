export default async function verifyCredentials($) {
  const { authMethod, pageAccessToken, pageId, instagramAccountId, appId, appSecret, code } = $.auth.data;

  if (authMethod === 'manual') {
    // Manual token verification
    if (!pageAccessToken || !pageId) {
      throw new Error('Page Access Token and Page ID are required for manual authentication!');
    }

    // Verify page access token
    const pageResponse = await $.http.get(`/v18.0/${pageId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name,instagram_business_account,access_token',
      },
    });
    
    // Test if token has required permissions
    try {
      await $.http.get(`/v18.0/${pageId}/feed`, {
        params: {
          access_token: pageAccessToken,
          limit: 1,
        },
      });
    } catch (error) {
      if (error.response?.data?.error?.code === 190) {
        throw new Error('Invalid Page Access Token. Please ensure you are using a Page Access Token, not a User Access Token.');
      }
      throw error;
    }

    const pageData = pageResponse.data;
    const pages = [{
      id: pageData.id,
      name: pageData.name,
      access_token: pageAccessToken,
      instagram_business_account: instagramAccountId ? { id: instagramAccountId } : pageData.instagram_business_account,
    }];

    await $.auth.set({
      accessToken: pageAccessToken,
      userId: pageData.id,
      userName: pageData.name,
      userEmail: null,
      pages: pages,
      screenName: pageData.name,
      authMethod: 'manual',
    });
    return;
  }

  // OAuth flow
  const { oAuthRedirectUrl } = $.auth.data;

  if (!appId || !appSecret) {
    throw new Error('App ID and App Secret are required for OAuth authentication!');
  }

  if (!code) {
    throw new Error('Authorization code is required!');
  }

  // Exchange code for access token
  const tokenResponse = await $.http.get('/v18.0/oauth/access_token', {
    params: {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: oAuthRedirectUrl,
      code: code,
    },
  });

  const { access_token } = tokenResponse.data;

  if (!access_token) {
    throw new Error('Failed to obtain access token');
  }

  // Get user info
  const userResponse = await $.http.get('/v18.0/me', {
    params: {
      access_token: access_token,
      fields: 'id,name,email',
    },
  });

  // Get user pages
  const pagesResponse = await $.http.get('/v18.0/me/accounts', {
    params: {
      access_token: access_token,
      fields: 'id,name,access_token,instagram_business_account',
    },
  });

  await $.auth.set({
    accessToken: access_token,
    userId: userResponse.data.id,
    userName: userResponse.data.name,
    userEmail: userResponse.data.email,
    pages: pagesResponse.data.data || [],
    screenName: userResponse.data.name,
    authMethod: 'oauth',
  });
}