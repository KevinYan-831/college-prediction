import type { Express } from "express";
import { createServer, type Server } from "http";
import { predictionRequestSchema, type PredictionRequest } from "@shared/schema";
import axios from "axios";
import { getUniversitiesByLevel } from "./university-rankings";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // 预测分析接口
  app.post("/api/predict", async (req, res) => {
    try {
      // 验证请求数据
      const validatedData = predictionRequestSchema.parse(req.body);
      
      // 准备API调用数据
      const { year, month, day, hour, minute, gender, major, dreamUniversities } = validatedData;
      
      // 独立调用两个API
      let fortuneResponse;
      let universityResponse;
      let fortuneError = null;
      
      // 并行调用但独立处理错误
      const [fortuneResult, universityResult] = await Promise.allSettled([
        callGuguDataAPI(year, month, day, hour, minute, gender, major),
        callDeepSeekAPI(validatedData)
      ]);
      
      // 处理命理分析结果
      if (fortuneResult.status === 'fulfilled') {
        fortuneResponse = fortuneResult.value;
        console.log("GuguData API调用成功");
      } else {
        fortuneError = fortuneResult.reason;
        console.error("GuguData API失败:", fortuneError.message);
      }
      
      // 处理大学预测结果
      if (universityResult.status === 'fulfilled') {
        universityResponse = universityResult.value;
        console.log("DeepSeek API调用成功");
      } else {
        console.error("DeepSeek API失败:", universityResult.reason.message);
        throw new Error("大学预测API调用失败");
      }
      
      const sessionId = randomUUID();
      
      // 如果命理分析失败，提供错误信息
      if (fortuneError) {
        const errorResult = {
          fortuneAnalysis: {
            analysis: "命理分析暂时无法获取，GuguData API调用超时。",
            fiveElements: "API服务暂不可用",
            academicFortune: "暂无法提供命理建议",
            recommendations: "请稍后重试或联系客服"
          },
          universityPredictions: universityResponse || [],
          sessionId,
          error: "GuguData API调用失败：" + fortuneError.message
        };
        
        // 保存结果到存储
        await storage.savePrediction(sessionId, errorResult);
        
        return res.status(200).json(errorResult);
      }
      
      // 正常返回合并结果
      const result = {
        fortuneAnalysis: fortuneResponse || {
          analysis: "命理分析暂时无法获取",
          fiveElements: "暂无",
          academicFortune: "暂无",
          recommendations: "暂无"
        },
        universityPredictions: universityResponse || [],
        sessionId
      };
      
      // 保存结果到存储
      await storage.savePrediction(sessionId, result);
      
      res.json(result);
      
    } catch (error) {
      console.error("预测分析错误:", error);
      res.status(500).json({ 
        message: "预测分析失败",
        error: error instanceof Error ? error.message : "未知错误"
      });
    }
  });



  // 获取预测结果
  app.get("/api/prediction/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await storage.getPrediction(sessionId);
      
      if (!result) {
        return res.status(404).json({ error: "未找到预测结果" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("获取预测结果失败:", error);
      res.status(500).json({ error: "获取结果失败" });
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
  gender: string,
  major: string = ''
) {
  try {
    const appKey = process.env.GUGUDATA_APPKEY || "6QLXPBKYH6Y9LRPVF73V34WQDF32ZL2S";
    
    // 构建生辰八字字符串 - 使用中文格式
    const birthDate = `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`;
    
    // 将24小时制转换为中文时间表达
    let timeDescription = "";
    if (hour >= 0 && hour < 6) {
      timeDescription = `凌晨${hour === 0 ? 12 : hour}点${minute > 0 ? minute + '分' : ''}`;
    } else if (hour >= 6 && hour < 12) {
      timeDescription = `上午${hour === 0 ? 12 : hour}点${minute > 0 ? minute + '分' : ''}`;
    } else if (hour === 12) {
      timeDescription = `中午12点${minute > 0 ? minute + '分' : ''}`;
    } else if (hour > 12 && hour < 18) {
      timeDescription = `下午${hour - 12}点${minute > 0 ? minute + '分' : ''}`;
    } else if (hour >= 18 && hour < 24) {
      timeDescription = `晚上${hour - 12}点${minute > 0 ? minute + '分' : ''}`;
    }
    
    const userinfo = `我是${gender === "male" ? "男性" : "女性"}，我的公历出生日期是${birthDate}，出生时间是${timeDescription}。`;
    
    console.log(`调用咕咕数据API: ${birthDate} ${timeDescription} ${gender}`);
    console.log(`userinfo参数: ${userinfo}`);
    console.log(`API Key: ${appKey}`);
    
    // 按照GuguData API文档要求，使用form格式提交
    const formData = new URLSearchParams();
    formData.append('userinfo', userinfo);
    
    const response = await axios.post(`https://api.gugudata.com/ai/bazi-fortune-teller?appkey=${appKey}`, 
      formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'University-Prediction-App/1.0'
      },
      timeout: 120000 // 120秒超时，API需要90+秒处理时间
    });
    
    // 处理咕咕数据API的返回结果
    const apiResult = response.data;
    console.log("咕咕数据API返回:", JSON.stringify(apiResult, null, 2));
    
    // 如果API成功返回数据，直接使用
    // 首先尝试检查不同的成功状态码
    if (apiResult && (
      (apiResult.DataStatus && apiResult.DataStatus.StatusCode === 100) ||
      (apiResult.code === 200 && apiResult.data) ||
      (apiResult.status === 'success') ||
      (apiResult.result && apiResult.result.length > 0)
    )) {
      // 尝试从不同的响应格式中提取数据
      let data, analysis;
      
      if (apiResult.DataStatus && apiResult.DataStatus.StatusCode === 100) {
        // GuguData API标准格式 - 根据API文档解析
        data = apiResult.Data;
        console.log("提取的完整数据:", JSON.stringify(data, null, 2));
        
        // 直接使用完整的融合分析文字作为主要内容，避免字段匹配问题
        const mainAnalysis = data.融合分析文字 || '';
        const fortuneAnalysis = data.运势分析 || {};
        const bodyFeatures = fortuneAnalysis.体貌特征 || {};

        // 口语化处理
        const casualAnalysis = mainAnalysis
          .replace(/您的/g, '你的')
          .replace(/您/g, '你')
          .replace(/建议/g, '我建议')
          .replace(/需注意/g, '要注意')
          .replace(/需要/g, '要')
          .replace(/应当/g, '应该')
          .replace(/宜/g, '最好')
          .replace(/忌/g, '避免');

        return {
          analysis: casualAnalysis || `【体貌特征】
面貌：${bodyFeatures.面貌 || ''}
身材：${bodyFeatures.身材 || ''}
特别标记：${bodyFeatures.特别标记 || ''}

【学业运势】
${fortuneAnalysis.学业?.关键转折 || ''}

【婚姻感情】
${fortuneAnalysis.婚姻?.婚期 || ''}

【财运状况】
${fortuneAnalysis.财运?.赚钱能力 || ''}

【健康状况】
${fortuneAnalysis.健康?.薄弱部位 || ''}

【综合评价】
${data.综合评价 || ''}`,
          
          fiveElements: `八字：${data.八字 || ''}
五行：${typeof data.五行 === 'object' ? 
  `金${data.五行.金 || 0} 木${data.五行.木 || 0} 水${data.五行.水 || 0} 火${data.五行.火 || 0} 土${data.五行.土 || 0}，${data.五行.强弱 || ''}，${data.五行.喜忌 || ''}` : 
  data.五行 || ''}
命宫：${data.命宫 || ''}
身宫：${data.身宫 || ''}
十神配置：年柱${data.十神?.年柱 || ''}，月柱${data.十神?.月柱 || ''}，日柱${data.十神?.日柱 || ''}，时柱${data.十神?.时柱 || ''}`,
          
          academicFortune: `${fortuneAnalysis.学业?.关键阶段 || ''}
${fortuneAnalysis.学业?.优势 || ''}
${fortuneAnalysis.学业?.短板 || ''}
${fortuneAnalysis.学业?.转折点 || ''}`.trim() || '学业运势分析中',
          
          recommendations: `【大运分析】
${data.大运 && Array.isArray(data.大运) ? 
  data.大运.map((stage: any) => 
    `${stage.起始年份}-${stage.终止年份}年：${stage.运势名称}`
  ).join('\n') : ''}

【重要转折点】
${fortuneAnalysis.关键事件 && Array.isArray(fortuneAnalysis.关键事件) ?
  fortuneAnalysis.关键事件.map((event: any) => `${event.年份}年：${event.事件}`).join('\n') : ''}

【学业建议】
优势：${fortuneAnalysis.学业?.优势 || ''}
短板：${fortuneAnalysis.学业?.短板 || ''}

【婚姻建议】
最佳婚期：${fortuneAnalysis.婚姻?.婚期 || ''}
配偶特征：${fortuneAnalysis.婚姻?.配偶特征 || ''}

【财运建议】
财富等级：${fortuneAnalysis.财运?.财富等级 || ''}
适合行业：${fortuneAnalysis.财运?.行业建议 || ''}

【综合建议】
${data.综合评价 || ''}`
        };
      } else if (apiResult.code === 200 && apiResult.data) {
        // 备选格式1
        data = apiResult.data;
        analysis = data?.analysis || data?.分析 || {};
      } else if (apiResult.result) {
        // 备选格式2
        data = apiResult.result;
        analysis = data?.analysis || data?.分析 || {};
      } else {
        // 直接使用整个响应作为数据
        data = apiResult;
        analysis = apiResult?.analysis || apiResult?.分析 || {};
      }
      
      console.log("提取的数据:", JSON.stringify(data, null, 2));
      console.log("提取的分析:", JSON.stringify(analysis, null, 2));
      
      return {
        analysis: `【八字命盘】
八字：${data.八字 || ''}
五行：${data.五行 || ''}

【体貌特征】
${analysis.体貌特征 || '暂无体貌特征分析'}

【学业运势】
${analysis.学业 || '暂无学业分析'}

【事业发展】
${analysis.事业 || '暂无事业分析'}

【财运状况】
${analysis.财运 || '暂无财运分析'}

【婚姻感情】
${analysis.婚姻 || '暂无婚姻分析'}

【健康状况】
${analysis.健康 || '暂无健康分析'}

【总体评价】
${analysis.总体评价 || '命盘分析显示您具有良好的发展潜质'}`,
        
        fiveElements: `五行配置：${data.五行 || ''}
${data.十神 ? `十神配置：年柱${data.十神.年柱}，月柱${data.十神.月柱}，日柱${data.十神.日柱}，时柱${data.十神.时柱}` : ''}`,
        
        academicFortune: analysis.学业 || "学业运势分析中",
        
        recommendations: `${data.大运 && data.大运.length > 0 ? 
`【大运分析】
当前大运：${data.大运.find((d: any) => {
  const [start, end] = d.年份.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  return currentYear >= start && currentYear <= end;
})?.大运 || '分析中'} (${data.大运.find((d: any) => {
  const [start, end] = d.年份.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  return currentYear >= start && currentYear <= end;
})?.十神 || ''})

未来十年大运趋势：
${data.大运.slice(0, 3).map((d: any) => `${d.年份}: ${d.大运} (${d.十神})`).join('\n')}` : '暂无大运分析'}`
      };
    }
    
    // 如果API返回格式不符预期，显示详细的调试信息
    console.log("咕咕数据API调用失败，完整返回:", JSON.stringify(apiResult, null, 2));
    
    return {
      analysis: `【API调用状态】
状态码：${apiResult?.DataStatus?.StatusCode || 'N/A'}
状态描述：${apiResult?.DataStatus?.StatusDescription || '未知错误'}
请求参数：${apiResult?.DataStatus?.RequestParameter || ''}

【调试信息】
完整API返回数据：
${JSON.stringify(apiResult, null, 2)}

【临时分析】
基于您的出生信息进行基础分析...`,
      fiveElements: `API调用状态码：${apiResult?.DataStatus?.StatusCode || 'N/A'}`,
      academicFortune: "API调用异常，请检查咕咕数据服务",
      recommendations: "请联系技术支持检查API配置"
    };
    
  } catch (error) {
    console.error("咕咕数据API调用失败:", error);
    throw error; // 直接抛出原始错误
  }
}

// 辅助函数：根据月份判断季节特性
function getSeason(month: number) {
  if (month >= 3 && month <= 5) {
    return { 
      analysis: "春季出生，具有旺盛的生命力和创新精神。", 
      element: "木气旺盛",
      fortune: "适合在充满活力的环境中学习"
    };
  } else if (month >= 6 && month <= 8) {
    return { 
      analysis: "夏季出生，性格活泼开朗，善于交际。", 
      element: "火气充足",
      fortune: "适合团队合作和领导角色"
    };
  } else if (month >= 9 && month <= 11) {
    return { 
      analysis: "秋季出生，思维清晰，注重细节。", 
      element: "金气较重",
      fortune: "适合理性分析和精确研究"
    };
  } else {
    return { 
      analysis: "冬季出生，内敛沉稳，深思熟虑。", 
      element: "水气充盈",
      fortune: "适合深度研究和学术探索"
    };
  }
}

// 根据出生时辰分析性格特质
function getTimeAnalysis(hour: number) {
  if (hour >= 5 && hour <= 7) {
    return { analysis: "卯时出生，思维敏捷，适合创新领域。", fortune: "早期运势佳" };
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
function getElementByDateTime(year: number, month: number, day: number, hour: number) {
  // 更复杂的算法，基于年月日时的组合
  const yearElement = year % 5;
  const monthElement = month % 5;
  const dayElement = day % 5;
  const hourElement = hour % 5;
  
  // 组合计算得出主要五行
  const totalScore = (yearElement * 1000 + monthElement * 100 + dayElement * 10 + hourElement) % 5;
  
  // 根据月份调整，加入季节因素
  let seasonalAdjustment = 0;
  if (month >= 3 && month <= 5) seasonalAdjustment = 1; // 春季，木旺
  else if (month >= 6 && month <= 8) seasonalAdjustment = 2; // 夏季，火旺
  else if (month >= 9 && month <= 11) seasonalAdjustment = 3; // 秋季，金旺
  else seasonalAdjustment = 4; // 冬季，水旺
  
  const finalElement = (totalScore + seasonalAdjustment) % 5;
  
  const elements = [
    { 
      element: "金", 
      analysis: "金命人理性務實，思維清晰，善於分析", 
      balance: "偏重理性思維，邏輯性強", 
      major: "工程、法律或商科", 
      strength: "邏輯分析和精確判斷",
      personality: "性格堅毅，做事有條理",
      fiveElementsDetail: "金氣充足，具有領導才能和決策能力"
    },
    { 
      element: "水", 
      analysis: "水命人聰明靈活，適應力強，智慧過人", 
      balance: "適應能力極強，思維活躍", 
      major: "人文、藝術或心理學", 
      strength: "創意思維和靈活變通",
      personality: "性格溫和，善於溝通",
      fiveElementsDetail: "水氣旺盛，具有包容性和洞察力"
    },
    { 
      element: "木", 
      analysis: "木命人積極向上，生命力旺盛，創新能力強", 
      balance: "成長動力充足，發展潛力大", 
      major: "生物、環境或教育", 
      strength: "創新發展和持續成長",
      personality: "性格開朗，富有朝氣",
      fiveElementsDetail: "木氣勃發，具有強烈的進取心和創造力"
    },
    { 
      element: "火", 
      analysis: "火命人熱情主動，充滿活力，表達能力強", 
      balance: "活力充沛，感染力強", 
      major: "傳媒、表演或社會科學", 
      strength: "溝通表達和團隊領導",
      personality: "性格外向，善於激勵他人",
      fiveElementsDetail: "火氣旺盛，具有熱情和創造性思維"
    },
    { 
      element: "土", 
      analysis: "土命人穩重可靠，基礎紮實，責任心強", 
      balance: "基礎紮實，踏實穩健", 
      major: "建築、管理或農業", 
      strength: "組織協調和穩定發展",
      personality: "性格務實，值得信賴",
      fiveElementsDetail: "土氣厚重，具有很強的組織能力和責任感"
    }
  ];
  
  return elements[finalElement];
}

// 根據專業和五行元素分析專業適配性
function getMajorAnalysis(major: string, elementAnalysis: any) {
  const majorLower = major.toLowerCase();
  
  if (majorLower.includes('计算机') || majorLower.includes('computer')) {
    return {
      compatibility: "特别适合在计算机科学和技术创新领域发展",
      careerPath: "适合在科技行业和软件开发领域发展",
      suitability: "计算机科学领域特别适合您的发展",
      recommendation: "强烈建议选择计算机科学相关专业",
      advice: "您在编程逻辑和算法思维方面具有天赋"
    };
  } else if (majorLower.includes('环境') || majorLower.includes('environmental')) {
    return {
      compatibility: "特别适合在环境科学和生态保护领域发展",
      careerPath: "适合在环保机构、研究院所或可持续发展领域工作",
      suitability: "环境科学领域与您的命理特质高度契合",
      recommendation: "环境科学专业非常适合您的发展方向",
      advice: "您在环境保护和可持续发展方面有独特的见解和使命感"
    };
  } else if (majorLower.includes('商') || majorLower.includes('business') || majorLower.includes('经济') || majorLower.includes('finance')) {
    return {
      compatibility: "特别适合在商科和金融领域发展",
      careerPath: "适合在金融机构、咨询公司或创业领域发展",
      suitability: "商科领域能够充分发挥您的才能",
      recommendation: "商科专业能够发挥您的领导才能",
      advice: "您在商业分析和财务规划方面具有敏锐的洞察力"
    };
  } else if (majorLower.includes('工程') || majorLower.includes('engineering')) {
    return {
      compatibility: "特别适合在工程技术和创新设计领域发展",
      careerPath: "适合在工程技术、产品设计或技术研发领域工作",
      suitability: "工程领域能够发挥您的技术创新能力",
      recommendation: "工程专业与您的理性思维高度匹配",
      advice: "您在技术创新和工程设计方面具有出色的天赋"
    };
  } else if (majorLower.includes('医') || majorLower.includes('medical') || majorLower.includes('生物') || majorLower.includes('biology')) {
    return {
      compatibility: "特别适合在医学和生物科学领域发展",
      careerPath: "适合在医疗机构、生物技术公司或医学研究领域工作",
      suitability: "医学生物领域与您的细致认真特质相符",
      recommendation: "医学或生物科学专业适合您的发展",
      advice: "您在医疗服务和生命科学研究方面有特殊的使命感"
    };
  } else {
    return {
      compatibility: `特别适合在${major}领域发展`,
      careerPath: `适合在${major}相关的专业领域工作`,
      suitability: `${major}领域能够发挥您的专业天赋`,
      recommendation: `${major}专业与您的特质相匹配`,
      advice: `您在${major}领域具有发展潜力和专业优势`
    };
  }
}

// 调用DeepSeek API
async function callDeepSeekAPI(data: PredictionRequest) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || "sk-fee27e4244b54277b1e1868002f843f3";
    
    // 构建基于心仪院校的命理录取分析提示词
    const dreamUniversitiesList = data.dreamUniversities.filter(u => u.trim() !== "").join("、");
    const isBusiness = data.major.toLowerCase().includes('business') || 
                       data.major.toLowerCase().includes('商科') ||
                       data.major.toLowerCase().includes('商业') ||
                       data.major.toLowerCase().includes('finance') ||
                       data.major.toLowerCase().includes('management');
    
    // 计算具体的五行属性
    const getYearStem = (year: number) => {
      const stems = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
      return stems[(year - 4) % 10];
    };
    
    const getYearBranch = (year: number) => {
      const branches = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'];
      return branches[(year - 4) % 12];
    };
    
    const getElementFromStem = (stem: string) => {
      const stemElements = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', 
        '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
      };
      return stemElements[stem as keyof typeof stemElements];
    };
    
    const getElementFromBranch = (branch: string) => {
      const branchElements = {
        '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
        '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
      };
      return branchElements[branch as keyof typeof branchElements];
    };
    
    const yearStem = getYearStem(data.year);
    const yearBranch = getYearBranch(data.year);
    const yearStemElement = getElementFromStem(yearStem);
    const yearBranchElement = getElementFromBranch(yearBranch);
    
    const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    const monthBranch = monthBranches[data.month - 1];
    const monthElement = getElementFromBranch(monthBranch);
    
    const hourBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const hourIndex = Math.floor(data.hour / 2);
    const hourBranch = hourBranches[hourIndex];
    const hourElement = getElementFromBranch(hourBranch);

    const prompt = `作为精通美国大学本科录取和传统命理学的专家，请根据以下学生信息进行详细分析：

【学生档案】
- 出生时间：${data.year}年${data.month}月${data.day}日 ${data.hour}:${data.minute}
- 性别：${data.gender === "male" ? "男" : "女"}
- 申请专业：${data.major}
- 心仪院校列表：${dreamUniversitiesList}

【精确八字五行分析】
- 年柱：${yearStem}${yearBranch}（${yearStemElement}${yearBranchElement}）
- 月令：${monthBranch}月（${monthElement}）
- 时柱：${hourBranch}时（${hourElement}）
- 日主五行：需根据年月日时综合判断
- 命局五行强弱：${yearStemElement}、${monthElement}、${hourElement}的相互作用

【分析任务】
基于该学生的准确八字五行配置，重点分析其五行属性与目标大学的地理方位、学校气场、学术氛围的匹配度，据此预测录取概率。必须根据具体的五行强弱进行个性化分析，不可套用模板。

【深度命理分析要求】
必须严格根据以下具体五行配置进行个性化分析：
1. 年柱${yearStem}${yearBranch}（${yearStemElement}${yearBranchElement}）：根基性格特质
2. 月令${monthElement}：${data.month}月令主导的学习方式和专业天赋
3. 时柱${hourElement}：${hourBranch}时决定的个人能力和发展潜力
4. 五行强弱判断：
   - 如果${monthElement}与${yearStemElement}相同，该五行偏旺
   - 如果${hourElement}与主要五行相生，力量增强
   - 如果三个五行互相制克，需要平衡调和
5. 专业匹配分析：
   - 木旺：适合生物、环境、文学、教育类专业
   - 火旺：适合计算机、电子、传媒、化学类专业  
   - 土旺：适合地质、建筑、农业、管理类专业
   - 金旺：适合机械、金融、医学、法律类专业
   - 水旺：适合海洋、物流、心理、哲学类专业

【重要】每个学生的分析必须完全不同，严禁使用相同的五行描述。

【录取概率评估标准】
请重点基于命理匹配度来评估录取概率，权重分配如下：
- 命理匹配度（70%权重）：五行属性、方位地理、个性特质、学校气场匹配
- 专业契合度（20%权重）：学生五行属性与专业学科的相性
- 大学门槛影响（10%权重）：仅作为参考因素，不要让排名成为主导

录取概率等级：
- 极高：命理高度匹配，五行相生，地理方位极佳
- 较高：命理匹配度良好，学校气场与学生特质相符
- 中等：命理匹配适中，有一定相性但不突出
- 较低：命理匹配度不高，五行相克或方位不利
- 极低：命理严重不匹配，五行冲突明显

${isBusiness ? `
【商科申请特别注意】
以下大学本科商学院情况特殊，需要特别说明：

有本科商学院的大学：
- University of Pennsylvania (Wharton School) ✓
- MIT (Sloan School - 有Management专业) ✓  
- University of California-Berkeley (Haas School) ✓
- University of Michigan-Ann Arbor (Ross School) ✓
- New York University (Stern School) ✓
- Carnegie Mellon University (Tepper School) ✓
- University of North Carolina at Chapel Hill (Kenan-Flagler) ✓
- University of Texas at Austin (McCombs School) ✓
- Cornell University (Dyson School) ✓
- Indiana University-Bloomington (Kelley School) ✓
- University of Southern California (Marshall School) ✓
- University of Notre Dame (Mendoza School) ✓
- University of Virginia (McIntire School) ✓
- Emory University (Goizueta School) ✓
- Georgetown University (McDonough School) ✓

只有研究生商学院的大学：
- Harvard University (哈佛商学院只招研究生，本科申请Economics)
- Stanford University (斯坦福商学院只招研究生，本科申请Economics或MS&E)
- University of Chicago (布斯商学院只招研究生，本科申请Economics)
- Northwestern University (Kellogg只招研究生，本科申请Economics)
- Yale University (管理学院只招研究生，本科申请Economics)
- Dartmouth College (Tuck只招研究生，本科申请Economics)

如果学生选择了这些大学但申请商科，请在分析中说明该校没有商科本科项目，但可以申请Economics等相关专业，并评估该替代专业的录取概率。
` : ''}

请严格按照以下JSON格式返回：
[
  {
    "name": "具体大学英文名称",
    "chineseName": "对应中文名称", 
    "major": "${data.major}",
    "location": "城市，州名",
    "admissionProbability": "极高/较高/中等/较低/极低",
    "reasons": "基于学生具体五行配置${yearStemElement}${yearBranchElement}-${monthElement}-${hourElement}的录取分析。必须包含：1）该学生五行主导属性（${monthElement}月令）与学校地理方位的具体匹配度 2）${yearStemElement}年干体现的性格特质与该校文化的契合度 3）${hourElement}时柱显示的天赋能力与该校学术优势的对应关系 4）五行生克关系对录取运势的影响 5）综合命理匹配度评估。每个学生的分析角度必须根据其独特五行配置进行，严禁套用模板。至少200字个性化命理分析。",
    "specialNote": "如果是商科申请但该校无商学院，在此说明替代专业建议；否则为空字符串"
  }
]

重要要求：
1. 必须根据该学生的具体五行配置（${yearStemElement}${yearBranchElement}-${monthElement}-${hourElement}）进行个性化分析
2. 不同五行属性的学生分析结果必须完全不同，严禁使用通用模板
3. 每个大学的分析必须体现该学生五行与学校的具体匹配关系
4. 如果该学生五行与某校地理方位高度匹配，给予"较高"或"极高"概率
5. 如果该学生五行与某校相克，必须给予"较低"或"极低"概率
6. 分析中必须明确提及该学生的具体五行特征，不可泛泛而谈

【检验标准】
- 分析中必须出现学生的具体五行属性（${yearStemElement}、${monthElement}、${hourElement}）
- 不同出生时间的学生应该得到完全不同的五行分析结果
- 禁止所有学生都被分析为"火旺"或任何单一五行属性

重要：必须返回纯净的JSON数组，不要使用markdown代码块包装，不要添加任何解释文字。格式示例：
[{"name":"University Name",...}]`;

    const response = await axios.post("https://api.deepseek.com/v1/chat/completions", {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个专业的美国大学录取顾问，擅长根据学生背景预测录取可能性。请严格按照要求返回纯净的JSON格式数据，不要包含任何markdown标记、代码块或额外文字说明。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 100000 // 100秒超时
    });

    console.log("DeepSeek API调用成功，正在解析结果...");
    
    // 解析DeepSeek的回复
    const aiResponse = response.data.choices[0].message.content;
    console.log("DeepSeek原始回复:", aiResponse);
    
    // 强化的JSON解析逻辑
    let universities: any[] = [];
    
    try {
      // 首先尝试直接解析
      universities = JSON.parse(aiResponse);
      if (Array.isArray(universities) && universities.length > 0) {
        console.log(`成功直接解析到${universities.length}所大学推荐`);
        return universities.slice(0, 15);
      }
    } catch (directParseError) {
      console.log("直接解析失败，尝试提取JSON...");
      
      // 尝试多种方式提取JSON
      let jsonContent = aiResponse.trim();
      
      // 方法1: 移除markdown代码块
      if (jsonContent.includes('```json')) {
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/\s*```/g, '');
      } else if (jsonContent.includes('```')) {
        jsonContent = jsonContent.replace(/```[a-zA-Z]*\s*/g, '').replace(/\s*```/g, '');
      }
      
      // 方法2: 使用更宽泛的正则表达式匹配JSON数组
      const jsonMatches = [
        jsonContent.match(/\[[\s\S]*?\]/g),
        jsonContent.match(/\[[\s\S]*?\]/g),
        aiResponse.match(/\[[\s\S]*?\]/g)
      ];
      
      for (const matches of jsonMatches) {
        if (matches && matches.length > 0) {
          for (const match of matches) {
            try {
              const parsed = JSON.parse(match);
              if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
                console.log(`成功提取并解析到${parsed.length}所大学`);
                return parsed.slice(0, 15);
              }
            } catch (e) {
              continue; // 尝试下一个匹配
            }
          }
        }
      }
      
      // 方法3: 尝试修复常见的JSON格式问题
      try {
        // 移除可能的前后缀文本
        const lines = aiResponse.split('\n');
        let jsonStartIndex = -1;
        let jsonEndIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('[')) {
            jsonStartIndex = i;
            break;
          }
        }
        
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim().endsWith(']')) {
            jsonEndIndex = i;
            break;
          }
        }
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
          const jsonLines = lines.slice(jsonStartIndex, jsonEndIndex + 1);
          const cleanJson = jsonLines.join('\n');
          universities = JSON.parse(cleanJson);
          
          if (Array.isArray(universities) && universities.length > 0) {
            console.log(`通过行解析成功提取到${universities.length}所大学`);
            return universities.slice(0, 15);
          }
        }
      } catch (lineParseError) {
        console.log("行解析也失败");
      }
      
      console.log("所有JSON解析方法都失败，使用默认推荐");
      return getDefaultUniversityPredictions(data);
    }
    
  } catch (error) {
    console.error("DeepSeek API调用失败:", error);
    console.log("使用默认大学推荐逻辑");
    return getDefaultUniversityPredictions(data);
  }
}

