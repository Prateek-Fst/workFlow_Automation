import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import FacebookPostPreview from '../FacebookPostPreview';

function FacebookActionForm({ 
  actionType, 
  formData, 
  onChange, 
  pages = [], 
  errors = {} 
}) {
  const isFacebookPost = actionType === 'postToFacebook';
  const isInstagramPost = actionType === 'postToInstagram';

  const selectedPage = pages.find(page => page.value === formData.pageId);

  const handleFieldChange = (field) => (event) => {
    onChange({
      ...formData,
      [field]: event.target.value
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isFacebookPost ? 'Facebook Post Configuration' : 'Instagram Post Configuration'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.pageId}>
            <InputLabel>Select Page</InputLabel>
            <Select
              value={formData.pageId || ''}
              onChange={handleFieldChange('pageId')}
              label="Select Page"
            >
              {pages.map((page) => (
                <MenuItem key={page.value} value={page.value}>
                  {page.name}
                  {isInstagramPost && !page.instagramAccount && (
                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                      (No Instagram)
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
            {errors.pageId && (
              <Typography variant="caption" color="error">
                {errors.pageId}
              </Typography>
            )}
          </FormControl>

          {isInstagramPost && selectedPage && !selectedPage.instagramAccount && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This page doesn't have an Instagram Business account connected. 
              Please connect an Instagram Business account to this Facebook page first.
            </Alert>
          )}

          {isFacebookPost && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={formData.message || ''}
              onChange={handleFieldChange('message')}
              error={!!errors.message}
              helperText={errors.message || 'The text content of your Facebook post'}
              sx={{ mt: 2 }}
            />
          )}

          {isInstagramPost && (
            <>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl || ''}
                onChange={handleFieldChange('imageUrl')}
                error={!!errors.imageUrl}
                helperText={errors.imageUrl || 'URL of the image to post (required for Instagram)'}
                sx={{ mt: 2 }}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Caption"
                value={formData.caption || ''}
                onChange={handleFieldChange('caption')}
                error={!!errors.caption}
                helperText={errors.caption || 'Caption for the Instagram post (optional)'}
                sx={{ mt: 2 }}
              />
            </>
          )}

          {isFacebookPost && (
            <>
              <TextField
                fullWidth
                label="Link URL (Optional)"
                value={formData.link || ''}
                onChange={handleFieldChange('link')}
                error={!!errors.link}
                helperText={errors.link || 'Optional link to include in the post'}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Image URL (Optional)"
                value={formData.imageUrl || ''}
                onChange={handleFieldChange('imageUrl')}
                error={!!errors.imageUrl}
                helperText={errors.imageUrl || 'Optional image URL to include in the post'}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Preview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FacebookPostPreview
            platform={isFacebookPost ? 'facebook' : 'instagram'}
            message={isFacebookPost ? formData.message : formData.caption}
            imageUrl={formData.imageUrl}
            linkUrl={isFacebookPost ? formData.link : undefined}
            pageName={selectedPage?.name}
          />

          {isFacebookPost && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Facebook Post Tips:</strong>
                <br />• Keep your message engaging and concise
                <br />• Images get more engagement than text-only posts
                <br />• Links will show a preview automatically
              </Typography>
            </Alert>
          )}

          {isInstagramPost && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Instagram Post Tips:</strong>
                <br />• High-quality images work best (1080x1080px recommended)
                <br />• Use relevant hashtags in your caption
                <br />• Image URL must be publicly accessible
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

FacebookActionForm.propTypes = {
  actionType: PropTypes.oneOf(['postToFacebook', 'postToInstagram']).isRequired,
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  pages: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    instagramAccount: PropTypes.object,
  })),
  errors: PropTypes.object,
};

export default FacebookActionForm;