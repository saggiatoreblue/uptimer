import { Dispatch, SetStateAction } from 'react';
import { LoginType, RegisterType } from '@/app/(auth)/validations/auth';
import { INotification } from './notification.interface';

export interface InitialUpdateType {
  notifications: INotification[];
  user: IUser | null;
}

export interface IUser {
  __typename?: string;
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  createdAt?: Date;
}

export interface IValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  socialId?: string;
  type?: string;
}

export interface IUserAuth {
  loading: boolean;
  validationErrors?: IValidationErrors;
  setValidationErrors?: Dispatch<SetStateAction<RegisterType | LoginType>>;
  onRegisterSubmit?: (formData: FormData) => void;
  onLoginSubmit?: (formData: FormData) => void;
  authWithGoogle?: () => Promise<void>;
  authWithFacebook?: () => Promise<void>;
}
