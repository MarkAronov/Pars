import { useEffect, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { emailChecker } from '../../lib/checkers';
import TextInput from '../2-atoms/TextInputs/TextInput';
/**
 * The login component
 * @return {JSX.Element} returns a login component
 */
const Login = () => {
  const theme = useTheme();
  const auth = useAuth();
  const formKeys: string[][] = [
    ['email', 'Email'],
    ['password', 'Password'],
  ];
  // const [data, setData] = useState(
  //   formKeys.reduce(
  //     (object, key) => ({
  //       ...object,
  //       [key]: '',
  //     }),
  //     {}
  //   )
  // );
  const [data, setData] = useState({
    email: 'bdb@ddd.com',
    password: 'bbDFFDF2s55',
  });
  const [errors, setErrors] = useState<any>(
    formKeys.reduce<any>(
      (object, key) => ({
        ...object,
        [key[0]]: {
          state: false,
          message: null,
          data: null,
        },
      }),
      {}
    )
  );
  const [disabledLogin, setDisabledLogin] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(true);
  const errorMap = {
    email: {
      state:
        emailChecker(data.email, errors.email.data, 'login').length !== 0 &&
        data.email !== '',
      message: emailChecker(data.email, errors.email.data, 'login'),
    },
    password: {
      state: data.password === errors.password.data && data.password !== '',
      message: ['Incorrect password'],
    },
  };

  useEffect(() => {
    setDisabledLogin(true);
    formKeys.forEach((key) => {
      setErrors((err: any) => ({
        ...err,
        [key[0]]: {
          ...err[key[0]],
          state: false,
        },
      }));
    });
    const timeout = setTimeout(() => {
      formKeys.forEach((key) => {
        setErrors((err: any) => ({
          ...err,
          [key[0]]: {
            ...err[key[0]],
            state: errorMap[key[0]].state,
            message: errorMap[key[0]].message,
          },
        }));
      });

      setDisabledLogin(false);
    }, 1000);

    return () => {
      setDisabledLogin(false);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setData((data) => ({ ...data, [id]: value }));
  };

  const handleLogin = async () => {
    setHasDataLoaded(false);
    const formData: any = new FormData();
    formData.append(
      'content',
      JSON.stringify({
        email: data.email,
        password: data.password,
      })
    );
    const results = await auth?.dispatch({
      type: 'logIn',
      formData,
    });
    setHasDataLoaded(true);

    if (results && results.status === 400) {
      for (const key of Object.keys(results.data)) {
        if (results.data[key].length) {
          const msgArr: any = [];
          results.data[key].forEach((res: any) => msgArr.push(res));
          setErrors((err) => ({
            ...err,
            [key]: {
              state: true,
              message: msgArr,
              data: key === 'password' ? data[key] : data,
            },
          }));
        }
      }
      setDisabledLogin(true);
    }
  };

  return (
    <Box component="form">
      {formKeys.map((value) => (
        <TextInput
          key={value[1]}
          id={value[0]}
          label={value[1]}
          value={data[value[0]]}
          handleChange={handleChange}
          error={errors[value[0]].state}
          errorTextList={errors[value[0]].message}
          disabled={!hasDataLoaded}
        />
      ))}
      <LoadingButton
        id="login"
        disabled={
          disabledLogin ||
          !Object.keys(data).every((key) => data[key] !== '') ||
          !Object.keys(errors).every((key) => !errors[key].state) ||
          data.password.length < 10
        }
        loading={!hasDataLoaded}
        fullWidth
        variant="contained"
        onClick={handleLogin}
        sx={{ margin: theme.spacing(3, 0, 2) }}
      >
        {'Log In'}
      </LoadingButton>
      <Grid container direction="row" alignItems="center">
        <Grid item xs>
          <Link component={RouterLink} color="inherit" variant="body2" to="/">
            {'Forgot password?'}
          </Link>
        </Grid>
        <Grid item>
          <Link
            component={RouterLink}
            color="inherit"
            variant="body2"
            to="/signup"
          >
            {'New to Pars? Sign Up'}
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
