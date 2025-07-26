// 美国大学排名数据
export const USNEWS_TOP100_UNIVERSITIES = [
  // Top 10
  "Princeton University", "Massachusetts Institute of Technology", "Harvard University", "Stanford University",
  "Yale University", "California Institute of Technology", "University of Pennsylvania", "Columbia University",
  "University of Chicago", "Duke University",
  
  // 11-20
  "Johns Hopkins University", "Carnegie Mellon University", "University of California--Berkeley", 
  "University of California--Los Angeles", "University of Michigan--Ann Arbor", "New York University", 
  "University of Southern California", "University of Florida", "University of Texas at Austin",
  "Georgia Institute of Technology",
  
  // 21-30
  "University of Illinois Urbana-Champaign", "Boston University", "University of Washington", 
  "Purdue University", "Ohio State University", "Rutgers University", "University of North Carolina--Chapel Hill",
  "University of Wisconsin--Madison", "University of Virginia", "University of California--San Diego",
  
  // 31-40
  "University of California--Davis", "University of California--Irvine", "Pennsylvania State University--University Park", 
  "University of Maryland--College Park", "Ohio State University--Columbus", "University of Georgia", 
  "Texas A&M University--College Station", "University of Minnesota--Twin Cities", "University of Pittsburgh", 
  "Michigan State University",
  
  // 41-50
  "Indiana University--Bloomington", "University of Colorado Boulder", "Arizona State University", 
  "University of Arizona", "University of Central Florida", "Florida State University", "University of Utah", 
  "Virginia Tech", "North Carolina State University", "University of Connecticut",
  
  // 51-60
  "University of Iowa", "University of South Carolina", "Clemson University", "Auburn University", 
  "University of Alabama--Tuscaloosa", "Louisiana State University--Baton Rouge", 
  "University of Arkansas--Fayetteville", "University of Oklahoma", "University of Kansas", "University of Missouri",
  
  // 61-70
  "University of Nebraska--Lincoln", "Washington State University", "Oregon State University", 
  "University of Kentucky", "University of Tennessee--Knoxville", "Iowa State University", 
  "University of New Hampshire", "University of Maine", "University of Vermont", "University of Delaware",
  
  // 71-80
  "University of Rhode Island", "University of Mississippi", "University of Montana", "University of Wyoming", 
  "University of Idaho", "University of North Dakota", "University of South Dakota", "West Virginia University", 
  "University of Hawaii at Manoa", "University of New Mexico",
  
  // 81-90
  "University of Nevada--Reno", "University of Alaska Fairbanks", "University of Texas at Dallas", 
  "Northeastern University", "Tulane University", "Villanova University", "Baylor University", 
  "Southern Methodist University", "George Washington University", "American University",
  
  // 91-100
  "Syracuse University", "Fordham University", "Loyola Marymount University", "Gonzaga University", 
  "Santa Clara University", "Chapman University", "Elon University", "University of Richmond", 
  "Wake Forest University", "Brigham Young University--Provo"
];

export const USNEWS_TOP50_LIBERAL_ARTS_COLLEGES = [
  "Williams College", "Amherst College", "Swarthmore College", "Pomona College",
  "Wellesley College", "Carleton College", "Claremont McKenna College", "Middlebury College",
  "Bowdoin College", "Washington and Lee University", "Grinnell College", "Vassar College",
  "Hamilton College", "Colby College", "Davidson College", "Haverford College",
  "Kenyon College", "Oberlin College", "Richmond, University of", "Skidmore College",
  "Union College", "Wake Forest University", "Wesleyan University", "Whitman College",
  "College of the Holy Cross", "Connecticut College", "Denison University", "Dickinson College",
  "Franklin and Marshall College", "Gettysburg College", "Hobart and William Smith Colleges",
  "Lafayette College", "Macalester College", "Mount Holyoke College", "Reed College",
  "Rhodes College", "Sarah Lawrence College", "Scripps College", "Sewanee--University of the South",
  "St. Olaf College", "Trinity College", "University of Puget Sound", "Ursinus College",
  "Villanova University", "Wheaton College (MA)", "Whitman College", "Willamette University",
  "Wofford College", "Allegheny College", "Bard College"
];

