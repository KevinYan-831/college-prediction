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

// 大学专业数据库 - 精确记录每所大学的本科专业
export const UNIVERSITY_MAJORS: Record<string, string[]> = {
  // 顶尖综合性大学（有商科）
  "Harvard University": ["business", "economics", "computer science", "engineering", "liberal arts", "pre-med"],
  "Stanford University": ["business", "computer science", "engineering", "economics", "liberal arts"],
  "University of Pennsylvania": ["business", "economics", "engineering", "computer science", "liberal arts"],
  "Columbia University": ["business", "economics", "engineering", "computer science", "liberal arts"],
  "New York University": ["business", "economics", "computer science", "liberal arts"],
  "University of Southern California": ["business", "computer science", "engineering", "economics"],
  "Boston University": ["business", "computer science", "engineering", "economics", "liberal arts"],
  
  // 顶尖理工科大学（无商科本科）
  "Massachusetts Institute of Technology": ["computer science", "engineering", "economics"],
  "California Institute of Technology": ["engineering", "computer science"],
  "Georgia Institute of Technology": ["engineering", "computer science"],
  "Carnegie Mellon University": ["computer science", "engineering", "economics"],
  
  // 顶尖文理学院（通常无商科本科）
  "University of Chicago": ["economics", "liberal arts", "computer science"],
  "Duke University": ["economics", "engineering", "computer science", "liberal arts"],
  "Johns Hopkins University": ["engineering", "computer science", "pre-med", "liberal arts"],
  
  // 州立大学（通常有商科）
  "University of California--Berkeley": ["business", "computer science", "engineering", "economics"],
  "University of California--Los Angeles": ["business", "computer science", "engineering", "economics"],
  "University of Michigan--Ann Arbor": ["business", "computer science", "engineering", "economics"],
  "University of Texas at Austin": ["business", "computer science", "engineering", "economics"],
  "University of Florida": ["business", "computer science", "engineering", "economics"],
  "University of Illinois Urbana-Champaign": ["business", "computer science", "engineering", "economics"],
  "University of Washington": ["business", "computer science", "engineering", "economics"],
  "Ohio State University": ["business", "computer science", "engineering", "economics"],
  "Purdue University": ["business", "computer science", "engineering", "economics"],
  "University of Wisconsin--Madison": ["business", "computer science", "engineering", "economics"],
  "University of Virginia": ["business", "computer science", "economics", "liberal arts"],
  "University of North Carolina--Chapel Hill": ["business", "computer science", "economics", "liberal arts"],
  "University of Georgia": ["business", "computer science", "economics"],
  "University of Central Florida": ["business", "computer science", "engineering"],
  "Florida State University": ["business", "computer science", "economics"],
  "University of South Carolina": ["business", "computer science", "economics"],
  "Auburn University": ["business", "computer science", "engineering"],
  "University of Alabama--Tuscaloosa": ["business", "computer science", "economics"],
  "Arizona State University": ["business", "computer science", "engineering", "economics"],
  "University of Arizona": ["business", "computer science", "engineering", "economics"],
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
  } else if (majorLower.includes('liberal') || majorLower.includes('文科') || majorLower.includes('人文')) {
    return 'liberal arts';
  }
  return 'liberal arts'; // 默认归类为文科
}

// 根据申请材料水平和成绩推荐合适排名的大学
export function getUniversitiesByLevel(materialLevel: string, score: number, testType: string, major: string) {
  // 首先根据专业筛选合适的大学
  const suitableUniversities = getUniversitiesForMajor(major);
  
  const isBusiness = major.toLowerCase().includes('business') || 
                     major.toLowerCase().includes('商科') ||
                     major.toLowerCase().includes('商业');
  
  // 根据托福/雅思成绩和申请材料水平确定推荐排名范围
  let rankingRange: [number, number] = [90, 100]; // 默认最低排名
  
  if (materialLevel === "very-poor") {
    if (testType === "toefl" && score < 80) {
      rankingRange = [80, 100]; // 社区大学或排名很低的大学
    } else if (testType === "toefl" && score >= 80 && score < 100) {
      rankingRange = [60, 80]; // 中低排名州立大学
    } else {
      rankingRange = [50, 70]; // 中等排名大学
    }
  } else if (materialLevel === "poor") {
    if (testType === "toefl" && score >= 90) {
      rankingRange = [40, 60];
    } else {
      rankingRange = [60, 80];
    }
  } else if (materialLevel === "average") {
    if (testType === "toefl" && score >= 100) {
      rankingRange = [30, 50];
    } else {
      rankingRange = [40, 60];
    }
  } else if (materialLevel === "good") {
    if (testType === "toefl" && score >= 105) {
      rankingRange = [15, 35];
    } else {
      rankingRange = [25, 45];
    }
  } else if (materialLevel === "excellent") {
    if (testType === "toefl" && score >= 110) {
      rankingRange = [1, 20];
    } else {
      rankingRange = [10, 30];
    }
  }
  
  // 获取推荐的大学列表
  const universities = USNEWS_TOP100_UNIVERSITIES.slice(rankingRange[0] - 1, rankingRange[1]);
  const liberalArts = USNEWS_TOP50_LIBERAL_ARTS_COLLEGES.slice(
    Math.floor(rankingRange[0] / 2) - 1, 
    Math.floor(rankingRange[1] / 2)
  );
  
  // 如果是商科，过滤掉没有商科的大学
  if (isBusiness) {
    const businessFriendlyUniversities = universities.filter(uni => 
      !["Harvard University", "Stanford University", "Princeton University", 
        "Yale University", "Massachusetts Institute of Technology"].includes(uni)
    );
    return [...businessFriendlyUniversities.slice(0, 10), ...liberalArts.slice(0, 5)];
  }
  
  return [...universities.slice(0, 10), ...liberalArts.slice(0, 5)];
}