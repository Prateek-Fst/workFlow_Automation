import defineAction from '../../../../helpers/define-action.js';

export default defineAction({
  name: 'Post to Facebook',
  key: 'postToFacebook',
  description: 'Create a post on a Facebook page.',
  arguments: [
    {
      label: 'Page',
      key: 'pageId',
      type: 'dropdown',
      required: true,
      description: 'Select the Facebook page to post to.',
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
      label: 'Message',
      key: 'message',
      type: 'string',
      required: true,
      description: 'The text content of your Facebook post.',
      variables: true,
    },
  ],

  async run($) {
    try {
      const { pageId, message } = $.step.parameters;
      
      console.log('Step parameters:', { pageId, message });
      console.log('Auth data:', $.auth.data);
      
      if (!pageId) {
        throw new Error('Page ID is required');
      }
      
      if (!message) {
        throw new Error('Message is required');
      }
      
      // Get page access token
      const pages = $.auth.data.pages || [];
      console.log('Available pages:', pages);
      
      const selectedPage = pages.find(page => page.id === pageId);
      
      if (!selectedPage) {
        throw new Error(`Selected page not found. Available pages: ${pages.map(p => p.id).join(', ')}`);
      }

      const postData = {
        message: message,
        access_token: selectedPage.access_token,
      };

      console.log('Posting to Facebook:', { pageId, message });
      const response = await $.http.post(`/v18.0/${pageId}/feed`, postData);
      console.log('Facebook response:', response.data);

      $.setActionItem({ 
        raw: response.data,
        meta: {
          postId: response.data.id,
          pageId: pageId,
        }
      });
    } catch (error) {
      console.error('Facebook action error:', error);
      throw error;
    }
  },
});