import { baseApi } from '@/store/api/baseApi';
import { setCredentials } from '@/store/slices/authSlice';
import type { ILoginRequest, IRegisterRequest, IAuthResponse } from '@/dtos/Auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<IAuthResponse, ILoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }): Promise<void> => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ user: data.user, token: data.accessToken }));
      },
      invalidatesTags: ['Games', 'GameHand'],
    }),
    register: builder.mutation<IAuthResponse, IRegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }): Promise<void> => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ user: data.user, token: data.accessToken }));
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
