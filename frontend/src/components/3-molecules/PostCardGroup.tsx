import PropTypes from 'prop-types';

import { Grid } from '@mui/material/';

import PostCard from '../2-atoms/PostCard';

/**
 * The PostCardGroup component, it groups postcards according to what's needed
 * @param {object} props object file that contains a postcards list
 * @return {JSX.Element} returns a PostCardGroup component
 */
const PostCardGroup = (props) => {
  const { cardlist } = props;

  return (
    <Grid
      container
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {cardlist.map((value) => (
        <PostCard
          key={value[0]}
          title={value[1]}
          content={value[2]}
          mediafiles={value[3]}
          owner={value[4]}
        />
      ))}
    </Grid>
  );
};

PostCardGroup.propTypes = {
  cardlist: PropTypes.array,
};

export default PostCardGroup;
