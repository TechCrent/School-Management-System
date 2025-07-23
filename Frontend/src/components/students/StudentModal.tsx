import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/data/mockData';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Partial<Student>) => Promise<void>;
  student?: Student | null;
  mode: 'create' | 'edit' | 'view';
}

interface StudentFormData {
  full_name: string;
  email: string;
  grade: string;
  date_of_birth: string;
  parent1_email: string;
  parent2_email: string;
  status: 'active' | 'inactive';
}

export const StudentModal = ({ isOpen, onClose, onSave, student, mode }: StudentModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StudentFormData>({
    defaultValues: {
      full_name: '',
      email: '',
      grade: 'Grade 8A',
      date_of_birth: '',
      parent1_email: '',
      parent2_email: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (student && (mode === 'edit' || mode === 'view')) {
      setValue('full_name', student.full_name);
      setValue('email', student.email);
      setValue('grade', student.grade);
      setValue('date_of_birth', student.date_of_birth);
      setValue('parent1_email', student.parent1_email || '');
      setValue('parent2_email', student.parent2_email || '');
      setValue('status', student.status);
    } else if (mode === 'create') {
      reset();
    }
  }, [student, mode, setValue, reset]);

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    try {
      await onSave({
        ...data,
        student_id: student?.student_id || crypto.randomUUID(),
        class_id: 'class_1', // Default class
      });
      
      toast({
        title: mode === 'create' ? 'Student created' : 'Student updated',
        description: `${data.full_name} has been ${mode === 'create' ? 'added' : 'updated'} successfully.`,
      });
      
      onClose();
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} student. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && 'Add New Student'}
            {mode === 'edit' && 'Edit Student'}
            {mode === 'view' && 'Student Details'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Enter the student information below.'}
            {mode === 'edit' && 'Update the student information below.'}
            {mode === 'view' && 'View student information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                {...register('full_name', { 
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                placeholder="Enter full name"
                disabled={isReadOnly}
                className={errors.full_name ? 'border-destructive' : ''}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="student@example.com"
                disabled={isReadOnly}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select
                disabled={isReadOnly}
                value={watch('grade')}
                onValueChange={(value) => setValue('grade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 7A">Grade 7A</SelectItem>
                  <SelectItem value="Grade 8A">Grade 8A</SelectItem>
                  <SelectItem value="Grade 9A">Grade 9A</SelectItem>
                  <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                disabled={isReadOnly}
                className={errors.date_of_birth ? 'border-destructive' : ''}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent1_email">Parent 1 Email</Label>
              <Input
                id="parent1_email"
                type="email"
                {...register('parent1_email', { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="parent1@example.com"
                disabled={isReadOnly}
                className={errors.parent1_email ? 'border-destructive' : ''}
              />
              {errors.parent1_email && (
                <p className="text-sm text-destructive">{errors.parent1_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent2_email">Parent 2 Email</Label>
              <Input
                id="parent2_email"
                type="email"
                {...register('parent2_email', { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="parent2@example.com"
                disabled={isReadOnly}
                className={errors.parent2_email ? 'border-destructive' : ''}
              />
              {errors.parent2_email && (
                <p className="text-sm text-destructive">{errors.parent2_email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              disabled={isReadOnly}
              value={watch('status')}
              onValueChange={(value: 'active' | 'inactive') => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Update Student'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};