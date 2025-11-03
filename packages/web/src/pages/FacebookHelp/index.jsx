import * as React from 'react';
import Container from '@mui/material/Container';
import FacebookConnectionGuide from 'components/FacebookConnectionGuide';
import PageTitle from 'components/PageTitle';

export default function FacebookHelp() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageTitle>Facebook Integration Help</PageTitle>
      <FacebookConnectionGuide />
    </Container>
  );
}