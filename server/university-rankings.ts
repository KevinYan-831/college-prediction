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
  "University of California--Berkeley": ["business", "computer science", "engineering", "economics"],
  "University of Michigan--Ann Arbor": ["business", "computer science", "engineering", "economics"],
  "New York University": ["business", "economics", "computer science", "liberal arts"],
  "Carnegie Mellon University": ["business", "computer science", "engineering", "economics"],
  "University of North Carolina--Chapel Hill": ["business", "computer science", "economics", "liberal arts"],
  "University of Texas at Austin": ["business", "computer science", "engineering", "economics"],
  "Cornell University": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "Indiana University--Bloomington": ["business", "computer science", "economics"],
  "University of Southern California": ["business", "computer science", "engineering", "economics"],
  "University of Notre Dame": ["business", "computer science", "economics", "liberal arts"],
  "University of Virginia": ["business", "computer science", "economics", "liberal arts"],
  "Emory University": ["business", "computer science", "economics", "liberal arts"],
  "Georgetown University": ["business", "computer science", "economics", "liberal arts"],
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
  "University of New Hampshire": ["environmental science"],
  "University of Maine": ["environmental science", "engineering"],
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
  } else if (majorLower.includes('liberal') || majorLower.includes('文科') || majorLower.includes('人文')) {
    return 'liberal arts';
  }
  return 'liberal arts'; // 默认归类为文科
}

// 根据申请材料水平和成绩推荐合适排名的大学
export function getUniversitiesByLevel(materialLevel: string, score: number, testType: string, major: string) {
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
  
  // 根据学生水平更严格地筛选合适的大学
  let recommendedUniversities: string[] = [];
  
  if (materialLevel === "excellent" && testType === "toefl" && score >= 110) {
    // 顶尖水平 - 推荐排名前20的大学（如果专业匹配）
    const topTier = candidates.filter(uni => 
      ["University of Pennsylvania", "Massachusetts Institute of Technology", 
       "University of California--Berkeley", "University of Michigan--Ann Arbor",
       "New York University", "Carnegie Mellon University", "Duke University",
       "University of North Carolina--Chapel Hill", "Cornell University"].includes(uni)
    );
    recommendedUniversities = topTier.slice(0, 8);
    
    // 补充一些稍次一级的优秀大学
    const secondTier = candidates.filter(uni => 
      !topTier.includes(uni) && BUSINESS_SCHOOL_RANKINGS.slice(0, 30).includes(uni)
    );
    recommendedUniversities = [...recommendedUniversities, ...secondTier.slice(0, 7)];
    
  } else if (materialLevel === "good" && testType === "toefl" && score >= 105) {
    // 优秀水平 - 推荐排名20-50的大学
    const highTier = candidates.filter(uni => 
      !["University of Pennsylvania", "Harvard University", "Stanford University", 
        "Massachusetts Institute of Technology", "Princeton University"].includes(uni) &&
      BUSINESS_SCHOOL_RANKINGS.slice(5, 40).includes(uni)
    );
    recommendedUniversities = highTier.slice(0, 15);
    
  } else if (materialLevel === "average" && testType === "toefl" && score >= 95) {
    // 中等水平 - 推荐排名40-80的大学
    const midTier = candidates.filter(uni => 
      USNEWS_TOP100_UNIVERSITIES.slice(35, 75).includes(uni) ||
      ["University of Central Florida", "Florida State University", "Auburn University",
       "University of Alabama--Tuscaloosa", "University of South Carolina"].includes(uni)
    );
    recommendedUniversities = midTier.slice(0, 15);
    
  } else {
    // 基础水平 - 推荐排名较低的州立大学和地区性大学
    const basicTier = candidates.filter(uni => 
      USNEWS_TOP100_UNIVERSITIES.slice(50, 100).includes(uni) ||
      ["University of Central Florida", "Florida State University", "Auburn University",
       "University of Alabama--Tuscaloosa", "University of Vermont", "University of Maine",
       "Oregon State University", "University of New Hampshire"].includes(uni)
    );
    recommendedUniversities = basicTier.slice(0, 15);
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
  
  console.log(`最终推荐${recommendedUniversities.length}所大学:`, recommendedUniversities.slice(0, 5));
  return recommendedUniversities;
}