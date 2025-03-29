import { IUserAuth, IValidationErrors } from '@/interfaces/user.interface';
import { registerSchema, RegisterType } from '../validations/auth';
import { Dispatch, useContext, useState } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import {
  FetchResult,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { REGISTER_USER } from '@/queries/auth';
import { showErrorToast } from '@/utils/utils';
import { DispatchProps, MonitorContext } from '@/context/MonitorContext';

export const useRegister = (): IUserAuth => {
  const { dispatch } = useContext(MonitorContext);
  const [validationErrors, setValidationErrors] = useState<IValidationErrors>({
    username: '',
    password: '',
    email: '',
  });

  const router: AppRouterInstance = useRouter();
  const [registerUser, { loading }] = useMutation(REGISTER_USER);
  const onRegisterSubmit = async (formData: FormData): Promise<void> => {
    try {
      const resultSchema = registerSchema.safeParse(
        Object.fromEntries(formData)
      );
      if (!resultSchema.success) {
        setValidationErrors({
          username: resultSchema.error.format().username?._errors[0] || '',
          email: resultSchema.error.format().email?._errors[0] || '',
          password: resultSchema.error.format().password?._errors[0] || '',
        });
      } else {
        submitUserData(resultSchema.data, registerUser, dispatch, router);
      }
    } catch (error) {
      console.error(error);
      showErrorToast('Invalid credentials');
    }
  };

  return {
    loading,
    validationErrors,
    setValidationErrors,
    onRegisterSubmit,
  };
};

async function submitUserData(
  data: RegisterType,
  registerUserMethod: (
    options?: MutationFunctionOptions | undefined
  ) => Promise<FetchResult>,
  dispatch: Dispatch<DispatchProps>,
  router: AppRouterInstance
) {
  try {
    const result: FetchResult = await registerUserMethod({
      variables: { user: data },
    });
    if (result && result.data) {
      const { registerUser, authSocialUser } = result.data;
      dispatch({
        type: 'dataUpdate',
        payload: {
          user: registerUser ? registerUser.user : authSocialUser.user,
          notifications: registerUser
            ? registerUser.notifications
            : authSocialUser.notifications,
        },
      });
      router.push('/status');
    }
  } catch (error) {
    console.error(error);
    showErrorToast('Invalid credentials');
  }
}
