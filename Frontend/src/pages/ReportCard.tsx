import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, Subject } from '../data/mockData';
import studentPerformance from '../data/studentPerformance.json';
import { getStudents, getSubjects, getGradesByStudentId, getStudentAnalytics } from '../api/edulite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Search, 
  User, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import Select, { components, MenuListProps } from 'react-select';
import { FixedSizeList as List } from 'react-window';

type Grade = { subject_id: string; grade: string; comment: string };
type StudentPerformance = typeof studentPerformance[number];
type StudentNote = {
  note_id: string;
  student_id: string;
  teacher_id: string;
  note_type: string;
  title: string;
  content: string;
  created_at: string;
  is_private: boolean;
  tags: string[];
};
type Analytics = {
  overallGPA: number;
  attendanceRate: number;
  totalNotes: number;
  performance: StudentPerformance[];
  recentNotes: StudentNote[];
} | null;

type StudentOption = {
  value: string;
  label: string;
  grade: string;
  email: string;
};

// Custom option component for react-select
const Option = ({ data, innerProps, isFocused }: { 
  data: StudentOption; 
  innerProps: React.HTMLAttributes<HTMLDivElement>; 
  isFocused: boolean 
}) => (
  <div
    {...innerProps}
    className={`px-3 py-2 cursor-pointer ${
      isFocused ? 'bg-accent' : 'bg-background'
    } hover:bg-accent transition-colors`}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{data.label}</div>
        <div className="text-sm text-muted-foreground">ID: {data.value}</div>
      </div>
      <Badge variant="outline" className="text-xs">
        {data.grade}
      </Badge>
    </div>
  </div>
);

// Custom menu list component with virtualization
const MenuList = (props: MenuListProps<StudentOption, false>) => {
  const { children, maxHeight } = props;
  const childrenArray = Array.isArray(children) ? children : [children];
  
  return (
    <div style={{ maxHeight }}>
      <List
        height={Math.min(maxHeight, 300)}
        itemCount={childrenArray.length}
        itemSize={60}
        width="100%"
      >
        {({ index, style }: { index: number; style: React.CSSProperties }) => (
          <div style={style}>
            {childrenArray[index]}
          </div>
        )}
      </List>
    </div>
  );
};

