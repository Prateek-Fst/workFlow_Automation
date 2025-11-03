# Facebook Integration for Automatisch

This integration allows you to automate posting to Facebook pages and Instagram business accounts through the Facebook Graph API.

## Features

- **Post to Facebook Pages**: Create text posts, image posts, and link posts
- **Post to Instagram**: Create image posts with captions on Instagram Business accounts
- **Multi-page Support**: Manage multiple Facebook pages from a single connection
- **Instagram Integration**: Automatic detection of connected Instagram Business accounts
- **New Posts Trigger**: Monitor your personal Facebook posts
- **New Page Posts Trigger**: Monitor specific Facebook pages for new posts

## Setup Requirements

Choose one of two authentication methods:

### Method 1: OAuth (Business App) - Recommended

#### 1. Facebook App Creation
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app with "Business" type
3. Add "Facebook Login" product to your app

#### 2. Required Permissions
Your Facebook app needs these permissions:
- `pages_manage_posts` - Post content to Facebook pages
- `pages_read_engagement` - Read page information
- `instagram_basic` - Basic Instagram integration
- `instagram_content_publish` - Post content to Instagram
- `pages_show_list` - List available pages

#### 3. OAuth Configuration
Add your OAuth redirect URL in Facebook Login settings:
```
{WEB_APP_URL}/app/facebook/connections/add
```

### Method 2: Manual Token Entry - Simple Setup

#### 1. Get Page Access Token
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your Facebook app from the dropdown
3. Click "Get Token" → "Page Access Token"
4. Select your Facebook page from the list
5. Grant required permissions: `pages_manage_posts`, `pages_read_engagement`
6. Click "Generate Access Token"
7. **Important**: This must be a Page Access Token, not a User Access Token

#### 2. Get Page ID
1. Go to your Facebook page
2. Click "About" → "Page transparency" → "Page ID"
3. Or use Graph API Explorer: `GET /{page-name}?fields=id`

#### 3. Get Instagram Account ID (Optional)
1. Use Graph API Explorer: `GET /{page-id}?fields=instagram_business_account`
2. Copy the Instagram account ID from the response

### Instagram Business Account Setup (Both Methods)

To post to Instagram:
1. Convert your Instagram account to a Business account
2. Connect it to your Facebook page in Facebook Page settings

## Available Triggers

### New Posts (`newPosts`)

Triggers when you create a new post on your personal Facebook profile.

**No parameters required**

**Output:**
- Post ID, message, creation time, permalink URL, and image URL

### New Page Posts (`newPagePosts`)

Triggers when a new post is created on a specific Facebook page.

**Parameters:**
- `pageId` (required) - Facebook page ID to monitor

**Output:**
- Post ID, message, creation time, permalink URL, image URL, and page information

## Available Actions

### Post to Facebook (`postToFacebook`)

Creates a post on a Facebook page.

**Parameters:**
- `pageId` (required) - Facebook page ID
- `message` (required) - Post content text
- `link` (optional) - URL to include in the post
- `imageUrl` (optional) - Image URL to include in the post

**Example:**
```javascript
{
  "pageId": "123456789",
  "message": "Check out our latest update!",
  "link": "https://example.com",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Post to Instagram (`postToInstagram`)

Creates a post on an Instagram Business account.

**Parameters:**
- `pageId` (required) - Facebook page ID (must have connected Instagram account)
- `imageUrl` (required) - Image URL to post
- `caption` (optional) - Post caption

**Example:**
```javascript
{
  "pageId": "123456789",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Beautiful sunset! #nature #photography"
}
```

## API Endpoints Used

- `GET /v18.0/oauth/access_token` - Exchange code for access token
- `GET /v18.0/me` - Get user information
- `GET /v18.0/me/accounts` - Get user's pages
- `GET /v18.0/me/posts` - Get user's posts (for triggers)
- `GET /v18.0/{page-id}/posts` - Get page posts (for triggers)
- `POST /v18.0/{page-id}/feed` - Create Facebook post
- `POST /v18.0/{page-id}/photos` - Create Facebook photo post
- `POST /v18.0/{instagram-account-id}/media` - Create Instagram media container
- `POST /v18.0/{instagram-account-id}/media_publish` - Publish Instagram media

## Error Handling

The integration handles common errors:

- Invalid access tokens (automatic re-authentication)
- Missing permissions
- Instagram account not connected
- Invalid image URLs
- API rate limits

## Limitations

- Instagram posts require images (text-only posts not supported)
- Image URLs must be publicly accessible
- Facebook API rate limits apply
- Instagram Business account required for Instagram posting

## Development

### File Structure

```
facebook/
├── index.js                 # Main app definition
├── auth/                    # Authentication handlers
│   ├── index.js
│   ├── generate-auth-url.js
│   ├── verify-credentials.js
│   └── is-still-verified.js
├── actions/                 # Available actions
│   ├── index.js
│   ├── post-to-facebook/
│   └── post-to-instagram/
├── triggers/                # Available triggers
│   ├── index.js
│   ├── new-posts/
│   └── new-page-posts/
├── common/                  # Shared utilities
│   └── add-auth-header.js
├── dynamic-data/           # Dynamic data providers
│   └── list-pages/
└── assets/                 # App assets
    └── favicon.svg
```

### Testing

#### OAuth Method:
1. Create a Facebook app with required permissions
2. Set up OAuth redirect URL
3. Create a connection in Automatisch
4. Test posting to Facebook and Instagram

#### Manual Token Method:
1. Get Page Access Token from Graph API Explorer
2. Get Page ID and Instagram Account ID
3. Create a connection in Automatisch with manual tokens
4. Test posting to Facebook and Instagram

### Debugging

Enable debug logging by setting `DEBUG=facebook` environment variable.

Common issues:
- Check OAuth redirect URL matches exactly
- Verify all required permissions are granted
- Ensure Instagram Business account is properly connected
- Check image URLs are publicly accessible