// 默认大学预测结果 - 基于心仪院校列表
function getDefaultUniversityPredictions(data: PredictionRequest) {
  // 过滤掉空的心仪院校
  const dreamUniversities = data.dreamUniversities.filter(u => u.trim() !== "");
  
  // 如果没有心仪院校，返回空数组
  if (dreamUniversities.length === 0) {
    return [];
  }
  
  // 转换为所需格式
  return dreamUniversities.map((universityName) => ({
    name: universityName,
    chineseName: getChineseName(universityName),
    major: data.major,
    location: getUniversityLocation(universityName),
    admissionProbability: calculateRealisticProbability(data, universityName),
    reasons: generateDefaultAdmissionAnalysis(data, universityName),
    specialNote: checkBusinessMajorCompatibility(data.major, universityName)
  }));
}

// 获取大学中文名称
function getChineseName(englishName: string): string {
  const nameMap: Record<string, string> = {
    "University of Central Florida": "中佛罗里达大学",
    "Florida State University": "佛罗里达州立大学", 
    "University of South Carolina": "南卡罗来纳大学",
    "Auburn University": "奥本大学",
    "University of Alabama--Tuscaloosa": "阿拉巴马大学",
    "Louisiana State University--Baton Rouge": "路易斯安那州立大学",
    "University of Arkansas--Fayetteville": "阿肯色大学",
    "University of Oklahoma": "俄克拉荷马大学",
    "University of Kansas": "堪萨斯大学",
    "University of Missouri": "密苏里大学",
    "University of Nebraska--Lincoln": "内布拉斯加大学林肯分校",
    "Washington State University": "华盛顿州立大学",
    "Oregon State University": "俄勒冈州立大学",
    "University of Kentucky": "肯塔基大学",
    "University of Tennessee--Knoxville": "田纳西大学",
    "Iowa State University": "爱荷华州立大学",
    "Harvard University": "哈佛大学",
    "Stanford University": "斯坦福大学",
    "Massachusetts Institute of Technology": "麻省理工学院",
    "Yale University": "耶鲁大学",
    "Princeton University": "普林斯顿大学",
    "Columbia University": "哥伦比亚大学",
    "University of Pennsylvania": "宾夕法尼亚大学",
    "University of Chicago": "芝加哥大学",
    "Duke University": "杜克大学",
    "Northwestern University": "西北大学",
    "Cornell University": "康奈尔大学",
    "Brown University": "布朗大学",
    "University of California--Berkeley": "加州大学伯克利分校",
    "University of California--Los Angeles": "加州大学洛杉矶分校",
    "University of Michigan--Ann Arbor": "密歇根大学安娜堡分校",
    "New York University": "纽约大学",
    "Carnegie Mellon University": "卡内基梅隆大学",
    "University of Southern California": "南加州大学",
    "Georgetown University": "乔治城大学",
    "Emory University": "埃默里大学",
    "University of Virginia": "弗吉尼亚大学",
    "University of North Carolina--Chapel Hill": "北卡罗来纳大学教堂山分校",
    "Boston University": "波士顿大学",
    "Northeastern University": "东北大学",
    "University of Florida": "佛罗里达大学",
    "University of Texas at Austin": "德克萨斯大学奥斯汀分校",
    "Georgia Institute of Technology": "佐治亚理工学院",
    "University of Washington": "华盛顿大学",
    "University of Illinois Urbana-Champaign": "伊利诺伊大学厄巴纳-香槟分校"
  };
  return nameMap[englishName] || englishName;
}

