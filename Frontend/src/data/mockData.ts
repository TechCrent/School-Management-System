export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
}

export interface Student {
  student_id: string;
  full_name: string;
  date_of_birth: string;
  class_id: string;
  email: string;
  parent1_email: string;
  parent1_name: string;
  parent1_contact: string;
  parent2_email: string;
  parent2_name: string;
  parent2_contact: string;
  grade: string;
  status: 'active' | 'inactive';
}

export interface Teacher {
  teacher_id: string;
  full_name: string;
  email: string;
  subject_id: string;
  subject_name: string;
  assigned_classes: string[];
  phone?: string;
}

export interface Subject {
  subject_id: string;
  name: string;
  description: string;
}

export interface Class {
  class_id: string;
  name: string;
  teacher_id: string;
  subject_id: string;
  schedule: string;
  zoom_link?: string;
  student_count: number;
}

export interface Homework {
  homework_id: string;
  title: string;
  description: string;
  subject_id: string;
  teacher_id: string;
  due_date: string;
  created_at: string;
  status: 'pending' | 'submitted' | 'graded';
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "admin-001",
    email: "admin@schoolapp.com",
    full_name: "School Administrator",
    role: "admin"
  },
  {
    id: "teacher-001",
    email: "jane.smith@schoolapp.com",
    full_name: "Jane Smith",
    role: "teacher"
  },
  {
    id: "student-001",
    email: "john.doe@schoolapp.com",
    full_name: "John Doe",
    role: "student"
  }
];

