import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

function FacebookPostPreview({ platform, message, imageUrl, linkUrl, pageName }) {
  const isPlatformFacebook = platform === 'facebook';
  const isPlatformInstagram = platform === 'instagram';

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: isPlatformFacebook ? '#1877f2' : '#E4405F', mr: 2 }}>
            {isPlatformFacebook ? <FacebookIcon /> : <InstagramIcon />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {pageName || 'Your Page'}
            </Typography>
            <Chip 
              label={isPlatformFacebook ? 'Facebook' : 'Instagram'} 
              size="small" 
              color={isPlatformFacebook ? 'primary' : 'secondary'}
            />
          </Box>
        </Box>

        {message && (
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {message}
          </Typography>
        )}

        {imageUrl && (
          <CardMedia
            component="img"
            image={imageUrl}
            alt="Post image"
            sx={{ 
              borderRadius: 1, 
              mb: linkUrl ? 1 : 0,
              maxHeight: 300,
              objectFit: 'cover'
            }}
          />
        )}

        {linkUrl && (
          <Box 
            sx={{ 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1, 
              p: 2,
              bgcolor: 'grey.50'
            }}
          >
            <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-all' }}>
              {linkUrl}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

FacebookPostPreview.propTypes = {
  platform: PropTypes.oneOf(['facebook', 'instagram']).isRequired,
  message: PropTypes.string,
  imageUrl: PropTypes.string,
  linkUrl: PropTypes.string,
  pageName: PropTypes.string,
};

export default FacebookPostPreview;