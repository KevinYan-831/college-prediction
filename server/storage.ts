import { PredictionResult, predictions, type InsertPrediction } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  savePrediction(sessionId: string, result: PredictionResult): Promise<void>;
  getPrediction(sessionId: string): Promise<PredictionResult | null>;
}

export class DatabaseStorage implements IStorage {
  async savePrediction(sessionId: string, result: PredictionResult): Promise<void> {
    const insertData: InsertPrediction = {
      sessionId,
      predictionData: result,
    };

    await db
      .insert(predictions)
      .values(insertData)
      .onConflictDoUpdate({
        target: predictions.sessionId,
        set: {
          predictionData: result,
        },
      });
  }

  async getPrediction(sessionId: string): Promise<PredictionResult | null> {
    const [prediction] = await db
      .select()
      .from(predictions)
      .where(eq(predictions.sessionId, sessionId));

    return prediction ? (prediction.predictionData as PredictionResult) : null;
  }
}

export const storage = new DatabaseStorage();