// 本科商学院排名（基于用户提供的权威排名数据）
export const BUSINESS_SCHOOL_RANKINGS = [
  "University of Pennsylvania", // #1
  "Massachusetts Institute of Technology", // #2 (Sloan有本科项目)
  "University of California--Berkeley", // #2
  "University of Michigan--Ann Arbor", // #4
  "New York University", // #5
  "Carnegie Mellon University", // #6
  "University of North Carolina--Chapel Hill", // #6
  "University of Texas at Austin", // #6
  "Cornell University", // #9
  "Indiana University--Bloomington", // #9
  "University of Southern California", // #9
  "University of Notre Dame", // #12
  "University of Virginia", // #12
  "Emory University", // #14
  "Georgetown University", // #14
  "Ohio State University", // #14
  "University of Illinois Urbana-Champaign", // #14
  "Georgia Institute of Technology", // #18
  "University of Minnesota--Twin Cities", // #18
  "University of Washington", // #18
  "University of Wisconsin--Madison", // #18
  "Washington University in St. Louis", // #18
  "Pennsylvania State University", // #23
  "University of Florida", // #23
  "University of Georgia", // #23
  "University of Maryland--College Park", // #23
  "Arizona State University", // #27
  "Boston College", // #27
  "Michigan State University", // #27
  "Purdue University", // #27
  "Rice University", // #27
  "Texas A&M University", // #27
  "University of Arizona", // #27
  "University of California--Irvine", // #27
  "University of Iowa", // #27
  "Babson College", // #36
  "Boston University", // #36
  "University of Colorado Boulder", // #36
  "Wake Forest University", // #36
  "Brigham Young University", // #40
  "Case Western Reserve University", // #40
  "George Washington University", // #40
  "Southern Methodist University", // #40
  "Syracuse University", // #40
  "Tulane University", // #40
  "University of Arkansas", // #40
  "University of Pittsburgh", // #40
  "University of Rochester", // #40
  "University of South Carolina", // #40
  "University of Tennessee", // #40
];

