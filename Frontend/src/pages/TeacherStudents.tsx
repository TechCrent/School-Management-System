import { useEffect, useState } from 'react';
import { getClasses, getStudents, getHomework, ApiResponse } from '../api/edulite';
import { useRef } from 'react';

interface Student {
  student_id: string;
  full_name: string;
  class_id: string;
}
interface Class {
  class_id: string;
  teacher_id: string;
}
interface Homework {
  homework_id: string;
  title: string;
  due_date: string;
  status: string;
  class_id?: string;
}

const TeacherStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const teacherId = JSON.parse(localStorage.getItem('user') || '{}').teacher_id;
  // Local state for grades/feedback (mock, not persisted)
  const [grades, setGrades] = useState<Record<string, { grade: string; feedback: string }>>({});

  useEffect(() => {
    Promise.all([
      getClasses() as Promise<ApiResponse<Class[]>>,
      getStudents() as Promise<ApiResponse<Student[]>>
    ]).then(([classRes, studentRes]) => {
      if (classRes.status === 'success' && classRes.data && studentRes.status === 'success' && studentRes.data) {
        const myClasses = classRes.data.filter((cls: Class) => cls.teacher_id === teacherId).map((cls: Class) => cls.class_id);
        const myStudents = studentRes.data.filter((stu: Student) => myClasses.includes(stu.class_id));
        setStudents(myStudents);
      }
      setLoading(false);
    });
  }, [teacherId]);

  const openStudentDetails = (stu: Student) => {
    setSelectedStudent(stu);
    setHomeworkLoading(true);
    getHomework().then((res: ApiResponse<Homework[]>) => {
      if (res.status === 'success' && res.data) {
        // Show homework for the student's class
        setHomework(res.data.filter(hw => hw.class_id === stu.class_id));
      }
      setHomeworkLoading(false);
    });
    setGrades({}); // Reset grades/feedback when opening a new student
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setHomework([]);
  };

  const handleGradeChange = (hwId: string, value: string) => {
    setGrades(prev => ({ ...prev, [hwId]: { ...prev[hwId], grade: value } }));
  };
  const handleFeedbackChange = (hwId: string, value: string) => {
    setGrades(prev => ({ ...prev, [hwId]: { ...prev[hwId], feedback: value } }));
  };
  const handleSaveGrade = (hwId: string) => {
    // In a real app, save grade/feedback to backend
    // For now, just keep it in local state
    // Optionally show a toast/notification
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Students</h2>
      <ul>
        {students.map(stu => (
          <li key={stu.student_id} className="mb-4 p-4 border rounded-lg shadow-card">
            <div className="font-semibold cursor-pointer text-blue-600" onClick={() => openStudentDetails(stu)}>{stu.full_name}</div>
            <div>Class: {stu.class_id}</div>
          </li>
        ))}
      </ul>
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw]">
            <h3 className="text-xl font-bold mb-2">{selectedStudent.full_name}</h3>
            <div>Class: {selectedStudent.class_id}</div>
            <h4 className="mt-4 font-semibold">Homework for this class:</h4>
            {homeworkLoading ? (
              <div>Loading homework...</div>
            ) : (
              <ul className="max-h-48 overflow-y-auto">
                {homework.length === 0 ? (
                  <li>No homework assigned to this class.</li>
                ) : (
                  homework.map(hw => (
                    <li key={hw.homework_id} className="mb-4 p-2 border rounded">
                      <div className="font-semibold">{hw.title}</div>
                      <div>Due: {hw.due_date}</div>
                      <div>Status: {hw.status}</div>
                      <div className="mt-2 flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Grade (e.g. A, B+)"
                          value={grades[hw.homework_id]?.grade || ''}
                          onChange={e => handleGradeChange(hw.homework_id, e.target.value)}
                          className="border rounded p-1 w-32"
                        />
                        <textarea
                          placeholder="Feedback"
                          value={grades[hw.homework_id]?.feedback || ''}
                          onChange={e => handleFeedbackChange(hw.homework_id, e.target.value)}
                          className="border rounded p-1 w-full"
                          rows={2}
                        />
                        <button
                          onClick={() => handleSaveGrade(hw.homework_id)}
                          className="bg-primary text-white px-3 py-1 rounded w-fit"
                        >
                          Save Grade
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
            <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents; 