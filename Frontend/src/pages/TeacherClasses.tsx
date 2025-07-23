import { useEffect, useState } from 'react';
import { getClasses, getStudents, ApiResponse } from '../api/edulite';

interface Class {
  class_id: string;
  name: string;
  schedule: string;
  student_count: number;
  teacher_id: string;
}
interface Student {
  student_id: string;
  full_name: string;
  class_id: string;
}

const TeacherClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const teacherId = JSON.parse(localStorage.getItem('user') || '{}').teacher_id;

  useEffect(() => {
    getClasses().then((res: ApiResponse<Class[]>) => {
      if (res.status === 'success' && res.data) {
        setClasses(res.data.filter((cls: Class) => cls.teacher_id === teacherId));
      }
      setLoading(false);
    });
  }, [teacherId]);

  const openClassDetails = (cls: Class) => {
    setSelectedClass(cls);
    setStudentsLoading(true);
    getStudents().then((res: ApiResponse<Student[]>) => {
      if (res.status === 'success' && res.data) {
        setStudents(res.data.filter((stu: Student) => stu.class_id === cls.class_id));
      }
      setStudentsLoading(false);
    });
  };

  const closeModal = () => {
    setSelectedClass(null);
    setStudents([]);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Classes</h2>
      <ul>
        {classes.map(cls => (
          <li key={cls.class_id} className="mb-4 p-4 border rounded-lg shadow-card">
            <div className="font-semibold cursor-pointer text-blue-600" onClick={() => openClassDetails(cls)}>{cls.name}</div>
            <div>Schedule: {cls.schedule}</div>
            <div>Students: {cls.student_count}</div>
          </li>
        ))}
      </ul>
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw]">
            <h3 className="text-xl font-bold mb-2">{selectedClass.name} Details</h3>
            <div>Schedule: {selectedClass.schedule}</div>
            <div>Student Count: {selectedClass.student_count}</div>
            <h4 className="mt-4 font-semibold">Students:</h4>
            {studentsLoading ? (
              <div>Loading students...</div>
            ) : (
              <ul className="max-h-48 overflow-y-auto">
                {students.length === 0 ? (
                  <li>No students in this class.</li>
                ) : (
                  students.map(stu => (
                    <li key={stu.student_id}>{stu.full_name}</li>
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

export default TeacherClasses; 