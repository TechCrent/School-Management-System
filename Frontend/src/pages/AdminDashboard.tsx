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
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="p-4 border rounded-lg shadow-card bg-card text-card-foreground text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Recent Homework Activity</h3>
        <ul className="space-y-2">
          {recentHomework.length === 0 ? (
            <li className="text-muted-foreground">No recent homework.</li>
          ) : (
            recentHomework.map((hw: Homework) => (
              <li key={hw.homework_id} className="p-3 border rounded bg-muted text-muted-foreground">
                <div className="font-medium text-foreground">{hw.title}</div>
                <div className="text-sm">Due: {hw.due_date}</div>
                <div className="text-xs">Status: {hw.status}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard; 