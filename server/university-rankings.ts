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

// 根据申请材料水平和成绩推荐合适排名的大学
export function getUniversitiesByLevel(materialLevel: string, score: number, testType: string, major: string) {
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