// 获取大学位置
function getUniversityLocation(universityName: string): string {
  const locationMap: Record<string, string> = {
    "University of Central Florida": "奥兰多，佛罗里达州",
    "Florida State University": "塔拉哈西，佛罗里达州",
    "University of South Carolina": "哥伦比亚，南卡罗来纳州",
    "Auburn University": "奥本，阿拉巴马州",
    "University of Alabama--Tuscaloosa": "塔斯卡卢萨，阿拉巴马州",
    "Louisiana State University--Baton Rouge": "巴吞鲁日，路易斯安那州",
    "University of Arkansas--Fayetteville": "费耶特维尔，阿肯色州",
    "University of Oklahoma": "诺曼，俄克拉荷马州",
    "University of Kansas": "劳伦斯，堪萨斯州",
    "University of Missouri": "哥伦比亚，密苏里州",
    "Harvard University": "剑桥，马萨诸塞州",
    "Stanford University": "斯坦福，加利福尼亚州",
    "Massachusetts Institute of Technology": "剑桥，马萨诸塞州",
    "Yale University": "纽黑文，康涅狄格州",
    "Princeton University": "普林斯顿，新泽西州",
    "Columbia University": "纽约，纽约州",
    "University of Pennsylvania": "费城，宾夕法尼亚州",
    "University of Chicago": "芝加哥，伊利诺伊州",
    "Duke University": "达勒姆，北卡罗来纳州",
    "Northwestern University": "埃文斯顿，伊利诺伊州",
    "Cornell University": "伊萨卡，纽约州",
    "Brown University": "普罗维登斯，罗德岛州",
    "University of California--Berkeley": "伯克利，加利福尼亚州",
    "University of California--Los Angeles": "洛杉矶，加利福尼亚州",
    "University of Michigan--Ann Arbor": "安娜堡，密歇根州",
    "New York University": "纽约，纽约州",
    "Carnegie Mellon University": "匹兹堡，宾夕法尼亚州",
    "University of Southern California": "洛杉矶，加利福尼亚州",
    "Georgetown University": "华盛顿，华盛顿特区",
    "Emory University": "亚特兰大，佐治亚州",
    "University of Virginia": "夏洛茨维尔，弗吉尼亚州",
    "University of North Carolina--Chapel Hill": "教堂山，北卡罗来纳州",
    "Boston University": "波士顿，马萨诸塞州",
    "Northeastern University": "波士顿，马萨诸塞州",
    "University of Florida": "盖恩斯维尔，佛罗里达州",
    "University of Texas at Austin": "奥斯汀，德克萨斯州",
    "Georgia Institute of Technology": "亚特兰大，佐治亚州",
    "University of Washington": "西雅图，华盛顿州",
    "University of Illinois Urbana-Champaign": "厄巴纳-香槟，伊利诺伊州"
  };
  return locationMap[universityName] || "美国";
}

