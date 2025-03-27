import { buildSchema } from "graphql";

export const heartbeatSchema = buildSchema(/* GraphQL */ `
  type HeartBeat {
    id: ID
    monitorId: Int
    status: Int
    code: Int
    message: String
    timestamp: String
    reqHeaders: String
    resHeaders: String
    reqBody: String
    resBody: String
    responseTime: Int
    connection: String
  }

  type HeartBeatResult {
    heartbeats: [HeartBeat]
  }

  type Query {
    getHeartBeats(
      type: String!
      monitorId: Int!
      duration: String!
    ): HeartBeatResult
  }
`);

/* TODO: Make sure monitorId is either a string or an int */
