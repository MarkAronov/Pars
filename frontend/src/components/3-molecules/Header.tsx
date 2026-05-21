import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  useMediaQuery,
} from '@mui/material/';
import { useTheme } from '@mui/material/styles';

import MenuAppBar from '../2-atoms/AppBarItems/MenuAppBar';
import NotificationsAppBar from '../2-atoms/AppBarItems/NotificationsAppBar';
import ParsLogo from '../2-atoms/CustomIcons/ParsLogo';
import SearchBar from '../2-atoms/TextInputs/SearchBar';

/**
 * The Header component
 * @param {object} props object file that contains all the needed props to
 *                       control the Header
 * @return {JSX.Element} returns a Header component
 */
const Header = (props: { sx: any; handleDrawer: any }): JSX.Element => {
  const theme = useTheme();
  const [mobileSearchBar, setMobileSearchBar] = useState(false);
  const widthChange = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!widthChange && mobileSearchBar) {
      setMobileSearchBar(!mobileSearchBar);
    }
  }, [widthChange, mobileSearchBar]);

  const LeftSection = () => (
    <>
      <Box sx={{ display: mobileSearchBar && widthChange ? 'none' : 'flex' }}>
        <IconButton
          size="large"
          edge="start"
          onClick={props.handleDrawer}
          sx={{
            mr: 1,
          }}
        >
          <MenuOutlinedIcon />
        </IconButton>
        <IconButton>
          <ParsLogo
            sx={{
              mx: 3,
              [theme.breakpoints.down('sm')]: {
                mx: 1,
              },
            }}
            size={32}
          />
        </IconButton>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
        }}
      />
    </>
  );

  const RightSection = memo(() => (
    <>
      <Box
        sx={{
          display: mobileSearchBar && widthChange ? 'none' : 'flex',
          flexGrow: 1,
          [theme.breakpoints.down('sm')]: {
            flexGrow: 0,
          },
        }}
      />
      <Box sx={{ display: mobileSearchBar && widthChange ? 'none' : 'flex' }}>
        <NotificationsAppBar />
        <MenuAppBar />
      </Box>
    </>
  ));
  RightSection.displayName = 'RightSection';

  return (
    <AppBar
      sx={{
        justifyContent: 'space-between',
        overflowX: 'auto',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ backgroundColor: 'inherit' }} variant="dense">
        <LeftSection />
        <SearchBar
          mobileSearchBar={mobileSearchBar}
          setMobileSearchBar={setMobileSearchBar}
        />
        <RightSection />
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  handleDrawer: PropTypes.func.isRequired,
};
Header.displayName = 'Header';

export default Header;
