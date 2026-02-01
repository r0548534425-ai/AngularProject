import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { addProjectect, ProjectDetails } from '../../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectService = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/projects`;
  getProjects() {
    return this.projectService.get<any[]>(this.apiUrl,{
      headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}`
    } 
    }
    );
  }
 
  addProject(projectData: addProjectect) {
    return this.projectService.post<ProjectDetails>(this.apiUrl, projectData,{
      headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}`
    }
    }
    );
  }

 
}

