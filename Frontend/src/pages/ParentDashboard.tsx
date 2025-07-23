import { useEffect, useState } from 'react';
import { mockStudents, mockHomework, mockSubjects } from '../data/mockData';

// Mock parent data: parent sees these children
const mockParentChildren = [
  mockStudents[0],
  mockStudents[1],
];

const getRecentGrades = () => [
  { subject: 'Mathematics', grade: 'A' },
  { subject: 'English', grade: 'B+' },
];

const getUpcomingHomework = (studentId: string) =>
  mockHomework.filter(hw => hw.status === 'pending').slice(0, 2);

const ParentDashboard = () => {
  const [children, setChildren] = useState<typeof mockParentChildren>([]);

  useEffect(() => {
    // In a real app, fetch children for the logged-in parent
    setChildren(mockParentChildren);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Parent Dashboard</h2>
      <div className="mb-6">Welcome! Here’s a summary of your children’s progress.</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map(child => (
          <div key={child.student_id} className="p-4 border rounded-lg shadow-card bg-white">
            <div className="font-semibold text-lg mb-1">{child.full_name}</div>
            <div className="mb-1">Grade: <span className="font-semibold">{child.grade}</span></div>
            <div className="mb-2">Status: <span className="font-semibold capitalize">{child.status}</span></div>
            <div className="mb-2">
              <div className="font-semibold mb-1">Recent Grades:</div>
              <ul className="list-disc ml-6">
                {getRecentGrades().map((g, i) => (
                  <li key={i}>{g.subject}: <span className="font-semibold">{g.grade}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1">Upcoming Homework:</div>
              <ul className="list-disc ml-6">
                {getUpcomingHomework(child.student_id).map(hw => (
                  <li key={hw.homework_id}>{hw.title} (Due: {hw.due_date})</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentDashboard; 