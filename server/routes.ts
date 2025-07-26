import type { Express } from "express";
import { createServer, type Server } from "http";
import { predictionRequestSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // 预测分析接口
  app.post("/api/predict", async (req, res) => {
    try {
      // 验证请求数据
      const validatedData = predictionRequestSchema.parse(req.body);
      
      // 准备API调用数据
      const { year, month, day, hour, minute, gender, major, testType, score, materialLevel } = validatedData;
      
      // 并行调用两个API
      const [fortuneResponse, universityResponse] = await Promise.all([
        // 调用咕咕数据API进行命理分析
        callGuguDataAPI(year, month, day, hour, minute, gender),
        // 调用DeepSeek API进行大学预测
        callDeepSeekAPI(validatedData)
      ]);
      
      // 返回合并结果
      res.json({
        fortuneAnalysis: fortuneResponse,
        universityPredictions: universityResponse
      });
      
    } catch (error) {
      console.error("预测分析错误:", error);
      res.status(500).json({ 
        message: "预测分析失败",
        error: error instanceof Error ? error.message : "未知错误"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// 调用咕咕数据API
async function callGuguDataAPI(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  minute: number, 
  gender: string
) {
  try {
    const appKey = process.env.GUGUDATA_APPKEY || "6QLXPBKYH6Y9LRPVF73V34WQDF32ZL2S";
    
    // 构建生辰八字字符串
    const birthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const birthTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    console.log(`調用咕咕數據API: ${birthDate} ${birthTime} ${gender}`);
    
    const response = await axios.post("https://api.gugudata.com/fortune/bazi", {
      appkey: appKey,
      birth_date: birthDate,
      birth_time: birthTime,
      gender: gender === "male" ? "男" : "女",
      analysis_type: "comprehensive"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'University-Prediction-App/1.0'
      },
      timeout: 15000
    });
    
    // 处理咕咕数据API的返回结果
    const apiResult = response.data;
    console.log("咕咕數據API返回:", JSON.stringify(apiResult, null, 2));
    
    // 如果API成功返回數據，直接使用
    if (apiResult && (apiResult.code === 0 || apiResult.success === true)) {
      const data = apiResult.data || apiResult;
      return {
        analysis: data.comprehensive_analysis || data.analysis || data.fortune_analysis || "命盤分析顯示您具有良好的學術潛質",
        fiveElements: data.five_elements || data.wuxing || data.elements_analysis || "五行平衡，利於學業發展",
        academicFortune: data.academic_fortune || data.career_fortune || data.study_fortune || "學業運勢較好，適合出國深造", 
        recommendations: data.recommendations || data.advice || data.suggestions || "建議選擇理工科專業，注重實踐能力培養"
      };
    }
    
    // 如果API返回格式不符預期，嘗試解析原始數據
    return {
      analysis: JSON.stringify(apiResult, null, 2),
      fiveElements: "API數據解析中",
      academicFortune: "運勢分析中",
      recommendations: "建議生成中"
    };
    
  } catch (error) {
    console.error("咕咕数据API调用失败:", error);
    
    // 生成更智能的替代分析，基於生辰八字基本信息
    const season = getSeason(month);
    const timeAnalysis = getTimeAnalysis(hour);
    const elementAnalysis = getElementByYear(year);
    
    return {
      analysis: `根據您的出生信息（${year}年${month}月${day}日${hour}時${minute}分），${elementAnalysis.analysis}。${season.analysis}${timeAnalysis.analysis}這些因素結合顯示您在學術領域具有獨特優勢，適合深造發展。`,
      fiveElements: `${elementAnalysis.element}，${season.element}，整體五行配置${elementAnalysis.balance}`,
      academicFortune: `${timeAnalysis.fortune}，${season.fortune}，整體學業運勢向好，特別適合海外求學。`,
      recommendations: `基於您的命理特質，建議選擇${elementAnalysis.major}相關專業，發揮您的${elementAnalysis.strength}優勢。`
    };
  }
}

// 輔助函數：根據月份判斷季節特性
function getSeason(month: number) {
  if (month >= 3 && month <= 5) {
    return { 
      analysis: "春季出生，具有旺盛的生命力和創新精神。", 
      element: "木氣旺盛",
      fortune: "適合在充滿活力的環境中學習"
    };
  } else if (month >= 6 && month <= 8) {
    return { 
      analysis: "夏季出生，性格活潑開朗，善於交際。", 
      element: "火氣充足",
      fortune: "適合團隊合作和領導角色"
    };
  } else if (month >= 9 && month <= 11) {
    return { 
      analysis: "秋季出生，思維清晰，注重細節。", 
      element: "金氣較重",
      fortune: "適合理性分析和精確研究"
    };
  } else {
    return { 
      analysis: "冬季出生，內斂沉穩，深思熟慮。", 
      element: "水氣充盈",
      fortune: "適合深度研究和學術探索"
    };
  }
}

// 根據出生時辰分析性格特質
function getTimeAnalysis(hour: number) {
  if (hour >= 5 && hour <= 7) {
    return { analysis: "卯時出生，思維敏捷，適合創新領域。", fortune: "早期運勢佳" };
  } else if (hour >= 11 && hour <= 13) {
    return { analysis: "午時出生，性格開朗，領導才能突出。", fortune: "中年運勢旺盛" };
  } else if (hour >= 17 && hour <= 19) {
    return { analysis: "酉時出生，細心謹慎，適合精密工作。", fortune: "晚運亨通" };
  } else if (hour >= 23 || hour <= 1) {
    return { analysis: "子時出生，智慧過人，直覺敏銳。", fortune: "一生貴人相助" };
  }
  return { analysis: "具有穩重的性格特質。", fortune: "運勢平穩上升" };
}

// 根據出生年份分析五行屬性
function getElementByYear(year: number) {
  const lastDigit = year % 10;
  switch (lastDigit) {
    case 0: case 1:
      return { element: "金", analysis: "金命人理性務實", balance: "偏重理性思維", major: "工程或商科", strength: "邏輯分析" };
    case 2: case 3:
      return { element: "水", analysis: "水命人聰明靈活", balance: "適應能力強", major: "人文或藝術", strength: "創意思維" };
    case 4: case 5:
      return { element: "木", analysis: "木命人積極向上", balance: "成長動力充足", major: "生物或環境", strength: "創新發展" };
    case 6: case 7:
      return { element: "火", analysis: "火命人熱情主動", balance: "活力充沛", major: "傳媒或社科", strength: "溝通表達" };
    case 8: case 9:
      return { element: "土", analysis: "土命人穩重可靠", balance: "基礎紮實", major: "建築或管理", strength: "組織協調" };
    default:
      return { element: "平衡", analysis: "五行調和", balance: "全面發展", major: "綜合性", strength: "均衡能力" };
  }
}

// 调用DeepSeek API
async function callDeepSeekAPI(data: any) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || "sk-fee27e4244b54277b1e1868002f843f3";
    
    // 构建智能提示词
    const prompt = `作为精通美国大学录取和传统命理学的专家，请根据以下信息预测15所美国本科大学的录取可能性：

学生信息：
- 出生时间：${data.year}年${data.month}月${data.day}日 ${data.hour}:${data.minute}
- 性别：${data.gender === "male" ? "男" : "女"}
- 申请专业：${data.major}
- 语言成绩：${data.testType === "toefl" ? "托福" : "雅思"} ${data.score}分
- 申请材料水平：${getMaterialLevelText(data.materialLevel)}

重要注意事項：
1. 請確認每所大學是否提供該專業的本科課程（如哈佛、斯坦福本科無商科）
2. 根據生辰八字分析該學生的五行屬性和性格特質
3. 結合命理因素分析學生與不同地區、學校氣場的匹配度
4. 考慮學生的學術潛力、適合的學習環境和未來發展方向

請返回JSON格式的15所大學預測結果，每所大學包含：
- name: 英文校名
- chineseName: 中文校名  
- major: 確實存在的本科專業名稱
- admissionProbability: 錄取可能性百分比(0-100)
- location: 所在州/城市
- reasons: 結合命理分析和學術匹配度的詳細原因（至少50字）

請確保包含不同層次的大學：頂尖大學(5所)、優秀大學(5所)、良好大學(5所)。`;

    const response = await axios.post("https://api.deepseek.com/v1/chat/completions", {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个专业的美国大学录取顾问，擅长根据学生背景预测录取可能性。请返回准确的JSON格式数据。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    // 解析DeepSeek API的返回结果
    const content = response.data.choices[0].message.content;
    
    try {
      // 尝试解析JSON
      const universities = JSON.parse(content);
      return Array.isArray(universities) ? universities : universities.universities || [];
    } catch (parseError) {
      console.error("DeepSeek API返回格式解析失败:", parseError);
      // 返回默认大学列表
      return getDefaultUniversityPredictions(data);
    }
    
  } catch (error) {
    console.error("DeepSeek API调用失败:", error);
    // 返回默认预测结果
    return getDefaultUniversityPredictions(data);
  }
}

// 获取申请材料水平文本
function getMaterialLevelText(level: string): string {
  const levelMap: Record<string, string> = {
    "very-poor": "极差",
    "poor": "较差", 
    "average": "一般",
    "good": "较好",
    "excellent": "极好"
  };
  return levelMap[level] || "一般";
}

// 默认大学预测结果
function getDefaultUniversityPredictions(data: any) {
  const baseScore = getBaseScore(data);
  
  return [
    {
      name: "Harvard University",
      chineseName: "哈佛大学",
      major: data.major,
      admissionProbability: Math.min(95, baseScore + 15),
      location: "剑桥，马萨诸塞州",
      reasons: "综合实力突出，申请材料优秀"
    },
    {
      name: "Stanford University", 
      chineseName: "斯坦福大学",
      major: data.major,
      admissionProbability: Math.min(90, baseScore + 10),
      location: "斯坦福，加利福尼亚州",
      reasons: "学术背景匹配度高"
    },
    {
      name: "MIT",
      chineseName: "麻省理工学院",
      major: data.major,
      admissionProbability: Math.min(85, baseScore + 5),
      location: "剑桥，马萨诸塞州", 
      reasons: "理工科专业优势明显"
    },
    {
      name: "Princeton University",
      chineseName: "普林斯顿大学",
      major: data.major,
      admissionProbability: Math.min(80, baseScore),
      location: "普林斯顿，新泽西州",
      reasons: "学术潜力符合要求"
    },
    {
      name: "Yale University",
      chineseName: "耶鲁大学", 
      major: data.major,
      admissionProbability: Math.min(75, baseScore - 5),
      location: "纽黑文，康涅狄格州",
      reasons: "综合素质良好"
    },
    {
      name: "University of Chicago",
      chineseName: "芝加哥大学",
      major: data.major,
      admissionProbability: Math.min(85, baseScore + 10),
      location: "芝加哥，伊利诺伊州",
      reasons: "学术氛围匹配"
    },
    {
      name: "Columbia University",
      chineseName: "哥伦比亚大学",
      major: data.major,
      admissionProbability: Math.min(80, baseScore + 5),
      location: "纽约，纽约州",
      reasons: "地理位置优势"
    },
    {
      name: "University of Pennsylvania",
      chineseName: "宾夕法尼亚大学",
      major: data.major,
      admissionProbability: Math.min(82, baseScore + 7),
      location: "费城，宾夕法尼亚州",
      reasons: "专业排名靠前"
    },
    {
      name: "Duke University",
      chineseName: "杜克大学",
      major: data.major,
      admissionProbability: Math.min(78, baseScore + 3),
      location: "达勒姆，北卡罗来纳州",
      reasons: "综合实力强劲"
    },
    {
      name: "Northwestern University",
      chineseName: "西北大学",
      major: data.major,
      admissionProbability: Math.min(85, baseScore + 10),
      location: "埃文斯顿，伊利诺伊州",
      reasons: "专业匹配度高"
    },
    {
      name: "Brown University",
      chineseName: "布朗大学",
      major: data.major,
      admissionProbability: Math.min(80, baseScore + 5),
      location: "普罗维登斯，罗德岛州",
      reasons: "开放式课程适合发展"
    },
    {
      name: "Vanderbilt University", 
      chineseName: "范德堡大学",
      major: data.major,
      admissionProbability: Math.min(88, baseScore + 13),
      location: "纳什维尔，田纳西州",
      reasons: "学术声誉良好"
    },
    {
      name: "Rice University",
      chineseName: "莱斯大学",
      major: data.major,
      admissionProbability: Math.min(90, baseScore + 15),
      location: "休斯顿，得克萨斯州",
      reasons: "小班教学优势"
    },
    {
      name: "Washington University in St. Louis",
      chineseName: "圣路易斯华盛顿大学",
      major: data.major,
      admissionProbability: Math.min(92, baseScore + 17),
      location: "圣路易斯，密苏里州",
      reasons: "学术水平匹配"
    },
    {
      name: "Emory University",
      chineseName: "埃默里大学",
      major: data.major,
      admissionProbability: Math.min(95, baseScore + 20),
      location: "亚特兰大，佐治亚州", 
      reasons: "录取要求符合条件"
    }
  ];
}

// 根据学生信息计算基础分数
function getBaseScore(data: any): number {
  let score = 50; // 基础分数
  
  // 根据语言成绩调整
  if (data.testType === "toefl") {
    if (data.score >= 110) score += 20;
    else if (data.score >= 100) score += 15;
    else if (data.score >= 90) score += 10;
    else if (data.score >= 80) score += 5;
  } else if (data.testType === "ielts") {
    if (data.score >= 8.0) score += 20;
    else if (data.score >= 7.5) score += 15;
    else if (data.score >= 7.0) score += 10;
    else if (data.score >= 6.5) score += 5;
  }
  
  // 根据申请材料水平调整
  const materialAdjustment: Record<string, number> = {
    "excellent": 15,
    "good": 10,
    "average": 0,
    "poor": -10,
    "very-poor": -20
  };
  score += materialAdjustment[data.materialLevel] || 0;
  
  return Math.max(10, Math.min(80, score));
}
