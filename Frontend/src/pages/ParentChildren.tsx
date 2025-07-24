import { useState, useEffect } from 'react';
import { getStudents, getHomework, getClasses } from '../api/edulite';
import { Student, Class } from '../data/mockData';
type Homework = { homework_id: string; title: string; due_date: string; status: string };

const getRecentGrades = () => [
  { subject: 'Mathematics', grade: 'A' },
  { subject: 'English', grade: 'B+' },
];

const ParentChildren = () => {
  const [children, setChildren] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);

  useEffect(() => {
    getStudents().then(res => {
      setChildren(res.data ? res.data.slice(0, 2) : []);
    });
    getHomework().then(res => {
      setHomework(res.data || []);
    });
    getClasses().then(res => {
      setClasses(res.data || []);
    });
  }, []);

  const getUpcomingHomework = (studentId: string) =>
    homework.filter((hw: Homework) => hw.status === 'pending').slice(0, 2);
  const getClassInfo = (classId: string) =>
    classes.find((cls: Class) => cls.class_id === classId);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Children</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map(child => (
          <div
            key={child.student_id}
            className="p-4 border rounded-lg shadow-card bg-white cursor-pointer hover:shadow-glow"
            onClick={() => setSelectedChild(child)}
          >
            <div className="font-semibold text-lg mb-1">{child.full_name}</div>
            <div className="mb-1">Grade: <span className="font-semibold">{child.grade}</span></div>
            <div className="mb-2">Status: <span className="font-semibold capitalize">{child.status}</span></div>
          </div>
        ))}
      </div>
      {/* Child Details Modal */}
      {selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative">
            <button onClick={() => setSelectedChild(null)} className="absolute top-2 right-2 text-gray-400 hover:text-black">&times;</button>
            <h3 className="text-xl font-bold mb-2">{selectedChild.full_name}</h3>
            <div className="mb-2">Grade: {selectedChild.grade}</div>
            <div className="mb-2">Status: {selectedChild.status}</div>
            <div className="mb-2">Class: {getClassInfo(selectedChild.class_id)?.name || 'N/A'}</div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Recent Grades:</div>
              <ul className="list-disc ml-6">
                {getRecentGrades().map((g, i) => (
                  <li key={i}>{g.subject}: <span className="font-semibold">{g.grade}</span></li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Upcoming Homework:</div>
              <ul className="list-disc ml-6">
                {getUpcomingHomework(selectedChild.student_id).map(hw => (
                  <li key={hw.homework_id}>{hw.title} (Due: {hw.due_date})</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentChildren; 