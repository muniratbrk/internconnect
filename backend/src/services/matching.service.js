/**
 * InternConnect Matching & Recommendation Service (Ethiopian & Academic Taxonomy)
 * 
 * Computes compatibility score (0 - 100%) between a student and an internship posting.
 * Incorporates:
 * 1. Skill Overlap (50%)
 * 2. Academic Department Alignment (15%)
 * 3. Field of Study Alignment (15%)
 * 4. Location / Remote Preference (20%)
 */

function calculateMatchScore(student, internship) {
  if (!student) {
    return {
      overallScore: 0,
      skillsScore: 0,
      departmentScore: 0,
      fieldScore: 0,
      locationScore: 0,
      matchingSkills: [],
      missingSkills: internship.required_skills || [],
    };
  }

  const studentSkills = (student.skills || []).map((s) => s.trim().toLowerCase());
  const requiredSkills = (internship.required_skills || []).map((s) => s.trim().toLowerCase());

  // 1. Skill Overlap (50% weight)
  let skillsScore = 0;
  const matchingSkills = [];
  const missingSkills = [];

  if (requiredSkills.length > 0) {
    requiredSkills.forEach((reqSkill) => {
      const isMatch = studentSkills.some(
        (studSkill) => studSkill === reqSkill || studSkill.includes(reqSkill) || reqSkill.includes(studSkill)
      );
      if (isMatch) {
        matchingSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });
    skillsScore = Math.round((matchingSkills.length / requiredSkills.length) * 50);
  } else {
    skillsScore = 50; // No hard requirements
  }

  // 2. Department Alignment (15% weight)
  let departmentScore = 0;
  if (!internship.department) {
    departmentScore = 15; // Open to all departments
  } else if (student.department) {
    const sDept = student.department.trim().toLowerCase();
    const iDept = internship.department.trim().toLowerCase();
    if (sDept === iDept || sDept.includes(iDept) || iDept.includes(sDept)) {
      departmentScore = 15;
    } else {
      // Partial credit for adjacent STEM/Tech departments
      const techDepts = ['software engineering', 'computer science', 'information technology', 'electrical & computer engineering'];
      if (techDepts.includes(sDept) && techDepts.includes(iDept)) {
        departmentScore = 10;
      }
    }
  }

  // 3. Field of Study Alignment (15% weight)
  let fieldScore = 0;
  if (!internship.field_of_study) {
    fieldScore = 15; // Open to all fields
  } else if (student.field_of_study) {
    const sField = student.field_of_study.trim().toLowerCase();
    const iField = internship.field_of_study.trim().toLowerCase();
    if (sField === iField || sField.includes(iField) || iField.includes(sField)) {
      fieldScore = 15;
    } else {
      fieldScore = 5;
    }
  }

  // 4. Location / Remote Match (20% weight)
  let locationScore = 0;
  if (internship.is_remote) {
    locationScore = 20; // 100% of location score for remote roles
  } else if (student.location && internship.location) {
    const sLoc = student.location.toLowerCase();
    const iLoc = internship.location.toLowerCase();
    if (sLoc === iLoc || iLoc.includes(sLoc) || sLoc.includes(iLoc)) {
      locationScore = 20;
    } else {
      // Check for common Ethiopian cities / regions (e.g. Addis Ababa, Adama, Hawassa, Bahir Dar)
      const cities = ['addis ababa', 'adama', 'hawassa', 'bahir dar', 'dire dawa', 'jimma', 'mekelle'];
      const matchedCity = cities.find((city) => sLoc.includes(city) && iLoc.includes(city));
      locationScore = matchedCity ? 20 : 8;
    }
  } else {
    locationScore = 10;
  }

  const overallScore = Math.min(100, Math.max(0, skillsScore + departmentScore + fieldScore + locationScore));

  return {
    overallScore,
    skillsScore,
    departmentScore,
    fieldScore,
    locationScore,
    matchingSkills,
    missingSkills,
  };
}

module.exports = {
  calculateMatchScore,
};