const ReportCard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [analytics, setAnalytics] = useState<Analytics>(null);

  // Transform students for react-select
  const studentOptions = useMemo(() => {
    return students
      .filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()))
      .map(s => ({
        value: s.student_id,
        label: s.full_name,
        grade: s.grade,
        email: s.email
      }));
  }, [students, search]);

  // Calculate grade statistics
  const gradeStats = useMemo(() => {
    if (!grades.length) return null;
    
    const gradeCounts: Record<string, number> = {};
    let totalPoints = 0;
    const totalSubjects = grades.length;
    
    grades.forEach(grade => {
      gradeCounts[grade.grade] = (gradeCounts[grade.grade] || 0) + 1;
      
      // Convert letter grades to points for GPA calculation
      const gradePoints: Record<string, number> = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
      };
      totalPoints += gradePoints[grade.grade] || 0;
    });
    
    const calculatedGPA = totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : '0.00';
    
    return {
      gradeCounts,
      calculatedGPA,
      totalSubjects,
      highestGrade: Object.keys(gradeCounts).reduce((a, b) => 
        (gradeCounts[a] || 0) > (gradeCounts[b] || 0) ? a : b
      ),
      lowestGrade: Object.keys(gradeCounts).reduce((a, b) => 
        (gradeCounts[a] || 0) < (gradeCounts[b] || 0) ? a : b
      )
    };
  }, [grades]);

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
      
      if (studentId) {
        Promise.all([
          getGradesByStudentId(studentId),
          getStudentAnalytics(studentId)
        ]).then(([gradesRes, analyticsRes]) => {
          setGrades(gradesRes.data || []);
          setAnalytics(analyticsRes.data || null);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      const user = students.find(s => s.student_id === selectedStudentId) || null;
      setStudent(user);
      setLoading(true);
      
      Promise.all([
        getGradesByStudentId(selectedStudentId),
        getStudentAnalytics(selectedStudentId)
      ]).then(([gradesRes, analyticsRes]) => {
        setGrades(gradesRes.data || []);
        setAnalytics(analyticsRes.data || null);
        setLoading(false);
      });
    }
  }, [selectedStudentId, students]);

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'A-': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'B-': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'C-': 'text-yellow-600 bg-yellow-100',
      'D+': 'text-orange-600 bg-orange-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'teacher' 
              ? 'Student Report Cards' 
              : 'My Report Card'
            }
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive academic performance overview
          </p>
        </div>
        
        {(localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'teacher') && (
          <Button variant="outline" onClick={() => navigate('/admin/reports')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        )}
      </div>

      {/* Student Selection (Admin/Teacher) */}
      {(localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'teacher') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Student
            </CardTitle>
            <CardDescription>
              Search and select from all {students.length} students to view their report card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Student</label>
                <Select<StudentOption>
                  value={studentOptions.find(option => option.value === selectedStudentId)}
                  onChange={(option) => setSelectedStudentId(option?.value || '')}
                  options={studentOptions}
                  components={{
                    Option,
                    MenuList
                  }}
                  placeholder="Choose a student..."
                  isClearable
                  isSearchable={false}
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '40px',
                      borderColor: 'hsl(var(--input))',
                      backgroundColor: 'hsl(var(--background))',
                      '&:hover': {
                        borderColor: 'hsl(var(--ring))'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
                      color: 'hsl(var(--foreground))',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--accent))'
                      }
                    })
                  }}
                />
              </div>
            </div>
            
            {studentOptions.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {studentOptions.length} of {students.length} students
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Card Content */}
      {student ? (
        <div className="space-y-6">
          {/* Student Information Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{student.full_name}</CardTitle>
                    <CardDescription className="text-base">
                      Student ID: {student.student_id} • Grade: {student.grade} • Email: {student.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Report Generated</div>
                  <div className="font-medium">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Academic Performance Overview */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overall GPA</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.overallGPA}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.attendanceRate}%</p>
                    </div>
                  </div>
                  <Progress value={analytics.attendanceRate} className="mt-3" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
                      <p className="text-2xl font-bold text-purple-600">{analytics.totalNotes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                      <p className="text-2xl font-bold text-orange-600">{grades.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Academic Performance
              </CardTitle>
              <CardDescription>
                Detailed breakdown of grades across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Subject</th>
                        <th className="text-center p-3 font-semibold">Grade</th>
                        <th className="text-left p-3 font-semibold">Teacher Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade, index) => {
                        const subject = subjects.find(s => s.subject_id === grade.subject_id);
                        return (
                          <tr key={grade.subject_id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="p-3">
                              <div className="font-medium">{subject?.name || grade.subject_id}</div>
                              <div className="text-sm text-muted-foreground">{subject?.description || 'No description available'}</div>
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={`px-3 py-1 font-semibold ${getGradeColor(grade.grade)}`}>
                                {grade.grade}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">{grade.comment || 'No comments available'}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No grades available for this student</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grade Statistics */}
          {gradeStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Grade Analysis
                </CardTitle>
                <CardDescription>
                  Statistical overview of academic performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{gradeStats.calculatedGPA}</div>
                    <div className="text-sm text-muted-foreground">Calculated GPA</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{gradeStats.totalSubjects}</div>
                    <div className="text-sm text-muted-foreground">Total Subjects</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{gradeStats.highestGrade}</div>
                    <div className="text-sm text-muted-foreground">Highest Grade</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{gradeStats.lowestGrade}</div>
                    <div className="text-sm text-muted-foreground">Lowest Grade</div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h4 className="font-semibold mb-3">Grade Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(gradeStats.gradeCounts)
                      .sort(([a], [b]) => {
                        const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
                        return gradeOrder.indexOf(a) - gradeOrder.indexOf(b);
                      })
                      .map(([grade, count]) => (
                        <div key={grade} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={`px-2 py-1 text-xs ${getGradeColor(grade)}`}>
                              {grade}
                            </Badge>
                            <span className="text-sm">{count} subject{count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getGradeColor(grade).split(' ')[0].replace('text-', 'bg-')}`}
                                style={{ width: `${(count / gradeStats.totalSubjects) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {Math.round((count / gradeStats.totalSubjects) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Notes */}
          {analytics?.recentNotes && analytics.recentNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Teacher Notes
                </CardTitle>
                <CardDescription>
                  Latest feedback and observations from teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentNotes.slice(0, 5).map((note) => (
                    <div key={note.note_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={note.is_private ? "destructive" : "secondary"}>
                            {note.note_type}
                          </Badge>
                          {note.is_private && (
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{note.title}</h4>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Student Selected</h3>
            <p className="text-muted-foreground">
              {localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'teacher'
                ? 'Please select a student from the dropdown above to view their report card.'
                : 'Student profile not found.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportCard; 