// 大学专业数据库 - 精确记录每所大学的本科专业
export const UNIVERSITY_MAJORS: Record<string, string[]> = {
  // 顶尖综合性大学
  "Harvard University": ["economics", "computer science", "engineering", "liberal arts", "pre-med"], // 哈佛本科无商学院
  "Stanford University": ["economics", "computer science", "engineering", "liberal arts"], // 斯坦福本科无商学院
  "Yale University": ["economics", "computer science", "engineering", "liberal arts"], // 耶鲁本科无商学院
  "Princeton University": ["economics", "computer science", "engineering", "liberal arts"], // 普林斯顿本科无商学院
  "Columbia University": ["economics", "engineering", "computer science", "liberal arts"], // 哥大本科无商学院
  "University of Chicago": ["economics", "liberal arts", "computer science"], // 芝大本科无商学院
  "Duke University": ["economics", "engineering", "computer science", "liberal arts"], // 杜克本科无商学院
  "Johns Hopkins University": ["engineering", "computer science", "pre-med", "liberal arts"], // JHU本科无商学院
  "California Institute of Technology": ["engineering", "computer science"], // 加州理工无商科
  
  // 有顶尖商学院的大学（从排名中确认）
  "University of Pennsylvania": ["business", "economics", "engineering", "computer science", "liberal arts"],
  "Massachusetts Institute of Technology": ["business", "computer science", "engineering", "economics"], // MIT Sloan有本科
  "University of California--Berkeley": ["business", "computer science", "engineering", "economics", "liberal arts", "environmental science"],
  "University of California--Los Angeles": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "University of California--San Diego": ["computer science", "engineering", "economics", "liberal arts", "environmental science"],
  "University of California--Davis": ["business", "engineering", "economics", "liberal arts", "environmental science"],
  "University of California--Irvine": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "University of California--Santa Barbara": ["business", "computer science", "engineering", "economics", "liberal arts", "environmental science"],
  "University of Michigan--Ann Arbor": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "New York University": ["business", "economics", "computer science", "liberal arts"],
  "Carnegie Mellon University": ["business", "computer science", "engineering", "economics"],
  "University of North Carolina--Chapel Hill": ["business", "computer science", "economics", "liberal arts"],
  "University of Texas at Austin": ["business", "computer science", "engineering", "economics"],
  "Cornell University": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "Indiana University--Bloomington": ["business", "computer science", "economics"],
  "University of Southern California": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "Georgetown University": ["business", "computer science", "economics", "liberal arts"],
  "Emory University": ["business", "computer science", "economics", "liberal arts"],
  "Washington University in St. Louis": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "University of Notre Dame": ["business", "computer science", "economics", "liberal arts"],
  "University of Virginia": ["business", "computer science", "economics", "liberal arts"],
  "Ohio State University": ["business", "computer science", "engineering", "economics"],
  "University of Illinois Urbana-Champaign": ["business", "computer science", "engineering", "economics"],
  "Georgia Institute of Technology": ["business", "engineering", "computer science"],
  "University of Minnesota--Twin Cities": ["business", "computer science", "engineering", "economics"],
  "University of Washington": ["business", "computer science", "engineering", "economics"],
  "University of Wisconsin--Madison": ["business", "computer science", "engineering", "economics"],
  "Washington University in St. Louis": ["business", "computer science", "engineering", "economics"],
  "Pennsylvania State University": ["business", "computer science", "engineering", "economics"],
  "University of Florida": ["business", "computer science", "engineering", "economics"],
  "University of Georgia": ["business", "computer science", "economics"],
  "University of Maryland--College Park": ["business", "computer science", "engineering", "economics"],
  "Arizona State University": ["business", "computer science", "engineering", "economics"],
  "Boston College": ["business", "computer science", "economics", "liberal arts"],
  "Michigan State University": ["business", "computer science", "engineering", "economics"],
  "Purdue University": ["business", "computer science", "engineering", "economics"],
  "Rice University": ["business", "computer science", "engineering", "economics"],
  "Texas A&M University": ["business", "computer science", "engineering", "economics"],
  "University of Arizona": ["business", "computer science", "engineering", "economics"],
  "University of California--Irvine": ["business", "computer science", "engineering", "economics"],
  "University of Iowa": ["business", "computer science", "economics"],
  "Babson College": ["business", "economics"], // 商科专门学院
  "Boston University": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "University of Colorado Boulder": ["business", "computer science", "engineering", "economics"],
  "Wake Forest University": ["business", "computer science", "economics", "liberal arts"],
  "Brigham Young University": ["business", "computer science", "engineering", "economics"],
  "Case Western Reserve University": ["business", "computer science", "engineering", "economics"],
  "George Washington University": ["business", "computer science", "economics", "liberal arts"],
  "Southern Methodist University": ["business", "computer science", "engineering", "economics"],
  "Syracuse University": ["business", "computer science", "economics", "liberal arts"],
  "Tulane University": ["business", "computer science", "economics", "liberal arts"],
  "University of Arkansas": ["business", "computer science", "engineering", "economics"],
  "University of Pittsburgh": ["business", "computer science", "engineering", "economics"],
  "University of Rochester": ["business", "computer science", "economics", "engineering"],
  "University of South Carolina": ["business", "computer science", "economics"],
  "University of Tennessee": ["business", "computer science", "engineering", "economics"],
  
  // 其他常见大学
  "University of Central Florida": ["business", "computer science", "engineering", "environmental science"],
  "Florida State University": ["business", "computer science", "economics", "environmental science"],
  "Auburn University": ["business", "computer science", "engineering", "environmental science"],
  "University of Alabama--Tuscaloosa": ["business", "computer science", "economics"],
  "University of Vermont": ["environmental science", "liberal arts"],
  "Colorado State University": ["environmental science", "engineering"],
  "Oregon State University": ["environmental science", "engineering"],
  "University of New Hampshire": ["environmental science", "liberal arts"],
  "University of Maine": ["environmental science", "engineering"],
  "University of Nevada--Las Vegas": ["liberal arts", "business"],
  "University of New Mexico": ["liberal arts", "engineering"],
  "University of Hawaii at Manoa": ["liberal arts", "environmental science"],
  "Portland State University": ["liberal arts", "engineering"],
  "University of Oregon": ["liberal arts", "business"],
  "Washington State University": ["liberal arts", "engineering", "business"],
  "University of Idaho": ["liberal arts", "engineering"],
  "University of Montana": ["liberal arts", "environmental science"],
};

// 根据专业筛选合适的大学
export function getUniversitiesForMajor(major: string): string[] {
  const majorKey = getMajorKey(major);
  const suitableUniversities: string[] = [];
  
  Object.entries(UNIVERSITY_MAJORS).forEach(([university, majors]) => {
    if (majors.includes(majorKey)) {
      suitableUniversities.push(university);
    }
  });
  
  return suitableUniversities;
}

