import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

function FacebookStatus({ connection }) {
  const { data: connectionData } = connection || {};
  const pages = connectionData?.pages || [];
  const userName = connectionData?.userName || 'Unknown User';
  const userEmail = connectionData?.userEmail || '';

  const pagesWithInstagram = pages.filter(page => page.instagram_business_account);
  const pagesWithoutInstagram = pages.filter(page => !page.instagram_business_account);

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Facebook Connection Status
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="body1">
              Connected as <strong>{userName}</strong>
              {userEmail && (
                <Typography variant="body2" color="text.secondary" component="span">
                  {' '}({userEmail})
                </Typography>
              )}
            </Typography>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Available Pages ({pages.length})
          </Typography>
          
          {pages.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No pages found. Make sure you have admin access to Facebook pages.
              </Typography>
            </Box>
          ) : (
            <List dense>
              {pages.map((page) => (
                <ListItem key={page.id} sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <FacebookIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={page.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label="Facebook" 
                          size="small" 
                          color="primary" 
                          sx={{ mr: 1 }}
                        />
                        {page.instagram_business_account ? (
                          <Chip 
                            label="Instagram Connected" 
                            size="small" 
                            color="secondary"
                            icon={<InstagramIcon />}
                          />
                        ) : (
                          <Chip 
                            label="No Instagram" 
                            size="small" 
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {pagesWithInstagram.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'success.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" color="success.main">
                Instagram Ready Pages ({pagesWithInstagram.length})
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              These pages can post to both Facebook and Instagram:
            </Typography>
            <List dense>
              {pagesWithInstagram.map((page) => (
                <ListItem key={page.id} sx={{ pl: 2 }}>
                  <ListItemText 
                    primary={page.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {pagesWithoutInstagram.length > 0 && (
        <Card sx={{ bgcolor: 'warning.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" color="warning.main">
                Facebook Only Pages ({pagesWithoutInstagram.length})
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              These pages can only post to Facebook. To enable Instagram posting, 
              connect an Instagram Business account to each page.
            </Typography>
            <List dense>
              {pagesWithoutInstagram.map((page) => (
                <ListItem key={page.id} sx={{ pl: 2 }}>
                  <ListItemText 
                    primary={page.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

FacebookStatus.propTypes = {
  connection: PropTypes.shape({
    data: PropTypes.shape({
      userName: PropTypes.string,
      userEmail: PropTypes.string,
      pages: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        instagram_business_account: PropTypes.object,
      })),
    }),
  }),
};

export default FacebookStatus;