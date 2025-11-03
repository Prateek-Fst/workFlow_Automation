import { FACEBOOK_LIMITS } from './constants';

export const validateFacebookPost = (data) => {
  const errors = {};

  if (!data.pageId) {
    errors.pageId = 'Please select a page';
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.message = 'Message is required';
  } else if (data.message.length > FACEBOOK_LIMITS.MESSAGE_MAX_LENGTH) {
    errors.message = `Message is too long (max ${FACEBOOK_LIMITS.MESSAGE_MAX_LENGTH} characters)`;
  }

  if (data.imageUrl && !isValidImageUrl(data.imageUrl)) {
    errors.imageUrl = 'Please provide a valid image URL';
  }

  if (data.link && !isValidUrl(data.link)) {
    errors.link = 'Please provide a valid URL';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateInstagramPost = (data) => {
  const errors = {};

  if (!data.pageId) {
    errors.pageId = 'Please select a page';
  }

  if (!data.imageUrl || data.imageUrl.trim().length === 0) {
    errors.imageUrl = 'Image URL is required for Instagram posts';
  } else if (!isValidImageUrl(data.imageUrl)) {
    errors.imageUrl = 'Please provide a valid image URL';
  }

  if (data.caption && data.caption.length > FACEBOOK_LIMITS.INSTAGRAM_CAPTION_MAX_LENGTH) {
    errors.caption = `Caption is too long (max ${FACEBOOK_LIMITS.INSTAGRAM_CAPTION_MAX_LENGTH} characters)`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const isValidImageUrl = (url) => {
  if (!isValidUrl(url)) return false;
  
  const imageExtensions = FACEBOOK_LIMITS.SUPPORTED_IMAGE_FORMATS;
  const urlLower = url.toLowerCase();
  
  return imageExtensions.some(ext => 
    urlLower.includes(`.${ext}`) || 
    urlLower.includes(`format=${ext}`) ||
    urlLower.includes(`format%3D${ext}`)
  );
};

export const formatPostPreview = (data, platform) => {
  if (platform === 'instagram') {
    return {
      platform: 'instagram',
      message: data.caption,
      imageUrl: data.imageUrl,
    };
  }

  return {
    platform: 'facebook',
    message: data.message,
    imageUrl: data.imageUrl,
    linkUrl: data.link,
  };
};

export const getPageDisplayName = (page) => {
  if (!page) return 'Unknown Page';
  
  let name = page.name;
  if (page.instagram_business_account) {
    name += ' (Instagram Connected)';
  }
  
  return name;
};

export const filterPagesForPlatform = (pages, platform) => {
  if (platform === 'instagram') {
    return pages.filter(page => page.instagram_business_account);
  }
  
  return pages; // All pages can post to Facebook
};