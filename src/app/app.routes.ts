import { Routes } from '@angular/router';
import { Login } from './componnents/login/login';
import { Register } from './componnents/register/register';
import { Projects } from './componnents/projects/projects';
import { Teams } from './componnents/teams/teams';
import { Tasks } from './componnents/tasks/tasks';
import { TasksComment } from './componnents/tasks-comment/tasks-comment';
import { authGuard } from './guards/auth-guard';
import { Dashboard } from './componnents/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {path:'projects', component: Projects,canActivate: [authGuard]},
  {path:'projects/:teamId', component: Projects,canActivate: [authGuard]},
  {path:'teams', component: Teams,canActivate: [authGuard]},
  {path:'tasks', component: Tasks,canActivate: [authGuard]}, 
  {path:'tasks/:projectId', component: Tasks,canActivate: [authGuard]}, 
  {path:'comments/:taskId', component: TasksComment,canActivate: [authGuard]},
  {path:'dashboard', component: Dashboard, canActivate: [authGuard]}
  

  
  
];
