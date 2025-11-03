export default function addAuthHeader($, requestConfig) {
  // For manual auth, the access token is already included in the request
  // For OAuth, use the user access token for user-level requests
  if ($.auth.data?.accessToken && $.auth.data?.authMethod !== 'manual') {
    requestConfig.params = requestConfig.params || {};
    requestConfig.params.access_token = $.auth.data.accessToken;
  }

  return requestConfig;
}