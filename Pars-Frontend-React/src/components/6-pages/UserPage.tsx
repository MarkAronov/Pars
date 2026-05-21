/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';

import { Container } from '@mui/material';

import UserCard from '../3-molecules/UserCard';

/**
 * The user's page
 * @param {object} props object file that contains the user's name
 * @return {JSX.Element} returns a user page
 */
const UserPage = (props) => {
  const { username } = props;

  return (
    <Container>
      <UserCard username={username} />
    </Container>
  );
};

UserPage.propTypes = {
  username: PropTypes.string.isRequired,
};
UserPage.displayName = `User's Page`;

export default UserPage;