// 生成默认的录取分析
function generateDefaultAdmissionAnalysis(data: PredictionRequest, universityName: string): string {
  const universityAnalysis = getUniversityFortuneAnalysis(universityName);
  const elementAnalysis = getElementByDateTime(data.year, data.month, data.day, data.hour);
  const seasonAnalysis = getSeason(data.month);
  
  return `根据您${data.year}年${data.month}月${data.day}日${data.hour}时的详细出生时间分析，您的五行属${elementAnalysis.element}，${elementAnalysis.personality}。${seasonAnalysis.analysis}${universityAnalysis.location}的地理环境${universityAnalysis.locationMatch}，该校的${universityAnalysis.academicMatch}特别适合您的${universityAnalysis.personalityMatch}。基于命理分析和五行匹配度，您与该校具有${elementAnalysis.balance}的契合度，建议积极申请。`;
}

// 根据大学名称提供命理匹配分析
function getUniversityFortuneAnalysis(universityName: string): any {
  const locationAnalysis: Record<string, any> = {
    "University of Central Florida": {
      element: "属火命格",
      location: "佛罗里达州阳光充沛",
      locationMatch: "与您的火元素相得益彰",
      academicMatch: "工程和商科项目实力雄厚",
      personalityMatch: "活跃开朗的性格特质"
    },
    "Florida State University": {
      element: "木火相生",
      location: "佛州北部",
      locationMatch: "温暖气候有利于学业发展",
      academicMatch: "综合性大学氛围",
      personalityMatch: "积极向上的个性"
    },
    "University of South Carolina": {
      element: "土金并旺",
      location: "南卡州",
      locationMatch: "稳定的地理位置符合您的命格",
      academicMatch: "商学院声誉优良",
      personalityMatch: "踏实稳重的品格"
    },
    "Auburn University": {
      element: "木气旺盛",
      location: "阿拉巴马州",
      locationMatch: "自然环境优美，有利于身心发展",
      academicMatch: "工程技术专业突出",
      personalityMatch: "专注钻研的学术气质"
    },
    "default": {
      element: "五行调和",
      location: "该地区",
      locationMatch: "地理环境与您的命理特质相配",
      academicMatch: "学术氛围",
      personalityMatch: "综合发展潜质"
    }
  };
  
  return locationAnalysis[universityName] || locationAnalysis["default"];
}

