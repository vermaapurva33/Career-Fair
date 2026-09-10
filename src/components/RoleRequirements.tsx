import type { Role } from "../types";

interface RoleRequirementsProps {
  roles: Role[];
}

function RoleRequirements({ roles }: RoleRequirementsProps) {
  return (
    <fieldset>
      <legend>Role Requirements</legend>
      <table>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Branches</th>
            <th scope="col">Min CGPA</th>
            <th scope="col">Graduation Years</th>
            <th scope="col">Max Backlogs</th>
            <th scope="col">Required Skills</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <th scope="row">
                {role.title} ({role.id})
              </th>
              <td>{role.allowedBranches.join(", ")}</td>
              <td>{role.minimumCgpa}</td>
              <td>{role.allowedGraduationYears.join(", ")}</td>
              <td>{role.maximumActiveBacklogs}</td>
              <td>{role.requiredSkills.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </fieldset>
  );
}

export default RoleRequirements;