import type { Express } from "express";
import { createServer, type Server } from "http";
import { predictionRequestSchema } from "@shared/schema";
import axios from "axios";
import { getUniversitiesByLevel } from "./university-rankings.ts";

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
    
    const userinfo = `我是${gender === "male" ? "男性" : "女性"}，我的公历出生日期是${birthDate}，出生时间是${birthTime}。`;
    
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
    console.log("咕咕數據API返回:", JSON.stringify(apiResult, null, 2));
    
    // 如果API成功返回數據，直接使用
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
当前大运：${data.大运.find(d => {
  const [start, end] = d.年份.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  return currentYear >= start && currentYear <= end;
})?.大运 || '分析中'} (${data.大运.find(d => {
  const [start, end] = d.年份.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  return currentYear >= start && currentYear <= end;
})?.十神 || ''})

未来十年大运趋势：
${data.大运.slice(0, 3).map(d => `${d.年份}: ${d.大运} (${d.十神})`).join('\n')}` : '暂无大运分析'}`
      };
    }
    
    // 如果API返回格式不符预期，显示错误信息
    return {
      analysis: `API调用状态：${apiResult?.DataStatus?.StatusDescription || '未知错误'}
完整返回数据：${JSON.stringify(apiResult, null, 2)}`,
      fiveElements: `状态码：${apiResult?.DataStatus?.StatusCode || 'N/A'}`,
      academicFortune: "请检查API调用",
      recommendations: `请求参数：${apiResult?.DataStatus?.RequestParameter || ''}`
    };
    
  } catch (error) {
    console.error("咕咕数据API调用失败:", error);
    
    // 生成更智能的替代分析，基於生辰八字基本信息
    const season = getSeason(month);
    const timeAnalysis = getTimeAnalysis(hour);
    const elementAnalysis = getElementByYear(year);
    
    return {
      analysis: `根据您的出生信息（${year}年${month}月${day}日${hour}时${minute}分），${elementAnalysis.analysis}。${season.analysis}${timeAnalysis.analysis}这些因素结合显示您在学术领域具有独特优势，适合深造发展。`,
      fiveElements: `${elementAnalysis.element}，${season.element}，整体五行配置${elementAnalysis.balance}`,
      academicFortune: `${timeAnalysis.fortune}，${season.fortune}，整体学业运势向好，特别适合海外求学。`,
      recommendations: `基于您的命理特质，建议选择${elementAnalysis.major}相关专业，发挥您的${elementAnalysis.strength}优势。`
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
    
    // 构建智能提示词，特別強調本科專業的準確性
    const prompt = `作為精通美國大學本科錄取和傳統命理學的專家，請根據以下信息預測15所美國本科大學的錄取可能性：

學生信息：
- 出生時間：${data.year}年${data.month}月${data.day}日 ${data.hour}:${data.minute}（請根據此分析五行命理特質）
- 性別：${data.gender === "male" ? "男" : "女"}
- 申請專業：${data.major}
- 語言成績：${data.testType === "toefl" ? "托福" : "雅思"} ${data.score || '未提供'}分
- 申請材料水平：${getMaterialLevelText(data.materialLevel)}

⚠️ 關鍵要求（必須100%嚴格遵循）：
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
    "reasons": "詳細說明為什麼這所大學會錄取該學生，結合申請材料水平、語言成績、命理分析等因素，至少100字"
  }
]

請確保推薦的都是該學生條件下真正有可能被錄取的學校，專業名稱100%準確。`;

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
      // 移除admissionProbability字段
      const cleanedUniversities = (Array.isArray(universities) ? universities : universities.universities || []).map(uni => ({
        name: uni.name,
        chineseName: uni.chineseName,
        major: uni.major,
        location: uni.location,
        reasons: uni.reasons
      }));
      return cleanedUniversities;
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

// 默认大学预测结果 - 根据实际水平智能推荐
function getDefaultUniversityPredictions(data: any) {
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

// 根据水平生成推荐理由
function generateReasonBasedOnLevel(materialLevel: string, score: number, testType: string, universityName: string): string {
  const levelTexts = {
    "very-poor": "虽然您的申请材料还需要提升，但这所大学对国际学生相对友好，是很好的起点选择。",
    "poor": "根据您目前的申请条件，这所大学的录取要求与您的水平比较匹配。",
    "average": "您的整体条件符合这所大学的录取标准，有较好的录取机会。",
    "good": "您的申请材料和成绩都达到了这所大学的要求，录取前景良好。",
    "excellent": "您的优秀条件完全符合这所顶尖大学的要求。"
  };
  
  const scoreText = testType === "toefl" 
    ? `托福${score}分的成绩${score >= 100 ? '优秀' : score >= 80 ? '合格' : '需要提升'}`
    : `雅思${score}分的成绩${score >= 7.0 ? '优秀' : score >= 6.0 ? '合格' : '需要提升'}`;
  
  return `${levelTexts[materialLevel] || levelTexts.average} ${scoreText}，结合您的命理特质分析，这所大学的地理位置和学术氛围都很适合您的发展。`;
}

// 移除原来的商科特殊处理逻辑
function getOldDefaultUniversityPredictions(data: any) {
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
