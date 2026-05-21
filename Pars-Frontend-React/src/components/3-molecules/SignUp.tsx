import { useEffect, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import {
  emailChecker,
  passwordChecker,
  usernameChecker,
} from '../../lib/checkers';
import TextInput from '../2-atoms/TextInputs/TextInput';
/**
 * The SignUp component
 * @return {JSX.Element} returns a signup component
 */
const SignUp = () => {
  const theme = useTheme();
  const auth = useAuth();
  const formKeys = [
    ['username', 'Username'],
    ['email', 'Email'],
    ['emailRepeat', 'Repeat Your Email'],
    ['password', 'Password'],
    ['passwordRepeat', 'Repeat Your Password'],
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
    username: 'asdaa',
    email: 'asd@dd.com',
    emailRepeat: 'asd@dd.com',
    password: 'Asd123453sasd',
    passwordRepeat: 'Asd123453sasd',
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
  const [disabledSignUp, setDisabledSignUp] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(true);
  const errorMap = {
    username: {
      state:
        usernameChecker(data.username, errors.username.data).length !== 0 &&
        data.username !== '',
      message: usernameChecker(data.username, errors.username.data),
    },
    email: {
      state:
        emailChecker(data.email, errors.email.data, 'signup').length !== 0 &&
        data.email !== '',
      message: emailChecker(data.email, errors.email.data, 'signup'),
    },
    emailRepeat: {
      state: data.email !== data.emailRepeat && data.emailRepeat !== '',
      message: ["Emails don't match."],
    },
    password: {
      state:
        passwordChecker(data.password).length !== 0 && data.password !== '',
      message: passwordChecker(data.password),
    },
    passwordRepeat: {
      state:
        data.password !== data.passwordRepeat && data.passwordRepeat !== '',
      message: ["Passwords don't match"],
    },
  };

  useEffect(() => {
    setDisabledSignUp(true);
    formKeys.forEach((key) => {
      setErrors((errors) => ({
        ...errors,
        [key[0]]: {
          ...errors[key[0]],
          state: false,
        },
      }));
    });
    const timeout = setTimeout(async () => {
      formKeys.forEach((key) => {
        setErrors((errors) => ({
          ...errors,
          [key[0]]: {
            ...errors[key[0]],
            state: errorMap[key[0]].state,
            message: errorMap[key[0]].message,
          },
        }));
      });

      setDisabledSignUp(false);
    }, 1000);

    return () => {
      setDisabledSignUp(false);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleChange = (event) => {
    const { value, id } = event.target;
    setData((data) => ({ ...data, [id]: value }));
  };

  const signUpHandle = async () => {
    setHasDataLoaded(false);
    const formData: any = new FormData();
    formData.append(
      'content',
      JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      })
    );
    const results = await auth?.dispatch({
      type: 'signUp',
      formData,
    });
    setHasDataLoaded(true);

    if (results && results.status === 400) {
      for (const key of Object.keys(results)) {
        if (results[key].length) {
          const msgArr: any = [];
          results[key].forEach((res: any) => msgArr.push(res));
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
      setDisabledSignUp(true);
    }
  };

  return (
    <Box component="form">
      {formKeys.map((value) => (
        <TextInput
          key={value[0]}
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
        id="signup"
        disabled={
          disabledSignUp ||
          !Object.keys(data).every((key) => data[key] !== '') ||
          !Object.keys(errors).every((key) => !errors[key].state)
        }
        loading={!hasDataLoaded}
        fullWidth
        variant="contained"
        onClick={signUpHandle}
        sx={{ margin: theme.spacing(3, 0, 2) }}
      >
        <Typography component={'span'} sx={{ display: 'block' }}>
          {`Sign Up`}
        </Typography>
      </LoadingButton>
      <Grid container>
        <Grid item>
          <Link
            component={RouterLink}
            color="inherit"
            variant="body2"
            to="/login"
          >
            <Typography component={'span'} sx={{ display: 'block' }}>
              {`Already have an account? Log In instead`}
            </Typography>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SignUp;
