"use client";
import { INotification } from "@/interfaces/notification.interface";
import { InitialUpdateType, IUser } from "@/interfaces/user.interface";
import {
  Context,
  createContext,
  Dispatch,
  FC,
  ReactElement,
  ReactNode,
  useReducer,
} from "react";

export interface StateProps {
  user: IUser | null;
  notifications: INotification[];
}

export interface DispatchProps {
  type: string;
  payload: string | boolean | InitialUpdateType | null;
}

interface Props {
  children: ReactNode;
}

interface MonitorContextType {
  state: StateProps;
  dispatch: Dispatch<DispatchProps>;
}

const initialValues: StateProps = {
  user: null,
  notifications: [],
};

export const MonitorContext: Context<MonitorContextType> =
  createContext<MonitorContextType>({
    state: initialValues,
    dispatch: () => null,
  });

const mainReducer = (state: StateProps, action: DispatchProps): StateProps => ({
  user: stateReducer(state, action).user,
  notifications: stateReducer(state, action).notifications,
});

export const MonitorProvider: FC<Props> = ({ children }): ReactElement => {
  const [state, dispatch] = useReducer(mainReducer, initialValues);

  return (
    <MonitorContext.Provider value={{ state, dispatch }}>
      {children}
    </MonitorContext.Provider>
  );
};

const stateReducer = (state: StateProps, action: DispatchProps): StateProps => {
  switch (action.type) {
    case "dataUpdate": {
      const { notifications, user } = action.payload as InitialUpdateType;
      return { ...state, notifications, user };
    }
    case "user": {
      return { ...state, user: action.payload as IUser };
    }

    default:
      return state;
  }
};