// 计算realistic的录取概率
function calculateRealisticProbability(data: PredictionRequest, universityName: string): string {
  // 定义大学层次
  const topTierUniversities = [
    "Harvard University", "Stanford University", "Massachusetts Institute of Technology",
    "Yale University", "Princeton University", "Columbia University", "University of Pennsylvania",
    "University of Chicago", "Duke University", "Northwestern University", "Cornell University",
    "Brown University", "Dartmouth College", "Vanderbilt University", "Rice University"
  ];
  
  const midTierUniversities = [
    "University of California--Berkeley", "University of California--Los Angeles",
    "University of Michigan--Ann Arbor", "New York University", "Carnegie Mellon University",
    "University of Southern California", "Georgetown University", "Emory University",
    "University of Virginia", "University of North Carolina--Chapel Hill", "Boston University",
    "Northeastern University", "University of Florida", "University of Texas at Austin",
    "Georgia Institute of Technology", "University of Washington"
  ];
  
  // 专业难度评估
  const isBusiness = data.major.toLowerCase().includes('business') || 
                     data.major.toLowerCase().includes('商科') ||
                     data.major.toLowerCase().includes('finance') ||
                     data.major.toLowerCase().includes('management');
  
  const isSTEM = data.major.toLowerCase().includes('engineering') ||
                 data.major.toLowerCase().includes('computer') ||
                 data.major.toLowerCase().includes('math') ||
                 data.major.toLowerCase().includes('science');
  
  // 基础概率评估
  let probabilityScore = 3; // 中等
  
  // 根据大学层次调整
  if (topTierUniversities.includes(universityName)) {
    probabilityScore = Math.max(1, probabilityScore - 2); // 顶尖大学降低概率
  } else if (midTierUniversities.includes(universityName)) {
    probabilityScore = Math.max(2, probabilityScore - 1); // 中等大学略降概率
  }
  
  // 根据专业难度调整
  if (isBusiness) {
    probabilityScore = Math.max(1, probabilityScore - 1); // 商科竞争激烈
  } else if (isSTEM) {
    probabilityScore = Math.min(5, probabilityScore + 1); // STEM相对容易些
  }
  
  // 根据命理因素随机调整（模拟命理匹配度）
  const birthMonth = data.month;
  const birthYear = data.year;
  const luckyFactor = (birthMonth + birthYear) % 3; // 简单的"命理"调整
  
  if (luckyFactor === 0) probabilityScore = Math.min(5, probabilityScore + 1);
  else if (luckyFactor === 1) probabilityScore = Math.max(1, probabilityScore - 1);
  
  // 转换为文字描述
  const probabilityLevels = ["极低", "较低", "中等", "较高", "极高"];
  return probabilityLevels[probabilityScore - 1];
}

