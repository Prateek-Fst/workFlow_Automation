import defineApp from '../../helpers/define-app.js';
import addAuthHeader from './common/add-auth-header.js';
import auth from './auth/index.js';
import actions from './actions/index.js';
import triggers from './triggers/index.js';
import dynamicData from './dynamic-data/index.js';

export default defineApp({
  name: 'Facebook',
  key: 'facebook',
  iconUrl: '{BASE_URL}/apps/facebook/assets/favicon.svg',
  authDocUrl: '{DOCS_URL}/apps/facebook/connection',
  supportsConnections: true,
  baseUrl: 'https://facebook.com',
  apiBaseUrl: 'https://graph.facebook.com',
  primaryColor: '#1877f2',
  beforeRequest: [addAuthHeader],
  auth,
  actions,
  triggers,
  dynamicData,
});