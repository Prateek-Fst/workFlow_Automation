import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';

function FacebookConnectionGuide() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Facebook Integration Setup Guide
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        To use Facebook integration, you need to create a Facebook App and configure it properly.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 1: Create a Facebook App
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Go to Facebook Developers"
                secondary={
                  <Link href="https://developers.facebook.com/" target="_blank" rel="noopener">
                    https://developers.facebook.com/
                  </Link>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Click 'Create App' and choose 'Business' type"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Fill in your app details and create the app"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 2: Configure Facebook Login
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Add 'Facebook Login' product to your app"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="In Facebook Login settings, add your OAuth Redirect URL"
                secondary="Copy the OAuth Redirect URL from the connection form"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 3: Add Required Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Your app needs these permissions to post to Facebook and Instagram:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="pages_manage_posts"
                secondary="Required to post content to Facebook pages"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="pages_read_engagement"
                secondary="Required to read page information"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="instagram_basic"
                secondary="Required for Instagram integration"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="instagram_content_publish"
                secondary="Required to post content to Instagram"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="pages_show_list"
                secondary="Required to list available pages"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 4: Get App Credentials
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Go to App Settings > Basic"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Copy your App ID and App Secret"
                secondary="You'll need these to create the connection"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 5: Instagram Business Account (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            To post to Instagram, you need to connect an Instagram Business account to your Facebook page:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Convert your Instagram account to a Business account"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Connect it to your Facebook page in Facebook Page settings"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FacebookConnectionGuide;