import { useEffect, useState } from 'react';
import { mockHomework, mockClasses, Student, Homework, Class } from '../data/mockData';

const HomeworkPage = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});

  // Get logged-in student info
  const user = JSON.parse(localStorage.getItem('user') || '{}') as Student;

  useEffect(() => {
    // Find the student's class
    const cls = mockClasses.find(c => c.class_id === user.class_id) || null;
    setStudentClass(cls);
    if (cls) {
      // Get homework for this class's subject
      const hw = mockHomework.filter(h => h.subject_id === cls.subject_id);
      setHomework(hw);
      // Initialize status map from homework status
      const map: Record<string, string> = {};
      const subMap: Record<string, boolean> = {};
      hw.forEach(h => {
        map[h.homework_id] = h.status;
        subMap[h.homework_id] = h.status === 'submitted' || h.status === 'graded';
      });
      setStatusMap(map);
      setSubmittedMap(subMap);
    }
    setLoading(false);
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
    return (hw as Homework & { feedback?: string }).feedback;
  }

  if (loading) return <div>Loading...</div>;

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
                <li key={hw.homework_id} className="mb-4 p-4 border rounded-lg shadow-card flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{hw.title}</div>
                    <div>Due: {hw.due_date}</div>
                    <div>Status: {statusMap[hw.homework_id]}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setSelectedHomework(hw)} className="bg-muted px-3 py-1 rounded border">View Details</button>
                    {statusMap[hw.homework_id] === 'pending' && (
                      <button onClick={() => setSelectedHomework(hw)} className="bg-primary text-white px-3 py-1 rounded">Submit</button>
                    )}
                    {statusMap[hw.homework_id] === 'submitted' && (
                      <span className="text-green-600 font-semibold">Submitted</span>
                    )}
                    {statusMap[hw.homework_id] === 'graded' && (
                      <span className="text-blue-600 font-semibold">Graded</span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
          {/* Homework Details Modal */}
          {selectedHomework && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-[90vw] relative">
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
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Submit Homework</button>
                  </form>
                ) : (
                  <div className="text-green-700 font-semibold">You have submitted this homework.</div>
                )}
                {statusMap[selectedHomework.homework_id] === 'graded' && getFeedback(selectedHomework) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="font-semibold text-green-800">Teacher Feedback:</div>
                    <div className="text-green-900">{getFeedback(selectedHomework)}</div>
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