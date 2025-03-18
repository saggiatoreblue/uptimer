import { INotificationDocument } from "@app/interfaces/notification.interface";
import { IUserDocument, IUserResponse } from "@app/interfaces/user.interface";
import { AppContext } from "@app/server/server";
import {
  createNotificationGroup,
  getAllNotificationGroups,
} from "@app/services/notification.service";
import {
  createNewUser,
  getUserByProp,
  getUserByUsernameOrEmail,
} from "@app/services/user.service";
import { GraphQLError } from "graphql";
import { toLower, upperFirst } from "lodash";
import { sign } from "jsonwebtoken";
import { JWT_TOKEN } from "@app/server/config";
import { Request } from "express";
import { isEmail } from "@app/utils/utils";
import { UserModel } from "@app/models/user.model";

export const UserResolver = {
  Mutation: {
    async loginUser(
      _: undefined,
      args: { username: string; password: string },
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      const { username, password } = args;
      const isValidEmail = isEmail(username);
      const type: string = !isValidEmail ? "username" : "email";
      const existingUser: IUserDocument | undefined = await getUserByProp(
        username,
        type
      );

      if (!existingUser) {
        throw new GraphQLError("Invalid credentials");
      }

      const passwordMatch: boolean = await UserModel.prototype.comparePassword(
        password,
        existingUser.password!
      );

      if (!passwordMatch) {
        throw new GraphQLError("Invalid credentials");
      }

      const response: IUserResponse = await userReturnValue(
        req,
        existingUser,
        "login"
      );
      return response;
    },
    async registerUser(
      _: undefined,
      args: { user: IUserDocument },
      contextValue: AppContext
    ) {
      const { req } = contextValue;
      const { user } = args;
      //TODO: Add data validation
      const { username, email, password } = user;
      const checkIfUserExists: IUserDocument | undefined =
        await getUserByUsernameOrEmail(username!, email!);

      if (checkIfUserExists) {
        throw new GraphQLError("Invalid credentials. Email or username.");
      }

      const authData: IUserDocument = {
        username: upperFirst(username),
        email: toLower(email),
        password,
      } as IUserDocument;

      const result: IUserDocument | undefined = await createNewUser(authData);
      const response: IUserResponse = await userReturnValue(
        req,
        result,
        "register"
      );
      return response;
    },
  },
  User: {
    createdAt: (user: IUserDocument) => new Date(user.createdAt!).toISOString(),
  },
};

async function userReturnValue(
  req: Request,
  result: IUserDocument,
  type: string
): Promise<IUserResponse> {
  let notifications: INotificationDocument[] = [];
  if (type === "register" && result && result.id && result.email) {
    const notification = await createNotificationGroup({
      userId: result.id,
      groupName: "Default Contact Group",
      emails: JSON.stringify([result.email]),
    });
    notifications.push(notification);
  } else if (type === "login" && result && result.id && result.email) {
    notifications = await getAllNotificationGroups(result.id);
  }

  const userJWT: string = sign(
    {
      id: result.id,
      email: result.email,
      username: result.username,
    },
    JWT_TOKEN
  );

  req.session = { jwt: userJWT, enableAutomaticRefresh: false };
  const user: IUserDocument = {
    id: result.id,
    email: result.email,
    username: result.username,
    createdAt: result.createdAt,
  } as IUserDocument;
  return {
    user,
    notifications,
  };
}
