import { 
  PredictionResult, 
  predictions, 
  top50Universities,
  top40LiberalArts,
  top30BusinessSchools,
  type InsertPrediction,
  type Top50University,
  type Top40LiberalArts,
  type Top30BusinessSchool
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  savePrediction(sessionId: string, result: PredictionResult): Promise<void>;
  getPrediction(sessionId: string): Promise<PredictionResult | null>;
  getTop50Universities(): Promise<Top50University[]>;
  getTop40LiberalArts(): Promise<Top40LiberalArts[]>;
  getTop30BusinessSchools(): Promise<Top30BusinessSchool[]>;
  getUniversitiesByMajor(major: string): Promise<{
    universities: Top50University[];
    liberalArts: Top40LiberalArts[];
    businessSchools: Top30BusinessSchool[];
  }>;
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

  async getTop50Universities(): Promise<Top50University[]> {
    return await db.select().from(top50Universities).orderBy(top50Universities.ranking);
  }

  async getTop40LiberalArts(): Promise<Top40LiberalArts[]> {
    return await db.select().from(top40LiberalArts).orderBy(top40LiberalArts.ranking);
  }

  async getTop30BusinessSchools(): Promise<Top30BusinessSchool[]> {
    return await db.select().from(top30BusinessSchools).orderBy(top30BusinessSchools.ranking);
  }

  async getUniversitiesByMajor(major: string): Promise<{
    universities: Top50University[];
    liberalArts: Top40LiberalArts[];
    businessSchools: Top30BusinessSchool[];
  }> {
    const [universities, liberalArts, businessSchools] = await Promise.all([
      db.select().from(top50Universities)
        .where(sql`${top50Universities.majors} @> ARRAY[${major}]`)
        .orderBy(top50Universities.ranking),
      db.select().from(top40LiberalArts)
        .where(sql`${top40LiberalArts.majors} @> ARRAY[${major}]`)
        .orderBy(top40LiberalArts.ranking),
      db.select().from(top30BusinessSchools)
        .where(sql`${top30BusinessSchools.businessMajors} @> ARRAY[${major}]`)
        .orderBy(top30BusinessSchools.ranking)
    ]);

    return { universities, liberalArts, businessSchools };
  }
}

export const storage = new DatabaseStorage();