// 将中文专业名转换为标准化的英文key
function getMajorKey(major: string): string {
  const majorLower = major.toLowerCase();
  if (majorLower.includes('business') || majorLower.includes('商科') || majorLower.includes('管理') || majorLower.includes('金融')) {
    return 'business';
  } else if (majorLower.includes('computer') || majorLower.includes('计算机') || majorLower.includes('软件')) {
    return 'computer science';
  } else if (majorLower.includes('engineering') || majorLower.includes('工程')) {
    return 'engineering';
  } else if (majorLower.includes('economics') || majorLower.includes('经济')) {
    return 'economics';
  } else if (majorLower.includes('环境') || majorLower.includes('environmental')) {
    return 'environmental science';
  } else if (majorLower.includes('社会') || majorLower.includes('sociology')) {
    return 'liberal arts';
  } else if (majorLower.includes('心理') || majorLower.includes('psychology')) {
    return 'liberal arts';
  } else if (majorLower.includes('历史') || majorLower.includes('history')) {
    return 'liberal arts';
  } else if (majorLower.includes('政治') || majorLower.includes('political')) {
    return 'liberal arts';
  } else if (majorLower.includes('英语') || majorLower.includes('english')) {
    return 'liberal arts';
  } else if (majorLower.includes('哲学') || majorLower.includes('philosophy')) {
    return 'liberal arts';
  } else if (majorLower.includes('艺术') || majorLower.includes('art')) {
    return 'liberal arts';
  } else if (majorLower.includes('传媒') || majorLower.includes('media') || majorLower.includes('communication')) {
    return 'liberal arts';
  } else if (majorLower.includes('liberal') || majorLower.includes('文科') || majorLower.includes('人文')) {
    return 'liberal arts';
  }
  return 'liberal arts'; // 默认归类为文科
}

// 基于命理因素的大学优先级排序
function sortUniversitiesByMetaphysics(universities: string[], major: string, birthYear: number, birthMonth: number): string[] {
  // 根据出生年份计算五行属性
  const yearElement = getYearElement(birthYear);
  const monthElement = getMonthElement(birthMonth);
  
  // 为每所大学计算命理匹配度分数
  const scoredUniversities = universities.map(uni => {
    let score = 0;
    
    // 地理位置五行匹配（东木、南火、中土、西金、北水）
    if (uni.includes("California") || uni.includes("UCLA") || uni.includes("USC")) {
      score += yearElement === "fire" ? 30 : yearElement === "earth" ? 20 : 10;
    } else if (uni.includes("New York") || uni.includes("Boston") || uni.includes("Harvard")) {
      score += yearElement === "water" ? 30 : yearElement === "wood" ? 20 : 10;
    } else if (uni.includes("Texas") || uni.includes("Arizona") || uni.includes("Florida")) {
      score += yearElement === "fire" ? 30 : yearElement === "earth" ? 20 : 10;
    } else if (uni.includes("Michigan") || uni.includes("Ohio") || uni.includes("Illinois")) {
      score += yearElement === "earth" ? 30 : yearElement === "metal" ? 20 : 10;
    }
    
    // 专业与五行匹配
    if (major.includes("商") || major.includes("business")) {
      score += yearElement === "metal" ? 20 : yearElement === "earth" ? 15 : 10;
    } else if (major.includes("工程") || major.includes("engineering")) {
      score += yearElement === "metal" ? 20 : yearElement === "water" ? 15 : 10;
    } else if (major.includes("计算机") || major.includes("computer")) {
      score += yearElement === "water" ? 20 : yearElement === "metal" ? 15 : 10;
    }
    
    // 月份季节匹配
    if (birthMonth >= 3 && birthMonth <= 5) { // 春季
      score += uni.includes("Forest") || uni.includes("Green") ? 15 : 5;
    } else if (birthMonth >= 6 && birthMonth <= 8) { // 夏季
      score += uni.includes("California") || uni.includes("Arizona") ? 15 : 5;
    }
    
    return { university: uni, score };
  });
  
  // 按分数排序，分数高的在前
  return scoredUniversities
    .sort((a, b) => b.score - a.score)
    .map(item => item.university);
}

// 根据出生年份获取五行属性
function getYearElement(year: number): string {
  const elements = ["metal", "water", "wood", "fire", "earth"];
  return elements[(year - 1984) % 5]; // 简化的五行计算
}

// 根据出生月份获取五行属性
function getMonthElement(month: number): string {
  if (month >= 2 && month <= 4) return "wood";
  if (month >= 5 && month <= 7) return "fire";
  if (month >= 8 && month <= 10) return "metal";
  if (month >= 11 || month <= 1) return "water";
  return "earth";
}

