import { useEffect, useState } from 'react';
import { getStudents, getHomework, getSubjects } from '../api/edulite';
import { Student } from '../data/mockData';
type Homework = { homework_id: string; title: string; due_date: string; status: string };

const getRecentGrades = () => [
  { subject: 'Mathematics', grade: 'A' },
  { subject: 'English', grade: 'B+' },
];

const ParentDashboard = () => {
  const [children, setChildren] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);

  useEffect(() => {
    // In a real app, fetch children for the logged-in parent
    getStudents().then(res => {
      // For demo, just use the first two students as children
      setChildren(res.data ? res.data.slice(0, 2) : []);
    });
    getHomework().then(res => {
      setHomework(res.data || []);
    });
  }, []);

  const getUpcomingHomework = (studentId: string) =>
    homework.filter((hw: Homework) => hw.status === 'pending').slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Parent Dashboard</h2>
        <p className="text-muted-foreground">Welcome! Here's a summary of your children's progress.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map(child => (
          <div key={child.student_id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-4">
              {/* Child Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{child.full_name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>Grade: <span className="font-medium text-foreground">{child.grade}</span></span>
                    <span>Status: <span className="font-medium text-foreground capitalize">{child.status}</span></span>
                  </div>
                </div>
              </div>
              
              {/* Recent Grades */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Recent Grades</h4>
                <div className="rounded-md border bg-background">
                  <ul className="divide-y">
                    {getRecentGrades().map((g, i) => (
                      <li key={i} className="px-3 py-2 flex items-center justify-between">
                        <span className="text-sm text-foreground">{g.subject}</span>
                        <span className="text-sm font-medium text-primary">{g.grade}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Upcoming Homework */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Upcoming Homework</h4>
                <div className="rounded-md border bg-background">
                  {getUpcomingHomework(child.student_id).length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No upcoming homework
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {getUpcomingHomework(child.student_id).map(hw => (
                        <li key={hw.homework_id} className="px-3 py-2">
                          <div className="text-sm text-foreground">{hw.title}</div>
                          <div className="text-xs text-muted-foreground">Due: {hw.due_date}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {children.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Children Found</h3>
          <p className="text-muted-foreground">Please contact your administrator to link your children to your account.</p>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard; 