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
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    // Only load homework for students
    if (userRole !== 'student') return;
    
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
  }, [user.class_id, userRole]);

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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {userRole === 'student' ? 'My Homework' : 'Homework Management'}
        </h2>
        <p className="text-muted-foreground">
          {userRole === 'student' ? 'Manage and submit your homework assignments' : 'View and manage homework assignments'}
        </p>
      </div>
      
      {userRole !== 'student' ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Teacher/Admin View</h3>
          <p className="text-muted-foreground">Please use the teacher homework management interface for creating and managing assignments.</p>
        </div>
      ) : studentClass ? (
        <>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Class:</span>
            <span className="font-semibold text-foreground">{studentClass.name}</span>
          </div>
          
          <div className="space-y-4">
            {homework.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Homework Assigned</h3>
                <p className="text-muted-foreground">There are currently no homework assignments for your class.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {homework.map(hw => (
                  <div key={hw.homework_id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{hw.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Due: {hw.due_date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className={`h-2 w-2 rounded-full ${
                                statusMap[hw.homework_id] === 'pending' ? 'bg-warning' :
                                statusMap[hw.homework_id] === 'submitted' ? 'bg-info' :
                                'bg-success'
                              }`}></div>
                              <span className="capitalize">{statusMap[hw.homework_id]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedHomework(hw)} 
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                          >
                            View Details
                          </button>
                          {statusMap[hw.homework_id] === 'pending' && (
                            <button 
                              onClick={() => setSelectedHomework(hw)} 
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                            >
                              Submit
                            </button>
                          )}
                          {statusMap[hw.homework_id] === 'submitted' && (
                            <span className="inline-flex items-center rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info">
                              Submitted
                            </span>
                          )}
                          {statusMap[hw.homework_id] === 'graded' && (
                            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                              Graded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Homework Details Modal */}
          {selectedHomework && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card border rounded-lg shadow-lg min-w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative text-card-foreground">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground">{selectedHomework.title}</h3>
                    <button 
                      onClick={() => setSelectedHomework(null)} 
                      className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="sr-only">Close</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <div className="font-medium text-foreground">{selectedHomework.due_date}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="font-medium text-foreground capitalize">{statusMap[selectedHomework.homework_id]}</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <div className="mt-1 text-foreground">{selectedHomework.description || 'No description provided.'}</div>
                    </div>

                    {!submittedMap[selectedHomework.homework_id] ? (
                      <form onSubmit={e => { e.preventDefault(); handleSubmit(selectedHomework.homework_id); }} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground">Submit your work:</label>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Type your answer or comments here..."
                            value={submissionText}
                            onChange={e => setSubmissionText(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Attach file (optional):</label>
                          <input 
                            type="file" 
                            onChange={handleFileChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                          Submit Homework
                        </button>
                      </form>
                    ) : (
                      <div className="rounded-lg bg-success/10 border border-success/20 p-4">
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-semibold text-success">Homework Submitted</span>
                        </div>
                      </div>
                    )}
                    
                    {statusMap[selectedHomework.homework_id] === 'graded' && getFeedback(selectedHomework) && (
                      <div className="rounded-lg bg-info/10 border border-info/20 p-4">
                        <div className="font-semibold text-info mb-2">Teacher Feedback:</div>
                        <div className="text-info-foreground">{getFeedback(selectedHomework)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Class Assigned</h3>
          <p className="text-muted-foreground">Please contact your administrator to assign you to a class.</p>
        </div>
      )}
    </div>
  );
};

export default HomeworkPage; 