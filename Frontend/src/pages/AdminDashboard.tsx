import { useEffect, useState } from 'react';
import { getStudents, getTeachers, getClasses, getSubjects, getHomework } from '../api/edulite';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Students', value: 0 },
    { label: 'Total Teachers', value: 0 },
    { label: 'Total Classes', value: 0 },
    { label: 'Total Subjects', value: 0 },
  ]);
  const [recentHomework, setRecentHomework] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getStudents(),
      getTeachers(),
      getClasses(),
      getSubjects(),
      getHomework()
    ]).then(([studentsRes, teachersRes, classesRes, subjectsRes, homeworkRes]) => {
      setStats([
        { label: 'Total Students', value: (studentsRes.data || []).length },
        { label: 'Total Teachers', value: (teachersRes.data || []).length },
        { label: 'Total Classes', value: (classesRes.data || []).length },
        { label: 'Total Subjects', value: (subjectsRes.data || []).length },
      ]);
      setRecentHomework((homeworkRes.data || []).slice(0, 5));
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="p-4 border rounded-lg shadow-card bg-white text-center">
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
            recentHomework.map(hw => (
              <li key={hw.homework_id} className="p-3 border rounded bg-muted">
                <div className="font-medium">{hw.title}</div>
                <div className="text-sm text-muted-foreground">Due: {hw.due_date}</div>
                <div className="text-xs text-muted-foreground">Status: {hw.status}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard; 