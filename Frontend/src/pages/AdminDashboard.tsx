import { useEffect, useState } from 'react';
import { getStudents, getTeachers, getClasses, getSubjects, getHomework } from '../api/edulite';
type Homework = { homework_id: string; title: string; due_date: string; status: string; subject_id: string; description?: string; feedback?: string };

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Students', value: 0 },
    { label: 'Total Teachers', value: 0 },
    { label: 'Total Classes', value: 0 },
    { label: 'Total Subjects', value: 0 },
  ]);
  const [recentHomework, setRecentHomework] = useState<Homework[]>([]);

  useEffect(() => {
    Promise.all([
      getStudents(),
      getTeachers(),
      getClasses(),
      getSubjects(),
      getHomework()
    ]).then(([studentsRes, teachersRes, classesRes, subjectsRes, homeworkRes]) => {
      setStats([
        { label: 'Total Students', value: typeof studentsRes.total === 'number' ? studentsRes.total : (studentsRes.data || []).length },
        { label: 'Total Teachers', value: typeof teachersRes.total === 'number' ? teachersRes.total : (teachersRes.data || []).length },
        { label: 'Total Classes', value: typeof classesRes.total === 'number' ? classesRes.total : (classesRes.data || []).length },
        { label: 'Total Subjects', value: typeof subjectsRes.total === 'number' ? subjectsRes.total : (subjectsRes.data || []).length },
      ]);
      setRecentHomework(((homeworkRes.data || []) as Homework[]).slice(0, 5));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of school management system statistics and recent activity</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Recent Homework Activity</h3>
            <div className="text-sm text-muted-foreground">Latest assignments and submissions</div>
          </div>
          
          <div className="space-y-3">
            {recentHomework.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-muted-foreground">No recent homework activity</p>
              </div>
            ) : (
              recentHomework.map((hw: Homework) => (
                <div key={hw.homework_id} className="rounded-lg border bg-background p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium text-foreground">{hw.title}</div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Due: {hw.due_date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`h-2 w-2 rounded-full ${
                            hw.status === 'pending' ? 'bg-warning' :
                            hw.status === 'submitted' ? 'bg-info' :
                            'bg-success'
                          }`}></div>
                          <span className="capitalize">{hw.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 