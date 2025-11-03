import defineTrigger from '../../../../helpers/define-trigger.js';

export default defineTrigger({
  name: 'New page posts',
  key: 'newPagePosts',
  pollInterval: 15,
  description: 'Triggers when a new post is created on a Facebook page.',
  arguments: [
    {
      label: 'Page',
      key: 'pageId',
      type: 'dropdown',
      required: true,
      description: 'Select the Facebook page to monitor for new posts.',
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
  ],

  async run($) {
    const { pageId } = $.step.parameters;
    
    // Get page data
    const pages = $.auth.data.pages || [];
    const selectedPage = pages.find(page => page.id === pageId);
    
    if (!selectedPage) {
      throw new Error('Selected page not found');
    }

    const params = {
      fields: 'id,message,created_time,permalink_url,full_picture,story',
      limit: 25,
      access_token: selectedPage.access_token,
    };

    const { data } = await $.http.get(`/v18.0/${pageId}/posts`, { params });

    if (data?.data) {
      for (const post of data.data) {
        $.pushTriggerItem({
          raw: post,
          meta: {
            internalId: post.id,
            pageId: pageId,
            pageName: selectedPage.name,
          },
        });
      }
    }
  },
});