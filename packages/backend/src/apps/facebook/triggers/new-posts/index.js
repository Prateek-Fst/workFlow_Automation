import defineTrigger from '../../../../helpers/define-trigger.js';

export default defineTrigger({
  name: 'New posts',
  key: 'newPosts',
  pollInterval: 15,
  description: 'Triggers when you create a new post on Facebook.',

  async run($) {
    const params = {
      fields: 'id,message,created_time,permalink_url,full_picture',
      limit: 25,
    };

    const { data } = await $.http.get('/me/posts', { params });

    if (data?.data) {
      for (const post of data.data) {
        $.pushTriggerItem({
          raw: post,
          meta: {
            internalId: post.id,
          },
        });
      }
    }
  },
});