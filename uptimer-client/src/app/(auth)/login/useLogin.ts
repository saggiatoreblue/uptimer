import { loginSchema, LoginType } from '../validations/auth';
import { Dispatch, useContext, useState } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import {
  FetchResult,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { LOGIN_USER } from '@/queries/auth';
import { showErrorToast } from '@/utils/utils';

import { IUserAuth, IValidationErrors } from '@/interfaces/user.interface';
import { DispatchProps, MonitorContext } from '@/context/MonitorContext';

export const useLogin = (): IUserAuth => {
  const { dispatch } = useContext(MonitorContext);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({
    username: '',
    password: '',
  });

  const router: AppRouterInstance = useRouter();
  const [loginUser, { loading }] = useMutation(LOGIN_USER);
  const onLoginSubmit = async (formData: FormData): Promise<void> => {
    try {
      const resultSchema = loginSchema.safeParse(Object.fromEntries(formData));
      if (!resultSchema.success) {
        setValidationErrors({
          username: resultSchema.error.format().username?._errors[0] || '',
          password: resultSchema.error.format().password?._errors[0] || '',
        });
      } else {
        submitUserData(
          resultSchema.data,
          loginUser,
          dispatch,
          router,
          'email/password'
        );
      }
    } catch (error) {
      //TODO: Add toast method
      console.log(error);
      showErrorToast('Invalid credentials');
    }
  };

  return {
    loading,
    validationErrors,
    setValidationErrors,
    onLoginSubmit,
  };
};

async function submitUserData(
  data: LoginType,
  loginUserMethod: (
    options?: MutationFunctionOptions | undefined
  ) => Promise<FetchResult>,
  dispatch: Dispatch<DispatchProps>,
  router: AppRouterInstance,
  authType: string
) {
  try {
    const variables = authType === 'social' ? { user: data } : data;
    const result: FetchResult = await loginUserMethod({ variables });
    if (result && result.data) {
      const { loginUser, authSocialUser } = result.data;
      dispatch({
        type: 'dataUpdate',
        payload: {
          user: authType === 'social' ? authSocialUser.user : loginUser.user,
          notifications:
            authType === 'social'
              ? authSocialUser.notifications
              : loginUser.notifications,
        },
      });
      router.push('/status');
    }
  } catch (error) {
    console.error(error);
    showErrorToast('Invalid credentials');
  }
}
