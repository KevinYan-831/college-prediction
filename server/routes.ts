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
      const { year, month, day, hour, minute, gender, major, testType, score, materialLevel } = validatedData;
      
      // 并行调用两个API
      const [fortuneResponse, universityResponse] = await Promise.all([
        // 调用咕咕数据API进行命理分析
        callGuguDataAPI(year, month, day, hour, minute, gender, major),
        // 调用DeepSeek API进行大学预测
        callDeepSeekAPI(validatedData)
      ]);
      
      const sessionId = randomUUID();
      
      // 返回合并结果
      const result = {
        fortuneAnalysis: fortuneResponse,
        universityPredictions: universityResponse,
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
    
    // 构建生辰八字字符串
    const birthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const birthTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const userinfo = `我是${gender === "male" ? "男性" : "女性"}，我的公历出生日期是${birthDate}，出生时间是${birthTime}。`;
    
    console.log(`调用咕咕数据API: ${birthDate} ${birthTime} ${gender}`);
    console.log(`userinfo参数: ${userinfo}`);
    
    const response = await axios.post(`https://api.gugudata.com/ai/bazi-fortune-teller?appkey=${appKey}`, {
        userinfo: userinfo
      }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'University-Prediction-App/1.0'
      },
      timeout: 15000
    });
    
    // 处理咕咕数据API的返回结果
    const apiResult = response.data;
    console.log("咕咕数据API返回:", JSON.stringify(apiResult, null, 2));
    
    // 如果API成功返回数据，直接使用
    if (apiResult && apiResult.DataStatus && apiResult.DataStatus.StatusCode === 100) {
      const data = apiResult.Data;
      const analysis = data.分析 || {};
      
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
    
    // 生成更智能的替代分析，基於生辰八字基本信息
    const season = getSeason(month);
    const timeAnalysis = getTimeAnalysis(hour);
    const elementAnalysis = getElementByYear(year);
    
    // 构建专业信息字符串以替代validatedData
    const majorForAnalysis = `专业选择：${major || '未指定'}`; 
    const majorAnalysis = getMajorAnalysis(major || '', elementAnalysis);
    
    return {
      analysis: `【八字命盘】
八字：基于${year}年${month}月${day}日${hour}时${minute}分计算
五行：${elementAnalysis.element}

【体貌特征】
基于您的出生年份和时辰分析，您体型中等，面容清秀，眼神较为锐利，给人一种聪明伶俐的感觉。${elementAnalysis.element}特质明显。

【学业运势】
您在学业上表现较为出色，${elementAnalysis.analysis}。${timeAnalysis.analysis}${majorAnalysis.compatibility}，海外求学运势良好。

【事业发展】
${timeAnalysis.fortune}，事业上会有较好的发展机会。您的${elementAnalysis.strength}优势明显，${majorAnalysis.careerPath}。

【财运状况】
整体财运稳定，通过学术成就和专业技能可获得良好收入。${season.analysis}

【婚姻感情】
感情运势平稳，建议专注学业发展，婚姻方面不必过于着急。

【健康状况】
身体状况总体良好，注意用眼卫生和作息规律，避免过度疲劳。

【总体评价】
您的命盘显示具有良好的学术天赋和发展潜力，${elementAnalysis.balance}，适合深造发展。${majorAnalysis.suitability}`,
      fiveElements: `五行配置：${elementAnalysis.element}，${season.element}，整体五行配置${elementAnalysis.balance}`,
      academicFortune: `学业运势向好，${timeAnalysis.fortune}，${season.fortune}，特别适合海外求学。`,
      recommendations: `【大运分析】
当前阶段：适合求学深造的黄金时期
未来发展：专业技能将成为您的核心竞争力

【专业建议】
基于您的命理特质，${majorAnalysis.recommendation}，发挥您的${elementAnalysis.strength}优势。${majorAnalysis.advice}`
    };
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
    
    // 构建详细的命理分析提示词
    const prompt = `作为精通美国大学本科录取和传统命理学的专家，请根据以下学生信息进行详细分析：

【学生档案】
- 出生时间：${data.year}年${data.month}月${data.day}日 ${data.hour}:${data.minute}
- 性别：${data.gender === "male" ? "男" : "女"}
- 申请专业：${data.major}
- 语言成绩：${data.testType === "toefl" ? "托福" : "雅思"} ${data.score || '未提供'}分
- 申请材料水平：${getMaterialLevelText(data.materialLevel)}

【命理分析要求】
1. 根据出生年份${data.year}分析五行属性（金木水火土）
2. 根据出生月份${data.month}月分析季节特征对性格的影响
3. 根据出生时辰${data.hour}:${data.minute}分析个人特质

【大学推荐要求】
基于上述命理分析，推荐15所真正适合且能够录取该学生的美国大学。每所推荐必须详细说明：
- 该校地理位置的风水特征如何与学生五行相配
- 学校的学术氛围如何适合学生的性格特质
- 为什么这种命理特征的学生会在该校获得成功
- 结合实际录取要求的分析

⚠️ 关键要求（必须100%严格遵循）：

1. 基于出生时间进行详细的五行命理分析，说明学生的性格特质、学术潜能等
2. 根据申请材料水平${getMaterialLevelText(data.materialLevel)}，推荐15所实际能被录取的大学，不要推荐过于顶尖的学校
3. 每所大学的推荐理由必须结合命理分析，说明该大学与学生八字五行的匹配程度
4. 特别说明这所大学的地理位置、学术氛围如何与学生的命理特质相配

请严格按照以下JSON格式返回：
[
  {
    "name": "University of Central Florida",
    "chineseName": "中佛罗里达大学", 
    "major": "${data.major}",
    "location": "奥兰多，佛罗里达州",
    "reasons": "根据您${data.year}年出生的命理特质，五行属X，性格特点Y。佛罗里达州的阳光充沛环境与您的命格相合，该校的Z专业能够发挥您的天赋优势..."
  }
]

务必确保：
- 每个推荐理由都结合具体的命理分析
- 不要推荐哈佛、斯坦福、麻省理工等顶尖大学（因为申请材料水平为${getMaterialLevelText(data.materialLevel)}）
- 推荐的学校排名应该在40-80之间，符合学生实际水平
1. 這是針對美國本科申請的分析，學生是高中生
2. 必須確認每所大學確實提供該專業的本科學位
3. 以下大學本科沒有商科（Business Administration/Business）專業，絕對不能推薦給商科申請者：
   - 哈佛大學（只有Economics）
   - 斯坦福大學（只有Economics, Management Science & Engineering）
   - 普林斯頓大學（只有Economics）
   - 耶魯大學（只有Economics）
   - 麻省理工學院（只有Management）
4. 如果學生申請商科，只推薦確實有本科Business程序的大學
5. 如果是其他專業，確保推薦的學校有該本科專業
6. 根據申請材料水平嚴格評估錄取可能性：
   - 極差材料：不可能被頂尖大學錄取，只推薦社區大學或排名很低的大學
   - 較差材料：只推薦排名較低的州立大學
   - 一般材料：推薦中等排名的大學
   - 較好材料：推薦較好排名的大學
   - 極好材料：可推薦頂尖大學
7. 根據語言成績評估：托福105+或雅思7.5+才可能被頂尖大學錄取
8. 根據生辰八字的五行屬性分析學生的性格和學習特質
9. 結合命理因素解釋為什麼某個地區或學校適合該學生

請返回JSON格式數組，包含15所真正會錄取該學生的大學（不要顯示錄取概率百分比）：
[
  {
    "name": "英文校名",
    "chineseName": "中文校名",
    "major": "確實存在的本科專業名稱",
    "location": "城市，州名",
    "reasons": "详细说明为什么这所大学会录取该学生。每所大学的理由必须完全不同，严格避免重复内容。必须包含：1）基于出生年份${data.year}的独特五行属性分析 2）该校特定地理位置与学生命理的独特匹配度 3）学校独特氛围如何适合学生的特定性格特质 4）结合托福${data.score}分和申请材料水平的录取分析。确保每所大学用不同的命理角度分析，如五行相生相克、地理风水、季节特征、时辰特点等，至少150字且内容差异明显"
  }
]

重要提醒：
1. 如果申请专业是商科/金融/管理，只能推荐在商学院排名中的大学
2. 绝对不要推荐没有相关本科专业的大学（如加州理工、芝加哥大学、杜克大学等对商科申请者）
3. 专业名称必须100%准确，与该大学实际开设的本科专业一致

请返回准确的JSON格式数组。`;

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
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    console.log("DeepSeek API调用成功，正在解析结果...");
    
    // 解析DeepSeek的回复
    const aiResponse = response.data.choices[0].message.content;
    console.log("DeepSeek原始回复:", aiResponse);
    
    // 尝试解析JSON
    try {
      const universities = JSON.parse(aiResponse);
      
      if (Array.isArray(universities) && universities.length > 0) {
        console.log(`成功解析到${universities.length}所大学推荐`);
        return universities.slice(0, 15); // 限制最多15所
      } else {
        throw new Error("AI返回数据格式不正确");
      }
    } catch (parseError) {
      console.error("解析AI回复失败:", parseError);
      console.log("尝试提取JSON部分...");
      
      // 尝试从回复中提取JSON部分，处理markdown格式
      let jsonContent = aiResponse;
      
      // 移除markdown代码块标记
      if (jsonContent.includes('```json')) {
        jsonContent = jsonContent.replace(/```json\s*\n?/g, '').replace(/\n?\s*```/g, '');
      } else if (jsonContent.includes('```')) {
        jsonContent = jsonContent.replace(/```\s*\n?/g, '').replace(/\n?\s*```/g, '');
      }
      
      const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const universities = JSON.parse(jsonMatch[0]);
          console.log(`从文本中提取并解析到${universities.length}所大学`);
          return universities.slice(0, 15);
        } catch (e) {
          console.error("提取JSON也失败:", e);
        }
      }
      
      // 如果AI解析失败，使用默认推荐但保留AI的部分分析内容
      console.log("使用默认大学推荐逻辑");
      return getDefaultUniversityPredictions(data);
    }
    
  } catch (error) {
    console.error("DeepSeek API调用失败:", error);
    console.log("使用默认大学推荐逻辑");
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

// 默认大学预测结果 - 根据实际水平智能推荐
function getDefaultUniversityPredictions(data: PredictionRequest) {
  // 使用新的排名系统推荐合适的大学
  const recommendedUniversities = getUniversitiesByLevel(
    data.materialLevel, 
    data.score, 
    data.testType, 
    data.major
  );
  
  // 转换为所需格式
  return recommendedUniversities.map((universityName, index) => ({
    name: universityName,
    chineseName: getChineseName(universityName),
    major: data.major,
    location: getUniversityLocation(universityName),
    reasons: generateReasonBasedOnLevel(data.materialLevel, data.score, data.testType, universityName)
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
    "Iowa State University": "爱荷华州立大学"
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
    "University of Missouri": "哥伦比亚，密苏里州"
  };
  return locationMap[universityName] || "美国";
}

// 根据水平和命理特质生成推荐理由 - 提供更详细的分析
function generateReasonBasedOnLevel(materialLevel: string, score: number, testType: string, universityName: string): string {
  const universityAnalysis = getUniversityFortuneAnalysis(universityName);
  const scoreText = testType === "toefl" 
    ? `托福${score}分的成绩` 
    : `雅思${score}分的成绩`;
  
  const levelText = {
    "very-poor": "虽然申请材料还需提升，但",
    "poor": "以目前的申请条件，",
    "average": "以您的整体条件，",
    "good": "以您良好的申请材料，",
    "excellent": "以您优秀的条件，"
  }[materialLevel] || "以您的条件，";
  
  return `${levelText}结合命理分析显示您${universityAnalysis.element}，${universityAnalysis.location}的地理环境${universityAnalysis.locationMatch}。该校的${universityAnalysis.academicMatch}，特别适合您的${universityAnalysis.personalityMatch}。${scoreText}也符合该校的录取要求。`;
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

// 移除原来的商科特殊处理逻辑
function getOldDefaultUniversityPredictions(data: PredictionRequest) {
  const baseScore = getBaseScore(data);
  const isBusiness = data.major.toLowerCase().includes('business') || 
                     data.major.toLowerCase().includes('商科') ||
                     data.major.toLowerCase().includes('商业');
  
  // 如果是商科申請，推薦有商學院的大學  
  if (isBusiness) {
    return [
      {
        name: "University of Pennsylvania (Wharton)",
        chineseName: "宾夕法尼亚大学沃顿商学院",
        major: "Business Administration", 
        location: "費城,賓夕法尼亞州",
        reasons: "沃頓商學院是全美頂尖商學院，您的命理特質適合商業發展"
      },
      {
        name: "University of Michigan - Ann Arbor (Ross)",
        chineseName: "密歇根大學安娜堡分校羅斯商學院",
        major: "Business Administration",
        location: "安娜堡，密歇根州",
        reasons: "羅斯商學院聲譽卓著，中西部地區適合您的五行特質"
      },
      {
        name: "New York University (Stern)",
        chineseName: "紐約大學斯特恩商學院",
        major: "Business Administration",
        location: "紐約，紐約州",
        reasons: "斯特恩商學院位於金融中心，有利於您的財運發展"
      },
      {
        name: "UC Berkeley (Haas)",
        chineseName: "加州大學伯克利分校哈斯商學院", 
        major: "Business Administration",
        location: "伯克利，加利福尼亞州",
        reasons: "哈斯商學院創新氛圍濃厚，西海岸環境適合您的發展"
      },
      {
        name: "University of Virginia (Darden)",
        chineseName: "弗吉尼亞大學達頓商學院",
        major: "Business Administration", 
        location: "夏洛茨維爾，弗吉尼亞州",
        reasons: "達頓商學院案例教學著名，東海岸環境有利於您的學業運"
      },
      {
        name: "Carnegie Mellon University (Tepper)",
        chineseName: "卡內基梅隆大學泰珀商學院",
        major: "Business Administration",
        location: "匹茲堡，賓夕法尼亞州",
        reasons: "泰珀商學院技術導向，結合您的命理特質適合創新發展"
      },
      {
        name: "Washington University in St. Louis (Olin)",
        chineseName: "聖路易斯華盛頓大學奧林商學院",
        major: "Business Administration",
        location: "聖路易斯，密蘇里州",
        reasons: "奧林商學院教學品質優秀，中部地區環境有利於您的發展"
      },
      {
        name: "University of Notre Dame (Mendoza)",
        chineseName: "聖母大學門多薩商學院", 
        major: "Business Administration",
        location: "南本德，印第安納州",
        reasons: "門多薩商學院注重價值觀培養，適合您的品格發展"
      },
      {
        name: "Georgetown University (McDonough)",
        chineseName: "喬治城大學麥克多諾商學院",
        major: "Business Administration", 
        location: "華盛頓特區",
        reasons: "麥克多諾商學院政商結合，首都地區有利於您的事業運"
      },
      {
        name: "Boston College (Carroll)",
        chineseName: "波士頓學院卡羅爾商學院",
        major: "Business Administration",
        location: "波士頓，麻薩諸塞州",
        reasons: "卡羅爾商學院學術聲譽良好，新英格蘭地區適合您的學習"
      },
      {
        name: "University of Southern California (Marshall)",
        chineseName: "南加州大學馬歇爾商學院",
        major: "Business Administration",
        location: "洛杉磯，加利福尼亞州", 
        reasons: "馬歇爾商學院國際化程度高，西海岸創業氛圍適合您"
      },
      {
        name: "Indiana University (Kelley)",
        chineseName: "印第安納大學凱利商學院",
        major: "Business Administration",
        location: "布盧明頓，印第安納州",
        reasons: "凱利商學院性價比高，中西部環境穩定適合學業發展"
      },
      {
        name: "University of Illinois Urbana-Champaign",
        chineseName: "伊利諾伊大學厄巴納-香檳分校商學院",
        major: "Business Administration",
        location: "厄巴納-香檳，伊利諾伊州",
        reasons: "商學院實力強勁，公立大學性價比高適合您的財運規劃"
      },
      {
        name: "University of Texas at Austin (McCombs)",
        chineseName: "德州大學奧斯汀分校麥庫姆斯商學院",
        major: "Business Administration",
        location: "奧斯汀，德克薩斯州",
        reasons: "麥庫姆斯商學院創業精神濃厚，德州發展前景符合您的運勢"
      }
    ];
  }
  
  // 非商科專業的默認推薦
  return [
    {
      name: "MIT",
      chineseName: "麻省理工学院",
      major: data.major,
      location: "剑桥，马萨诸塞州", 
      reasons: "理工科专业优势明显"
    },
    {
      name: "Princeton University",
      chineseName: "普林斯顿大学",
      major: data.major,
      location: "普林斯顿，新泽西州",
      reasons: "学术潜力符合要求"
    },
    {
      name: "Yale University",
      chineseName: "耶鲁大学", 
      major: data.major,
      location: "纽黑文，康涅狄格州",
      reasons: "综合素质良好"
    },
    {
      name: "University of Chicago",
      chineseName: "芝加哥大学",
      major: data.major,
      location: "芝加哥，伊利诺伊州",
      reasons: "学术氛围匹配"
    },
    {
      name: "Columbia University",
      chineseName: "哥伦比亚大学",
      major: data.major,
      location: "纽约，纽约州",
      reasons: "地理位置优势"
    },
    {
      name: "University of Pennsylvania",
      chineseName: "宾夕法尼亚大学",
      major: data.major,
      location: "费城，宾夕法尼亚州",
      reasons: "专业排名靠前"
    },
    {
      name: "Duke University",
      chineseName: "杜克大学",
      major: data.major,
      location: "达勒姆，北卡罗来纳州",
      reasons: "综合实力强劲"
    },
    {
      name: "Northwestern University",
      chineseName: "西北大学",
      major: data.major,
      location: "埃文斯顿，伊利诺伊州",
      reasons: "专业匹配度高"
    },
    {
      name: "Brown University",
      chineseName: "布朗大学",
      major: data.major,
      location: "普罗维登斯，罗德岛州",
      reasons: "开放式课程适合发展"
    },
    {
      name: "Vanderbilt University", 
      chineseName: "范德堡大学",
      major: data.major,
      location: "纳什维尔，田纳西州",
      reasons: "学术声誉良好"
    },
    {
      name: "Rice University",
      chineseName: "莱斯大学",
      major: data.major,
      location: "休斯顿，得克萨斯州",
      reasons: "小班教学优势"
    },
    {
      name: "Washington University in St. Louis",
      chineseName: "圣路易斯华盛顿大学",
      major: data.major,
      location: "圣路易斯，密苏里州",
      reasons: "学术水平匹配"
    },
    {
      name: "Emory University",
      chineseName: "埃默里大学",
      major: data.major,
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
