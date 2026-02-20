import { type FC, useEffect } from 'react';
import { useGetProfileQuery } from '@/store/api/usersApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, setCredentials, selectCurrentUser, selectToken } from '@/store/slices/authSlice';

export const AuthInitializer: FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const currentUser = useAppSelector(selectCurrentUser);

  const { data: profile, isError } = useGetProfileQuery(undefined, {
    skip: !token || currentUser !== null,
  });

  useEffect(() => {
    if (profile && token && currentUser === null) {
      dispatch(setCredentials({ user: profile, token }));
    }
  }, [profile, token, currentUser, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(logout());
    }
  }, [isError, dispatch]);

  return null;
};
