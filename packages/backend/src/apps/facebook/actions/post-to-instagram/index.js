import defineAction from '../../../../helpers/define-action.js';

export default defineAction({
  name: 'Post to Instagram',
  key: 'postToInstagram',
  description: 'Create a post on Instagram Business account.',
  arguments: [
    {
      label: 'Page',
      key: 'pageId',
      type: 'dropdown',
      required: true,
      description: 'Select the Facebook page connected to Instagram Business account.',
      variables: true,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listPages',
          },
        ],
      },
    },
    {
      label: 'Image URL',
      key: 'imageUrl',
      type: 'string',
      required: true,
      description: 'URL of the image to post on Instagram.',
      variables: true,
    },
    {
      label: 'Caption',
      key: 'caption',
      type: 'string',
      required: false,
      description: 'Caption for the Instagram post.',
      variables: true,
    },
  ],

  async run($) {
    const { pageId, imageUrl, caption } = $.step.parameters;
    
    // Get page data
    const pages = $.auth.data.pages || [];
    const selectedPage = pages.find(page => page.id === pageId);
    
    if (!selectedPage) {
      throw new Error('Selected page not found');
    }

    if (!selectedPage.instagram_business_account) {
      throw new Error('Selected page does not have an Instagram Business account connected');
    }

    const instagramAccountId = selectedPage.instagram_business_account.id;

    // Step 1: Create media container
    const containerData = {
      image_url: imageUrl,
      access_token: selectedPage.access_token,
    };

    if (caption) {
      containerData.caption = caption;
    }

    const containerResponse = await $.http.post(
      `/v18.0/${instagramAccountId}/media`,
      containerData
    );

    const creationId = containerResponse.data.id;

    // Step 2: Publish the media
    const publishResponse = await $.http.post(
      `/v18.0/${instagramAccountId}/media_publish`,
      {
        creation_id: creationId,
        access_token: selectedPage.access_token,
      }
    );

    $.setActionItem({ 
      raw: publishResponse.data,
      meta: {
        postId: publishResponse.data.id,
        instagramAccountId: instagramAccountId,
        imageUrl: imageUrl,
        caption: caption,
      }
    });
  },
});