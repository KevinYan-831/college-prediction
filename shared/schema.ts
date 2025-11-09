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
  
  // 心仪院校列表
  dreamUniversities: z.array(z.string()).min(1).max(20)
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
  reasons: z.string().optional(),
  admissionProbability: z.string().optional(),
  specialNote: z.string().optional()
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

// Top 50 Universities table
export const top50Universities = pgTable("top50_universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chineseName: text("chinese_name").notNull(),
  ranking: integer("ranking").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  acceptanceRate: text("acceptance_rate"),
  avgSAT: text("avg_sat"),
  avgACT: text("avg_act"),
  tuition: text("tuition"),
  majors: text("majors").array().default([]),
});

// Top 40 Liberal Arts Colleges table
export const top40LiberalArts = pgTable("top40_liberal_arts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chineseName: text("chinese_name").notNull(),
  ranking: integer("ranking").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  acceptanceRate: text("acceptance_rate"),
  avgSAT: text("avg_sat"),
  avgACT: text("avg_act"),
  tuition: text("tuition"),
  majors: text("majors").array().default([]),
});

// Top 30 Undergraduate Business Schools table
export const top30BusinessSchools = pgTable("top30_business_schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chineseName: text("chinese_name").notNull(),
  ranking: integer("ranking").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  acceptanceRate: text("acceptance_rate"),
  avgSAT: text("avg_sat"),
  avgACT: text("avg_act"),
  tuition: text("tuition"),
  businessMajors: text("business_majors").array().default([]),
});

// Insert schemas
export const insertPredictionSchema = createInsertSchema(predictions).omit({ 
  id: true, 
  createdAt: true 
});

export const insertTop50UniversitySchema = createInsertSchema(top50Universities).omit({ 
  id: true 
});

export const insertTop40LiberalArtsSchema = createInsertSchema(top40LiberalArts).omit({ 
  id: true 
});

export const insertTop30BusinessSchoolSchema = createInsertSchema(top30BusinessSchools).omit({ 
  id: true 
});

// Types
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type Top50University = typeof top50Universities.$inferSelect;
export type InsertTop50University = z.infer<typeof insertTop50UniversitySchema>;

export type Top40LiberalArts = typeof top40LiberalArts.$inferSelect;
export type InsertTop40LiberalArts = z.infer<typeof insertTop40LiberalArtsSchema>;

export type Top30BusinessSchool = typeof top30BusinessSchools.$inferSelect;
export type InsertTop30BusinessSchool = z.infer<typeof insertTop30BusinessSchoolSchema>;
