import { IMonitorResponse } from "@app/interfaces/monitor.interface";
import { MongoClient } from "mongodb";

export const mongodbPing = async (
  connectionString: string
): Promise<IMonitorResponse> => {
  const startTime: number = Date.now();
  let client;
  try {
    client = await MongoClient.connect(connectionString);
    await client.db().command({ ping: 1 });
    return {
      status: "established",
      responseTime: Date.now() - startTime,
      message: "MongoDB server running",
      code: 200,
    };
  } catch (error) {
    return {
      status: "refused",
      responseTime: Date.now() - startTime,
      message: "MongoDB server is down",
      code: 500,
    };
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        // Optionally log the close error, but don't treat it as a ping failure.
      }
    }
  }
};
