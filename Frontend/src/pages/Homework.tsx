import { useEffect, useState } from 'react';
import { getHomework, getClasses } from '../api/edulite';
import { Student, Class } from '../data/mockData';
type Homework = { homework_id: string; title: string; due_date: string; status: string; subject_id: string; description?: string; feedback?: string };

const HomeworkPage = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});

  // Get logged-in student info
  const user = JSON.parse(localStorage.getItem('user') || '{}') as Student;

  useEffect(() => {
    // Find the student's class and homework
    getClasses().then(res => {
      const classes = (res.data || []) as Class[];
      const cls = classes.find((c: Class) => c.class_id === user.class_id) || null;
      setStudentClass(cls);
      if (cls) {
        getHomework().then(hwRes => {
          const hw = (hwRes.data || []) as Homework[];
          const filteredHw = hw.filter((h: Homework) => h.subject_id === cls.subject_id);
          setHomework(filteredHw);
          // Initialize status map from homework status
          const map: Record<string, string> = {};
          const subMap: Record<string, boolean> = {};
          filteredHw.forEach((h: Homework) => {
            map[h.homework_id] = h.status;
            subMap[h.homework_id] = h.status === 'submitted' || h.status === 'graded';
          });
          setStatusMap(map);
          setSubmittedMap(subMap);
        });
      }
    });
  }, [user.class_id]);

  const handleSubmit = (hwId: string) => {
    setStatusMap(prev => ({ ...prev, [hwId]: 'submitted' }));
    setSubmittedMap(prev => ({ ...prev, [hwId]: true }));
    setSelectedHomework(null);
    setSubmissionText('');
    setSubmissionFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };

  // Type guard for feedback field
  function getFeedback(hw: Homework): string | undefined {
    return hw.feedback;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Homework</h2>
      {studentClass ? (
        <>
          <div className="mb-4">Class: <span className="font-semibold">{studentClass.name}</span></div>
          <ul>
            {homework.length === 0 ? (
              <li>No homework assigned for your class.</li>
            ) : (
              homework.map(hw => (
                <li key={hw.homework_id} className="mb-4 p-4 border rounded-lg shadow-card bg-card text-card-foreground flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-foreground">{hw.title}</div>
                    <div className="text-muted-foreground">Due: {hw.due_date}</div>
                    <div className="text-muted-foreground">Status: {statusMap[hw.homework_id]}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setSelectedHomework(hw)} className="bg-muted text-foreground px-3 py-1 rounded border">View Details</button>
                    {statusMap[hw.homework_id] === 'pending' && (
                      <button onClick={() => setSelectedHomework(hw)} className="bg-primary text-primary-foreground px-3 py-1 rounded">Submit</button>
                    )}
                    {statusMap[hw.homework_id] === 'submitted' && (
                      <span className="text-success font-semibold">Submitted</span>
                    )}
                    {statusMap[hw.homework_id] === 'graded' && (
                      <span className="text-info font-semibold">Graded</span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
          {/* Homework Details Modal */}
          {selectedHomework && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative text-card-foreground">
                <button onClick={() => setSelectedHomework(null)} className="absolute top-2 right-2 text-gray-400 hover:text-black">&times;</button>
                <h3 className="text-xl font-bold mb-2">{selectedHomework.title}</h3>
                <div className="mb-2">Due: {selectedHomework.due_date}</div>
                <div className="mb-2">Status: {statusMap[selectedHomework.homework_id]}</div>
                <div className="mb-4">Description: {selectedHomework.description || 'No description provided.'}</div>
                {!submittedMap[selectedHomework.homework_id] ? (
                  <form onSubmit={e => { e.preventDefault(); handleSubmit(selectedHomework.homework_id); }} className="flex flex-col gap-3">
                    <label className="font-medium">Submit your work:</label>
                    <textarea
                      className="border rounded p-2"
                      placeholder="Type your answer or comments here..."
                      value={submissionText}
                      onChange={e => setSubmissionText(e.target.value)}
                      rows={3}
                    />
                    <input type="file" onChange={handleFileChange} />
                    <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded">Submit Homework</button>
                  </form>
                ) : (
                  <div className="text-green-700 font-semibold">You have submitted this homework.</div>
                )}
                {statusMap[selectedHomework.homework_id] === 'graded' && getFeedback(selectedHomework) && (
                  <div className="mt-4 p-3 bg-success/10 border border-success rounded">
                    <div className="font-semibold text-success">Teacher Feedback:</div>
                    <div className="text-success-foreground">{getFeedback(selectedHomework)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>No class assigned to your profile.</div>
      )}
    </div>
  );
};

export default HomeworkPage; 