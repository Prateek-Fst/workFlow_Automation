export default {
  name: 'List pages',
  key: 'listPages',

  async run($) {
    const pages = $.auth.data.pages || [];
    
    return {
      data: pages.map((page) => ({
        value: page.id,
        name: page.name,
        accessToken: page.access_token,
        instagramAccount: page.instagram_business_account,
      })),
    };
  },
};