import { z } from "zod";

// 预测请求数据结构
export const predictionRequestSchema = z.object({
  // 生辰八字
  year: z.number().min(1950).max(2010),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  
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
  admissionProbability: z.number().min(0).max(100),
  location: z.string(),
  ranking: z.number().optional(),
  reasons: z.string().optional()
});

// 完整预测结果
export const predictionResultSchema = z.object({
  fortuneAnalysis: fortuneAnalysisSchema,
  universityPredictions: z.array(universityPredictionSchema)
});

export type PredictionRequest = z.infer<typeof predictionRequestSchema>;
export type FortuneAnalysis = z.infer<typeof fortuneAnalysisSchema>;
export type UniversityPrediction = z.infer<typeof universityPredictionSchema>;
export type PredictionResult = z.infer<typeof predictionResultSchema>;
