import { PredictionResult } from "@shared/schema";

export interface IStorage {
  savePrediction(sessionId: string, result: PredictionResult): Promise<void>;
  getPrediction(sessionId: string): Promise<PredictionResult | null>;
}

export class MemStorage implements IStorage {
  private predictions: Map<string, PredictionResult> = new Map();

  async savePrediction(sessionId: string, result: PredictionResult): Promise<void> {
    this.predictions.set(sessionId, result);
  }

  async getPrediction(sessionId: string): Promise<PredictionResult | null> {
    return this.predictions.get(sessionId) || null;
  }
}

export const storage = new MemStorage();
