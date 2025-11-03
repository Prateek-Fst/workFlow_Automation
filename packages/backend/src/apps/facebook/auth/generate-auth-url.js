export default async function generateAuthUrl($) {
  const { authMethod } = $.auth.data;
  
  if (authMethod === 'manual') {
    // For manual token entry, skip OAuth entirely
    await $.auth.set({
      url: 'SKIP_OAUTH',
      skipPopup: true,
    });
    return;
  }
  
  const oauthRedirectUrl = $.auth.data.oAuthRedirectUrl;
  const appId = $.auth.data.appId;
  
  const searchParams = new URLSearchParams({
    client_id: appId,
    redirect_uri: oauthRedirectUrl,
    scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list',
    response_type: 'code',
    state: Math.random().toString(36).substring(2, 15),
  });

  const url = `https://www.facebook.com/v18.0/dialog/oauth?${searchParams.toString()}`;

  await $.auth.set({
    url,
  });
}