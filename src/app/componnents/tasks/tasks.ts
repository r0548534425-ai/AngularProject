import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskServer } from '../../services/tasks/task-service';
import { addTask, TaskDetails, updateTask } from '../../models/tasks.model';
import { ProjectService } from '../../services/projects/project-service';
import { ProjectDetails } from '../../models/project.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth/authService';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-tasks',
  imports: [
    ReactiveFormsModule, 
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
private fg = inject(FormBuilder);
private taskService = inject(TaskServer);
private projectService = inject(ProjectService);
private authService = inject(AuthService);
private router = inject(ActivatedRoute);
private snackBar = inject(MatSnackBar);

filteredTasks = signal<TaskDetails[]>([]);
projects = signal<ProjectDetails[]>([]);
users = signal<any[]>([]);

// Loading states
isLoading = signal<boolean>(false);
isAdding = signal<boolean>(false);
isUpdating = signal<boolean>(false);
isDeleting = signal<boolean>(false);

projectId: number|null = null;
isProjectPage = signal<boolean>(false); 
panelOpenState = signal(false);

editingTaskId: number|null = null;
deleteTaskId: number|null = null;
addTaskForm=this.fg.group({
  project_id:[''], // לא נדרש כי נכפה אותו בקוד
  title:['',[Validators.required,Validators.minLength(3)]],
  
});
editTaskForm = this.fg.group({
  title: [''],
  description: [''],
  status: [''],
  priority: [''],
  assignee_id: [''],
  due_date: ['']
});


ngOnInit() {
 
  this.loadProjects();
  this.router.paramMap.subscribe(params => {
    const idParam = params.get('projectId');
    this.projectId = idParam ? +idParam : null;
    this.isProjectPage.set(this.projectId !== null);
    
    console.log('Task page - projectId:', this.projectId, 'isProjectPage:', this.isProjectPage());
    
    // אם אנחנו בעמוד פרויקט מסוים, קבע את project_id בטופס
    if (this.projectId !== null) {
      this.addTaskForm.patchValue({ project_id: this.projectId.toString() });
    }
  });
  if(this.projectId){
    this.ProjectTasks(this.projectId);
  }
  else{
    this.loadTasks();
}
}

loadTasks(){
  this.isLoading.set(true);
  this.taskService.getTasks().subscribe({
    next: (data: TaskDetails[]) => {
      this.filteredTasks.set(data);
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Error loading tasks:', err);
      this.isLoading.set(false);
    }
  });   
}
loadProjects(){
  this.projectService.getProjects().subscribe((data) => {
    this.projects.set(data);
  });
  
  // טעינת משתמשים
  this.authService.getUsers().subscribe({
    next: (data) => {
      this.users.set(data);
    },
    error: (err) => {
      console.error('Error loading users:', err);
    }
  });
}

getUserName(userId: number | null): string {
  if (!userId) return '';
  const user = this.users().find(u => u.id === userId);
  return user ? user.name : '';
}

deleteTask(id: number)
{
  this.isDeleting.set(true);
  this.taskService.deleteTask(id).subscribe({
    next: () => {
      this.loadTasks();
      this.deleteTaskId = null;
      this.isDeleting.set(false);
    },
    error: (err) => {
      console.error('Error deleting task:', err);
      this.isDeleting.set(false);
    }
  
    
  })

}
addTask(){
  if (this.isAdding()) return;
  
 
  if (this.projectId === null && !this.addTaskForm.value.project_id) {
    this.snackBar.open('❌ אנא בחר פרויקט', 'סגור', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }
  
  // בדיקה: שדה כותרת
  if (this.addTaskForm.get('title')?.invalid) {
    this.snackBar.open('❌ אנא הזן כותרת תקינה (לפחות 3 תווים)', 'סגור', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }
  
  this.addTaskForm.disable();
  this.isAdding.set(true);
  
  const raw = this.addTaskForm.value as any;
  
  // אם אנחנו בעמוד פרויקט מסוים, כפה את ה-projectId
  const projectIdToUse = this.projectId !== null ? this.projectId : +raw.project_id;
  
  const data = {
    projectId: projectIdToUse,
    title: raw.title
  };
  
  console.log('📤 Sending task data:', data);
  console.log('Current projectId filter:', this.projectId);
  
  this.taskService.addTask(data as any).subscribe({
    next: (data) => {
      console.log('✅ Task added successfully:', data);
      
      // רק אם המשימה שייכת לפרויקט הנוכחי (או אין פילטר), הוסף אותה לרשימה
      if (this.projectId === null || data.project_id === this.projectId) {
        this.filteredTasks.set([...this.filteredTasks(), data]);
        console.log('Task added to display list');
      } else {
        console.log('Task added to different project, not showing in current view');
      }
      
      this.addTaskForm.reset();
      this.addTaskForm.enable();
      
      // אם אנחנו בעמוד פרויקט, אפס מחדש את project_id
      if (this.projectId !== null) {
        this.addTaskForm.patchValue({ project_id: this.projectId.toString() });
      }
      
      this.panelOpenState.set(false);
      this.isAdding.set(false);
      
      this.snackBar.open('✅ המשימה נוספה בהצלחה!', 'סגור', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    },
    error: (err) => {
      console.error('❌ Error adding task:', err);
      console.error('❌ Error details:', err.error);
      this.addTaskForm.enable();
      this.isAdding.set(false);
    }
  });
  

}
startEdit(task: TaskDetails) {
  this.editingTaskId = task.id;
  
  this.editTaskForm.patchValue({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee_id: task.assignee_id !== null ? task.assignee_id.toString() : '',
    due_date: task.due_date
  });
}
saveEdit() {
   if (this.editingTaskId === null || this.isUpdating()) {
    console.error('❌ No task selected for editing');
    return;
  }

  this.editTaskForm.disable();
  this.isUpdating.set(true);
  
  const raw = this.editTaskForm.value as any;
  const updatedTask: any = {
    ...raw,
    assignee_id: raw.assignee_id === '' || raw.assignee_id === null ? null : +raw.assignee_id,
    due_date: raw.due_date === '' ? null : raw.due_date
  };

  this.taskService.updateTask(this.editingTaskId, updatedTask).subscribe({
    next: (response) => {
      console.log('✅ Task updated successfully!', response);
      this.loadTasks();
      this.editingTaskId = null;
      this.editTaskForm.reset();
      this.editTaskForm.enable();
      this.isUpdating.set(false);
      
    },
    error: (err) => {
      console.error('❌ Error updating task:', err);
      console.error('❌ Error details:', err.error);
      this.loadTasks();
      this.editingTaskId = null;
      this.editTaskForm.enable();
      this.isUpdating.set(false);
    }
  });
}
ProjectTasks(projectId: number) {
    this.isLoading.set(true);
    this.taskService.getTasksByProject(projectId).subscribe({
        next: (tasks) => {
            console.log('Tasks for project', projectId, ':', tasks);  
            this.filteredTasks.set(tasks);
            this.isLoading.set(false);
        },
        error: (error) => {
            console.error('Error fetching tasks for project:', error);
            this.isLoading.set(false);
        }
    });
}


cancelEdit() {
  this.editingTaskId = null;
}
getProjectName(projectId: number): string {
  const project = this.projects().find(p => p.id === projectId);
  return project ? project.name : 'Unknown Project';
}
}