// Mock Students (showing first 10)
export const mockStudents: Student[] = [
  {
    student_id: "123e4567-e89b-12d3-a456-426614174000",
    full_name: "John Doe",
    date_of_birth: "2010-05-15",
    class_id: "class_1",
    email: "john.doe@example.com",
    parent1_email: "mom.doe@example.com",
    parent1_name: "Jane Doe",
    parent1_contact: "+1-555-1000",
    parent2_email: "dad.doe@example.com",
    parent2_name: "Mike Doe",
    parent2_contact: "+1-555-1001",
    grade: "8A",
    status: "active"
  },
  {
    student_id: "123e4567-e89b-12d3-a456-426614174001",
    full_name: "Emma Wilson",
    date_of_birth: "2010-03-22",
    class_id: "class_1",
    email: "emma.wilson@example.com",
    parent1_email: "sarah.wilson@example.com",
    parent1_name: "Sarah Wilson",
    parent1_contact: "+1-555-1002",
    parent2_email: "mike.wilson@example.com",
    parent2_name: "Mike Wilson",
    parent2_contact: "+1-555-1003",
    grade: "8A",
    status: "active"
  },
  {
    student_id: "123e4567-e89b-12d3-a456-426614174002",
    full_name: "Michael Johnson",
    date_of_birth: "2010-07-10",
    class_id: "class_1",
    email: "michael.johnson@example.com",
    parent1_email: "lisa.johnson@example.com",
    parent1_name: "Lisa Johnson",
    parent1_contact: "+1-555-1004",
    parent2_email: "david.johnson@example.com",
    parent2_name: "David Johnson",
    parent2_contact: "+1-555-1005",
    grade: "8A",
    status: "active"
  },
  {
    student_id: "123e4567-e89b-12d3-a456-426614174003",
    full_name: "Sophia Brown",
    date_of_birth: "2010-01-18",
    class_id: "class_1",
    email: "sophia.brown@example.com",
    parent1_email: "anna.brown@example.com",
    parent1_name: "Anna Brown",
    parent1_contact: "+1-555-1006",
    parent2_email: "robert.brown@example.com",
    parent2_name: "Robert Brown",
    parent2_contact: "+1-555-1007",
    grade: "8A",
    status: "active"
  },
  {
    student_id: "123e4567-e89b-12d3-a456-426614174004",
    full_name: "William Davis",
    date_of_birth: "2010-09-05",
    class_id: "class_1",
    email: "william.davis@example.com",
    parent1_email: "jennifer.davis@example.com",
    parent1_name: "Jennifer Davis",
    parent1_contact: "+1-555-1008",
    parent2_email: "thomas.davis@example.com",
    parent2_name: "Thomas Davis",
    parent2_contact: "+1-555-1009",
    grade: "8A",
    status: "active"
  }
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    teacher_id: "789e0123-e89b-12d3-a456-426614174001",
    full_name: "Jane Smith",
    email: "jane.smith@schoolapp.com",
    subject_id: "sub_1",
    subject_name: "Mathematics",
    assigned_classes: ["class_1"],
    phone: "+1-555-0101"
  },
  {
    teacher_id: "789e0123-e89b-12d3-a456-426614174002",
    full_name: "Robert Garcia",
    email: "robert.garcia@schoolapp.com",
    subject_id: "sub_2",
    subject_name: "English",
    assigned_classes: ["class_1"],
    phone: "+1-555-0102"
  },
  {
    teacher_id: "789e0123-e89b-12d3-a456-426614174003",
    full_name: "Maria Rodriguez",
    email: "maria.rodriguez@schoolapp.com",
    subject_id: "sub_3",
    subject_name: "Science",
    assigned_classes: ["class_1"],
    phone: "+1-555-0103"
  },
  {
    teacher_id: "789e0123-e89b-12d3-a456-426614174004",
    full_name: "David Chen",
    email: "david.chen@schoolapp.com",
    subject_id: "sub_4",
    subject_name: "History",
    assigned_classes: ["class_1"],
    phone: "+1-555-0104"
  },
  {
    teacher_id: "789e0123-e89b-12d3-a456-426614174005",
    full_name: "Sarah Williams",
    email: "sarah.williams@schoolapp.com",
    subject_id: "sub_5",
    subject_name: "Art",
    assigned_classes: ["class_1"],
    phone: "+1-555-0105"
  }
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  { subject_id: "sub_1", name: "Mathematics", description: "Algebra and basic mathematics" },
  { subject_id: "sub_2", name: "English", description: "Language arts and literature" },
  { subject_id: "sub_3", name: "Science", description: "Biology, chemistry, and physics basics" },
  { subject_id: "sub_4", name: "History", description: "World and local history" },
  { subject_id: "sub_5", name: "Art", description: "Creative arts and design" }
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    class_id: "class_1",
    name: "Grade 8A",
    teacher_id: "789e0123-e89b-12d3-a456-426614174001",
    subject_id: "sub_1",
    schedule: "Monday 10:00 AM - 11:00 AM",
    zoom_link: "https://zoom.us/j/123456789",
    student_count: 25
  },
  {
    class_id: "class_2",
    name: "Grade 8A English",
    teacher_id: "789e0123-e89b-12d3-a456-426614174002",
    subject_id: "sub_2",
    schedule: "Tuesday 9:00 AM - 10:00 AM",
    zoom_link: "https://zoom.us/j/987654321",
    student_count: 25
  }
];

// Mock Homework
export const mockHomework: (Homework & { feedback?: string })[] = [
  {
    homework_id: "123e4567-e89b-12d3-a456-426614174004",
    title: "Algebra Practice",
    description: "Complete exercises 1-20 from chapter 5",
    subject_id: "sub_1",
    teacher_id: "789e0123-e89b-12d3-a456-426614174001",
    due_date: "2025-08-01",
    created_at: "2025-07-20",
    status: "graded",
    feedback: "Great job! You solved all exercises correctly. Keep it up!"
  },
  {
    homework_id: "123e4567-e89b-12d3-a456-426614174005",
    title: "Essay on Shakespeare",
    description: "Write a 500-word essay on Romeo and Juliet",
    subject_id: "sub_2",
    teacher_id: "789e0123-e89b-12d3-a456-426614174002",
    due_date: "2025-07-30",
    created_at: "2025-07-18",
    status: "pending",
    feedback: ""
  }
];

// Mock API Authentication
export const mockAuth = {
  login: (email: string, password: string) => {
    if (email === "admin@schoolapp.com" && password === "Admin$1234") {
      return {
        token: "mock-admin-token",
        user: mockUsers.find(u => u.email === email),
        role: "admin"
      };
    }
    if (email === "jane.smith@schoolapp.com" && password === "Teacher$123") {
      return {
        token: "mock-teacher-token",
        user: mockUsers.find(u => u.email === email),
        role: "teacher"
      };
    }
    return null;
  }
};