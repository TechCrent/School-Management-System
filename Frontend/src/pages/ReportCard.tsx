import { useEffect, useState } from 'react';
import { Student } from '../data/mockData';
import { getStudents, getSubjects, getGradesByStudentId } from '../api/edulite';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';

const ReportCard = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const role = localStorage.getItem('role') || '';
    let user = JSON.parse(localStorage.getItem('user') || '{}') as Student;
    let studentId = user?.student_id;
    Promise.all([
      getStudents(),
      getSubjects()
    ]).then(([studentsRes, subjectsRes]) => {
      setStudents(studentsRes.data || []);
      setSubjects(subjectsRes.data || []);
      if (role === 'admin' || role === 'teacher') {
        user = (studentsRes.data && studentsRes.data[0]) || user;
        setSelectedStudentId(user?.student_id || '');
        studentId = user?.student_id;
      }
      setStudent(user);
      getGradesByStudentId(studentId).then(res => {
        setGrades(res.data || []);
        setLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      const user = students.find(s => s.student_id === selectedStudentId) || null;
      setStudent(user);
      setLoading(true);
      getGradesByStudentId(selectedStudentId).then(res => {
        setGrades(res.data || []);
        setLoading(false);
      });
    }
  }, [selectedStudentId, students]);

  if (loading) return <div>Loading report card...</div>;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Report Card</h2>
      {(localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'teacher') && (
        <div className="mb-4">
          <label className="font-semibold mr-2">Select Student:</label>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.student_id} value={s.student_id}>{s.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
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
                const subject = subjects.find((s: any) => s.subject_id === g.subject_id);
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