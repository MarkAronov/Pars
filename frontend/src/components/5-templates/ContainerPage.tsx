import { useState } from 'react';

import { Box, Container } from '@mui/material';

import Drawers from '../2-atoms/Drawers';
import Header from '../3-molecules/Header';

/**
 * Warpping function that adds a header and a drawer to the page
 * @param {any} props contians the page
 * @return {JSX.Element} the specific page
 */
const ContainerPage = (props: { page: any }): JSX.Element => {
  const [drawerState, setdrawerState] = useState(false);
  const handleDrawer = () => {
    setdrawerState(!drawerState);
  };
  return (
    <Box
      sx={{
        display: 'flex',
        overflow: 'auto',
        height: 'auto',
        minHeight: '100vh',
      }}
    >
      <Header sx={{ position: 'sticky' }} handleDrawer={handleDrawer} />
      <Drawers drawerState={drawerState} handleDrawer={handleDrawer} />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[100],
          flexGrow: 1,
          mt: '48px',
          py: 3,
        }}
      >
        <Container maxWidth="lg" sx={{ px: 0, py: 0 }}>
          {props.page}
        </Container>
      </Box>
    </Box>
  );
};

ContainerPage.displayName = 'Container Page';

export default ContainerPage;
