export const FACEBOOK_PERMISSIONS = [
  'pages_manage_posts',
  'pages_read_engagement', 
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list'
];

export const FACEBOOK_SCOPES = FACEBOOK_PERMISSIONS.join(',');

export const FACEBOOK_API_VERSION = 'v18.0';

export const FACEBOOK_URLS = {
  DEVELOPERS: 'https://developers.facebook.com/',
  APP_DASHBOARD: 'https://developers.facebook.com/apps/',
  PERMISSIONS_REFERENCE: 'https://developers.facebook.com/docs/permissions/reference',
  INSTAGRAM_BUSINESS_SETUP: 'https://help.instagram.com/502981923235522',
};

export const POST_TYPES = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
};

export const FACEBOOK_LIMITS = {
  MESSAGE_MAX_LENGTH: 63206,
  INSTAGRAM_CAPTION_MAX_LENGTH: 2200,
  IMAGE_MAX_SIZE_MB: 4,
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif'],
};