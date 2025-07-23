import { mockStudents, mockTeachers, mockClasses, mockSubjects, mockHomework } from '../data/mockData';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Students', value: mockStudents.length },
    { label: 'Total Teachers', value: mockTeachers.length },
    { label: 'Total Classes', value: mockClasses.length },
    { label: 'Total Subjects', value: mockSubjects.length },
  ];

  const recentHomework = mockHomework.slice(0, 5);

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