// 根据申请材料水平和专业推荐合适排名的大学，按命理因素排序
export function getUniversitiesByLevel(materialLevel: string, major: string, birthYear?: number, birthMonth?: number) {
  // 首先根据专业筛选合适的大学
  const suitableUniversities = getUniversitiesForMajor(major);
  console.log(`为专业"${major}"筛选到${suitableUniversities.length}所合适的大学`);
  
  // 从专业筛选的大学中选择合适的推荐
  let candidates: string[];
  if (suitableUniversities.length === 0) {
    console.log("警告：没有找到合适专业的大学，使用默认列表");
    candidates = USNEWS_TOP100_UNIVERSITIES.slice(20, 80); // 中低档次大学
  } else {
    candidates = suitableUniversities;
  }
  
  // 根据申请材料水平选择合适的大学范围
  let recommendedUniversities: string[] = [];
  
  if (materialLevel === "excellent") {
    // 极好材料 - 可以推荐顶尖大学
    const topTierCandidates = candidates.filter(uni => {
      const majorKey = getMajorKey(major);
      if (majorKey === "business") {
        return BUSINESS_SCHOOL_RANKINGS.slice(0, 15).includes(uni);
      } else {
        return USNEWS_TOP100_UNIVERSITIES.slice(0, 20).includes(uni);
      }
    });
    recommendedUniversities = topTierCandidates.slice(0, 15);
    
  } else if (materialLevel === "good") {
    // 较好材料 - 推荐中上等大学
    const goodTierCandidates = candidates.filter(uni => {
      const majorKey = getMajorKey(major);
      if (majorKey === "business") {
        return BUSINESS_SCHOOL_RANKINGS.slice(10, 30).includes(uni);
      } else {
        return USNEWS_TOP100_UNIVERSITIES.slice(15, 40).includes(uni);
      }
    });
    recommendedUniversities = goodTierCandidates.slice(0, 15);
    
  } else if (materialLevel === "average") {
    // 一般材料 - 推荐中等大学
    const averageTierCandidates = candidates.filter(uni => {
      const majorKey = getMajorKey(major);
      if (majorKey === "business") {
        return BUSINESS_SCHOOL_RANKINGS.slice(20, 50).includes(uni);
      } else {
        return USNEWS_TOP100_UNIVERSITIES.slice(30, 70).includes(uni);
      }
    });
    recommendedUniversities = averageTierCandidates.slice(0, 15);
    
  } else if (materialLevel === "poor") {
    // 较差材料 - 推荐中下等大学
    const poorTierCandidates = candidates.filter(uni => {
      const majorKey = getMajorKey(major);
      if (majorKey === "business") {
        return BUSINESS_SCHOOL_RANKINGS.slice(40, 80).includes(uni);
      } else {
        return USNEWS_TOP100_UNIVERSITIES.slice(50, 90).includes(uni);
      }
    });
    recommendedUniversities = poorTierCandidates.slice(0, 15);
    
  } else { // very-poor
    // 极差材料 - 推荐较低档次大学
    const basicTierCandidates = candidates.filter(uni => {
      const majorKey = getMajorKey(major);
      if (majorKey === "business") {
        return BUSINESS_SCHOOL_RANKINGS.slice(60, 100).includes(uni);
      } else {
        return USNEWS_TOP100_UNIVERSITIES.slice(70, 100).includes(uni);
      }
    });
    recommendedUniversities = basicTierCandidates.slice(0, 15);
  }
  
  // 如果推荐数量不足15所，从其他合适但较低排名的大学补充
  if (recommendedUniversities.length < 15) {
    const remaining = candidates.filter(uni => !recommendedUniversities.includes(uni));
    // 优先补充州立大学和地区性大学
    const stateFallback = ["University of Vermont", "University of Maine", "Oregon State University", 
                          "University of New Hampshire", "Colorado State University", "University of Connecticut",
                          "University of Delaware", "University of Rhode Island"];
    const fallbackOptions = [...remaining, ...stateFallback.filter(uni => !recommendedUniversities.includes(uni))];
    recommendedUniversities = [...recommendedUniversities, ...fallbackOptions].slice(0, 15);
  }
  
  // 应用命理因素排序
  if (birthYear && birthMonth && recommendedUniversities.length > 0) {
    recommendedUniversities = sortUniversitiesByMetaphysics(recommendedUniversities, major, birthYear, birthMonth);
    console.log(`应用命理排序后的推荐: ${JSON.stringify(recommendedUniversities.slice(0, 15))}`);
  }
  
  console.log(`最终推荐15所大学: ${JSON.stringify(recommendedUniversities.slice(0, 15))}`);
  return recommendedUniversities.slice(0, 15);
}