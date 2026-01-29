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
@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  projectService = inject(ProjectService);
  teamService = inject(TeamService); 
  taskService = inject(TaskServer);
  fg=inject(FormBuilder);
  showAddProjectForm: boolean = false;
  showProjectTasks: number|null = null;
  projects=signal<ProjectDetails[]>([]);
  projectTasks=signal<TaskDetails[]>([]);
  teams = signal<TeamDetails[]>([]);
  teamId:number|null=null;
  isTeamPage = signal<boolean>(false); // Whether we're on a team-specific page
  route = inject(ActivatedRoute);
  
  // Loading states
  isLoading = signal<boolean>(false);
  isAdding = signal<boolean>(false);
  isLoadingTasks = signal<boolean>(false);
  
  addProjectForm = this.fg.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    teamId: [0,[Validators.required]],
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
      
      // If we're viewing a specific team's projects, pre-fill the teamId
      if (this.teamId !== null) {
        this.addProjectForm.patchValue({ teamId: this.teamId });
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
      if (this.addProjectForm.invalid || this.isAdding()) return;
      
      this.addProjectForm.disable();
      this.isAdding.set(true);
      
      const newProject: addProjectect = this.addProjectForm.value as addProjectect;
      this.projectService.addProject(newProject).subscribe({
        next: (data) => {
          this.projects.set([...this.projects(), data]);
          this.addProjectForm.enable();
          
          // Reset form with defaults
          this.addProjectForm.reset({ priority: 'normal', teamId: 0 });
          
          // If on team page, re-set the teamId
          if (this.teamId !== null) {
            this.addProjectForm.patchValue({ teamId: this.teamId });
          }
          
          this.showAddProjectForm = false;
          this.isAdding.set(false);
        },
        error: (error) => {
          console.error('Error adding project:', error);
          this.addProjectForm.enable();
          this.isAdding.set(false);
        },
      });
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
toggleAddProject() {
    this.showAddProjectForm = !this.showAddProjectForm;
    
    // Reset form when opening
    if (this.showAddProjectForm) {
        this.addProjectForm.reset({ priority: 'normal', teamId: 0 });
        
        // If we're on a team page, set and lock the teamId
        if (this.teamId !== null) {
            this.addProjectForm.patchValue({ teamId: this.teamId });
        }
    }
}
}

