import { baseApi } from '@/store/api/baseApi';
import type { IUser } from '@/dtos/User';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<IUser, void>({
      query: () => '/users/profile',
      providesTags: ['UserProfile'],
    }),
  }),
});

export const { useGetProfileQuery } = usersApi;
