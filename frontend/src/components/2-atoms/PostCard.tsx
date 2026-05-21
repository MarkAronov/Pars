import PropTypes from 'prop-types';

import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from '@mui/material';

import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTheme } from '@mui/material/styles';
import UserProfileIcon from './CustomIcons/UserProfileIcon';

/**
 * The PostCard component
 * @param {object} props object file that contains all the needed props to
 *                       display the PostCard
 * @return {JSX.Element} returns a PostCard component
 */
const PostCard = (props: {
  title: any;
  content: any;
  mediafiles: any;
  owner: any;
}) => {
  const { title, content, mediafiles, owner } = props;
  const theme = useTheme();

  return (
    <Card
      sx={{
        my: 3,
        mx: 2,
        maxWidth: 450,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.grey[50],
      }}
    >
      <CardMedia
        component="img"
        height="300"
        image={mediafiles}
        alt=""
        loading="lazy"
      />
      <CardHeader
        avatar={<UserProfileIcon sizeChange={false} user={owner} />}
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        title={title}
        subheader="September 14, 2021"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton>
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

PostCard.propTypes = {
  title: PropTypes.any,
  content: PropTypes.any,
  mediafiles: PropTypes.any,
  owner: PropTypes.any,
};

export default PostCard;
