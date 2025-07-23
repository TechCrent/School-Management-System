import { useEffect, useState } from 'react';
import { mockSubjects, mockStudents, Student } from '../data/mockData';

// Mock grades data for demonstration
const mockGrades = [
  { subject_id: 'sub_1', grade: 'A', comment: 'Excellent work!' },
  { subject_id: 'sub_2', grade: 'B+', comment: 'Good effort, keep improving.' },
  { subject_id: 'sub_3', grade: 'A-', comment: 'Great participation.' },
  { subject_id: 'sub_4', grade: 'B', comment: 'Solid understanding.' },
  { subject_id: 'sub_5', grade: 'A', comment: 'Very creative.' },
];

const ReportCard = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<typeof mockGrades>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}') as Student;
    setStudent(user);
    // In a real app, fetch grades for this student
    setGrades(mockGrades);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Report Card</h2>
      {student ? (
        <>
          <div className="mb-4">Name: <span className="font-semibold">{student.full_name}</span></div>
          <div className="mb-4">Grade: <span className="font-semibold">{student.grade}</span></div>
          <table className="w-full border rounded-lg shadow-card mb-6">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-left">Grade</th>
                <th className="p-2 text-left">Teacher Comment</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(g => {
                const subject = mockSubjects.find(s => s.subject_id === g.subject_id);
                return (
                  <tr key={g.subject_id} className="border-t">
                    <td className="p-2">{subject ? subject.name : g.subject_id}</td>
                    <td className="p-2 font-semibold">{g.grade}</td>
                    <td className="p-2">{g.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <div>Student profile not found.</div>
      )}
    </div>
  );
};

export default ReportCard; 