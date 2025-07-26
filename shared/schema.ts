import { z } from "zod";
import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// 预测请求数据结构
export const predictionRequestSchema = z.object({
  // 生辰八字
  year: z.number().min(1950).max(2010),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  
  // 基本信息
  gender: z.enum(["male", "female"]),
  major: z.string().min(1),
  
  // 语言成绩
  testType: z.enum(["toefl", "ielts"]),
  score: z.number().min(0),
  
  // 申请材料水平
  materialLevel: z.enum(["very-poor", "poor", "average", "good", "excellent"])
});

// 命理分析结果
export const fortuneAnalysisSchema = z.object({
  analysis: z.string(),
  fiveElements: z.string().optional(),
  academicFortune: z.string().optional(),
  recommendations: z.string().optional()
});

// 大学预测结果
export const universityPredictionSchema = z.object({
  name: z.string(),
  chineseName: z.string(),
  major: z.string(),
  location: z.string(),
  ranking: z.number().optional(),
  reasons: z.string().optional()
});

// 完整预测结果
export const predictionResultSchema = z.object({
  fortuneAnalysis: fortuneAnalysisSchema,
  universityPredictions: z.array(universityPredictionSchema),
  sessionId: z.string().optional(),
});

export type PredictionRequest = z.infer<typeof predictionRequestSchema>;
export type FortuneAnalysis = z.infer<typeof fortuneAnalysisSchema>;
export type UniversityPrediction = z.infer<typeof universityPredictionSchema>;
export type PredictionResult = z.infer<typeof predictionResultSchema>;

// Database tables
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  predictionData: jsonb("prediction_data").notNull(), // Stores the full PredictionResult
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertPredictionSchema = createInsertSchema(predictions).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
