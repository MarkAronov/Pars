import PropTypes from 'prop-types';
import React from 'react';

import {
  Chat as ChatIcon,
  People as PeopleIcon,
  PlayCircle as PlayCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material/';
import { Box, Grid, Paper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import ParsLogo from '../2-atoms/CustomIcons/ParsLogo';
import Footer from '../3-molecules/Footer';

const InfoPanel = React.memo(
  () => {
    const theme = useTheme();
    const items: any = [
      [<SearchIcon key="SearchIcon" />, 'Follow your interests'],
      [<PeopleIcon key="PeopleIcon" />, 'Make some friends'],
      [<ChatIcon key="ChatIcon" />, 'Join the conversation'],
      [<PlayCircleIcon key="PlayCircleIcon" />, 'Create original content'],
    ];

    return (
      <Grid
        item
        xs={12}
        sm={12}
        md={6}
        sx={{
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[200],
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Grid
          component={'span'}
          sx={{
            margin: theme.spacing(4, 3),
            flexDirection: 'column',
            verticalAlign: 'middle',
            display: 'block',
          }}
        >
          {items.map((value: any) => (
            <Grid
              key={value[1]}
              container
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                py: 1.5,
                px: 1.5,
              }}
            >
              <Grid item>{value[0]}</Grid>
              <Grid item>
                <Typography variant="h6">{value[1]}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    );
  },
  (prev, curr) => true
);

InfoPanel.displayName = 'InfoPanel';

/**
 * The app's login/signup page for new visitors
 * @param {object} props object file that contains a signup or a
 *                       login component
 * @return {JSX.Element} returns a start page
 */
const StartPage = (props: {
  page:
  | string
  | number
  | boolean
  | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  | React.ReactFragment
  | React.ReactPortal
  | null
  | undefined;
}) => {
  const theme = useTheme();
  const widthChange = useMediaQuery(theme.breakpoints.up('xs'));

  return (
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <Grid
        container
        direction="row"
        sx={{
          flex: 1,
          flexDirection: widthChange ? 'row-reverse' : 'column',
        }}
      >
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          sx={{
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.grey[50],
            alignItems: 'center',
            display: widthChange ? 'flex' : '',
            justifyContent: 'center',
          }}
          elevation={6}
          square
          component={Paper}
        >
          <Box
            sx={{
              marginLeft: 'auto',
              marginRight: 'auto',
              width: {
                xs: '70%',
                sm: '60%',
                md: '60%',
                lg: '55%',
              },
              my: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <ParsLogo
              sx={{
                margin: theme.spacing(5, 0, 3),
              }}
            />
            <Grid
              sx={{
                margin: theme.spacing(2, 0, 8),
              }}
            >
              {props.page}
            </Grid>
          </Box>
        </Grid>
        <InfoPanel />
      </Grid>
      <Footer />
    </Grid>
  );
};

StartPage.propTypes = {
  page: PropTypes.object.isRequired,
};
StartPage.displayName = 'Start Page';

export default StartPage;
