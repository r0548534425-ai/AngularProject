import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskServer } from '../../services/tasks/task-service';
import { addTask, TaskDetails, updateTask } from '../../models/tasks.model';
import { ProjectService } from '../../services/projects/project-service';
import { ProjectDetails } from '../../models/project.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth/authService';

@Component({
  selector: 'app-tasks',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
fg=inject(FormBuilder);
taskService = inject(TaskServer);
projectService = inject(ProjectService);
authService = inject(AuthService);

filteredTasks=signal<TaskDetails[]>([]);

projects=signal<ProjectDetails[]>([]);
users=signal<any[]>([]);

// Loading states
isLoading = signal<boolean>(false);
isAdding = signal<boolean>(false);
isUpdating = signal<boolean>(false);
isDeleting = signal<boolean>(false);

private router = inject(ActivatedRoute);
projectId:number|null=null;


editingTaskId:number|null=null;
deleteTaskId:number|null=null;
showAddTaskForm:boolean=false ;
toggleAddTask(){
  this.showAddTaskForm=!this.showAddTaskForm;
}
addTaskForm=this.fg.group({
  project_id:['',[Validators.required]],
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
  if (this.addTaskForm.invalid || this.isAdding()) return;
  
  this.addTaskForm.disable();
  this.isAdding.set(true);
  
  const raw = this.addTaskForm.value as any;
  // השרת מצפה ל-projectId (camelCase) ולא project_id
  const data = {
    projectId: raw.project_id ? +raw.project_id : raw.project_id,
    title: raw.title
  };
  
  console.log('📤 Sending task data:', data);
  
  this.taskService.addTask(data as any).subscribe({
    next: (data) => {
      console.log('✅ Task added successfully:', data);
      this.filteredTasks.set([...this.filteredTasks(), data]);
      this.addTaskForm.reset();
      this.addTaskForm.enable();
      this.showAddTaskForm = false;
      this.isAdding.set(false);
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