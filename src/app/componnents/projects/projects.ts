import { Component, inject, signal, Signal } from '@angular/core';
import { ProjectService } from '../../services/projects/project-service';
import { addProjectect, ProjectDetails } from '../../models/project.model';
import { TeamService } from '../../services/teams/teamService';
import { TeamDetails } from '../../models/teams.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { computed } from '@angular/core';
import { TaskServer } from '../../services/tasks/task-service';
import { TaskDetails } from '../../models/tasks.model';
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
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-projects',
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
    MatBadgeModule
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  private projectService = inject(ProjectService);
  private teamService = inject(TeamService); 
  private taskService = inject(TaskServer);
  private fg = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  showAddProjectForm = signal(false);
  showProjectTasks: number|null = null;
  projects = signal<ProjectDetails[]>([]);
  projectTasks = signal<TaskDetails[]>([]);
  teams = signal<TeamDetails[]>([]);
  teamId: number|null = null;
  isTeamPage = signal<boolean>(false);
  panelOpenState = signal(false);
  
  // Loading states
  isLoading = signal<boolean>(false);
  isAdding = signal<boolean>(false);
  isLoadingTasks = signal<boolean>(false);
  
  addProjectForm = this.fg.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    teamId: [0], // לא נדרש כי נכפה אותו בקוד
    priority: ['normal', [Validators.required]]
  });
  filredProjects  = computed(() => {
    if (this.teamId === null) {
      return this.projects();
    }
      return this.projects().filter(project => project.team_id === this.teamId);
   
  });

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const id = params.get('teamId');
      this.teamId = id ? +id : null;
      this.isTeamPage.set(this.teamId !== null);
      
      console.log('Route params changed - teamId:', this.teamId, 'isTeamPage:', this.isTeamPage());
      
      // If we're viewing a specific team's projects, pre-fill the teamId
      if (this.teamId !== null) {
        this.addProjectForm.patchValue({ teamId: this.teamId });
        console.log('Pre-filled form with teamId:', this.teamId);
      }
    });

    this.loadProjects();
    this.loadTeams();
    
  }
  loadProjects(){
    this.isLoading.set(true);
    this.projectService.getProjects().subscribe({
      next: (data: ProjectDetails[]) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.isLoading.set(false);
      }
    });
  }
  loadTeams(){
    this.teamService.getTeams().subscribe((data: TeamDetails[]) => {
      this.teams.set(data);
    });
  }
  getTeamName(teamId: number): string {
    const team = this.teams().find(t => t.id === teamId);
    return team?.name || `Team ${teamId}`;
}
  addProject(){ 
      if (this.isAdding()) return;
      
      // בדיקה: אם לא בעמוד צוות ולא נבחר teamId
      if (this.teamId === null && (!this.addProjectForm.value.teamId || this.addProjectForm.value.teamId === 0)) {
        alert('אנא בחר צוות');
        return;
      }
      
      // בדיקה: שדות חובה
      if (this.addProjectForm.get('name')?.invalid || this.addProjectForm.get('description')?.invalid) {
        alert('אנא מלא את כל השדות');
        return;
      }
      
      this.addProjectForm.disable();
      this.isAdding.set(true);
      
      // אם אנחנו בעמוד צוות מסוים, כפה את ה-teamId
      const formData = this.addProjectForm.value;
      const newProject: addProjectect = {
        name: formData.name!,
        description: formData.description!,
        priority: formData.priority!,
        teamId: this.teamId !== null ? this.teamId : formData.teamId!
      };
      
      console.log('Adding project:', newProject);
      console.log('Current teamId from route:', this.teamId);
      console.log('Is team page:', this.isTeamPage());
      
      this.projectService.addProject(newProject).subscribe({
        next: (data) => {
          console.log('Project added successfully:', data);
          console.log('Project team_id:', data.team_id, 'Current filter teamId:', this.teamId);
          
          // רק אם הפרויקט שייך לצוות הנוכחי (או אין פילטר), הוסף אותו לרשימה
          if (this.teamId === null || data.team_id === this.teamId) {
            this.projects.set([...this.projects(), data]);
            console.log('Project added to display list');
          } else {
            console.log('Project added to different team, not showing in current view');
          }
          
          this.addProjectForm.enable();
          
          // Reset form with defaults
          this.addProjectForm.reset({ priority: 'normal', teamId: 0 });
          
          // If on team page, re-set the teamId
          if (this.teamId !== null) {
            this.addProjectForm.patchValue({ teamId: this.teamId });
          }
          
          this.panelOpenState.set(false);
          this.isAdding.set(false);
          
          this.snackBar.open('✅ הפרויקט נוסף בהצלחה!', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('Error adding project:', error);
          this.addProjectForm.enable();
          this.isAdding.set(false);
          
          this.snackBar.open('❌ שגיאה בהוספת הפרויקט', 'סגור', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
      });
}

deleteProject(projectId: number) {
  if (confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) {
    this.projectService.deleteProject(projectId).subscribe({
      next: () => {
        this.projects.set(this.projects().filter(p => p.id !== projectId));
        
        this.snackBar.open('✅ הפרויקט נמחק בהצלחה', 'סגור', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error: any) => {
        console.error('Error deleting project:', error);
        
        this.snackBar.open('❌ שגיאה במחיקת הפרויקט', 'סגור', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }
}

toggleProjectTasks(projectId: number) {
  if (this.showProjectTasks === projectId) {
    this.showProjectTasks = null;
  } else {
    this.showProjectTasks = projectId;
    this.ProjectTasks(projectId);
  }
}

ProjectTasks(projectId: number) {
    this.isLoadingTasks.set(true);
    this.taskService.getTasksByProject(projectId).subscribe({
        next: (tasks) => {
            console.log('Tasks for project', projectId, ':', tasks);  
            this.projectTasks.set(tasks);
            this.isLoadingTasks.set(false);
        },
        error: (error) => {
            console.error('Error fetching tasks for project:', error);
            this.isLoadingTasks.set(false);
        }
    });
}
}

