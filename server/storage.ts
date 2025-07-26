import { PredictionResult, PaymentResult } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  savePrediction(sessionId: string, result: PredictionResult): Promise<void>;
  getPrediction(sessionId: string): Promise<PredictionResult | null>;
  savePayment(sessionId: string, paymentInfo: PaymentResult): Promise<void>;
  getPayment(sessionId: string): Promise<PaymentResult | null>;
  markAsPaid(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private predictions: Map<string, PredictionResult> = new Map();
  private payments: Map<string, PaymentResult> = new Map();

  async savePrediction(sessionId: string, result: PredictionResult): Promise<void> {
    this.predictions.set(sessionId, result);
  }

  async getPrediction(sessionId: string): Promise<PredictionResult | null> {
    return this.predictions.get(sessionId) || null;
  }

  async savePayment(sessionId: string, paymentInfo: PaymentResult): Promise<void> {
    this.payments.set(sessionId, paymentInfo);
  }

  async getPayment(sessionId: string): Promise<PaymentResult | null> {
    return this.payments.get(sessionId) || null;
  }

  async markAsPaid(sessionId: string): Promise<void> {
    const prediction = this.predictions.get(sessionId);
    if (prediction) {
      prediction.isPaid = true;
      this.predictions.set(sessionId, prediction);
    }
  }
}

export const storage = new MemStorage();
