import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/authService';
import { TaskServer } from '../../services/tasks/task-service';
import { ProjectService } from '../../services/projects/project-service';
import { TeamService } from '../../services/teams/teamService';
import { TaskDetails } from '../../models/tasks.model';
import { ProjectDetails } from '../../models/project.model';
import { TeamDetails } from '../../models/teams.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskServer);
  private projectService = inject(ProjectService);
  private teamService = inject(TeamService);

  tasks = signal<TaskDetails[]>([]);
  projects = signal<ProjectDetails[]>([]);
  teams = signal<TeamDetails[]>([]);
  isLoading = signal(true);

  // סטטיסטיקות מחושבות
  totalTasks = computed(() => this.tasks().length);
  completedTasks = computed(() => this.tasks().filter(t => t.status === 'completed').length);
  todoTasks = computed(() => this.tasks().filter(t => t.status === 'todo').length);
  inProgressTasks = computed(() => this.tasks().filter(t => t.status === 'in_progress').length);
  
  totalProjects = computed(() => this.projects().length);
  totalTeams = computed(() => this.teams().length);
  
  recentTasks = computed(() => this.tasks().slice(0, 5));
  recentProjects = computed(() => this.projects().slice(0, 5));

  currentUser = computed(() => this.authService.currentUser());

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    // טעינת משימות
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks || []);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });

    // טעינת פרויקטים
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects || []);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });

    // טעינת צוותים
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.isLoading.set(false);
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 18) return 'צהריים טובים';
    return 'ערב טוב';
  }
}