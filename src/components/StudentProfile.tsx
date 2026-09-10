import type { Student } from "../types";

interface StudentProfileProps {
  student: Student;
  onChange: (next: Student) => void;
}

function StudentProfile({ student, onChange }: StudentProfileProps) {
  return (
    <fieldset>
      <legend>Student Profile</legend>

      <div>
        <label>
          Branch:{" "}
          <input
            value={student.branch}
            onChange={(e) => onChange({ ...student, branch: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          CGPA:{" "}
          <input
            value={student.cgpa}
            onChange={(e) => onChange({ ...student, cgpa: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          Graduation Year:{" "}
          <input
            value={student.graduationYear}
            onChange={(e) =>
              onChange({ ...student, graduationYear: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Active Backlogs:{" "}
          <input
            value={student.activeBacklogs}
            onChange={(e) =>
              onChange({ ...student, activeBacklogs: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Skills:{" "}
          <input
            value={student.skills}
            onChange={(e) => onChange({ ...student, skills: e.target.value })}
          />
        </label>
      </div>
    </fieldset>
  );
}

export default StudentProfile;