// 检查商科专业兼容性
function checkBusinessMajorCompatibility(major: string, universityName: string): string {
  const isBusiness = major.toLowerCase().includes('business') || 
                     major.toLowerCase().includes('商科') ||
                     major.toLowerCase().includes('商业') ||
                     major.toLowerCase().includes('finance') ||
                     major.toLowerCase().includes('management');
  
  if (!isBusiness) return "";
  
  const noBusinessSchools: Record<string, string> = {
    "Harvard University": "哈佛商学院只招收研究生，本科建议申请Economics专业",
    "Stanford University": "斯坦福商学院只招收研究生，本科建议申请Economics或Management Science & Engineering",
    "Princeton University": "该校本科没有商学院，建议申请Economics专业",
    "Yale University": "耶鲁管理学院只招收研究生，本科建议申请Economics专业", 
    "California Institute of Technology": "该校没有商科专业，建议申请Economics专业",
    "University of Chicago": "芝加哥布斯商学院只招收研究生，本科建议申请Economics专业",
    "Northwestern University": "Kellogg商学院只招收研究生，本科建议申请Economics",
    "Johns Hopkins University": "该校没有本科商学院，建议申请Economics专业",
    "Dartmouth College": "Tuck商学院只招收研究生，本科建议申请Economics专业",
    "Brown University": "该校没有独立商学院，建议申请Economics或Commerce, Organizations & Entrepreneurship专业"
  };
  
  return noBusinessSchools[universityName] || "";
}





