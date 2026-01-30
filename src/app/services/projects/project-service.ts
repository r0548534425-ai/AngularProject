import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { addProjectect, ProjectDetails } from '../../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectService = inject(HttpClient);
  private apiUrl = 'https://angulaerserver.onrender.com/api/projects';
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

  deleteProject(projectId: number) {
    return this.projectService.delete(`${this.apiUrl}/${projectId}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }

  // getProjectById(projectId: string) {
  //   return this.projectService.get<ProjectDetails>(`${this.apiUrl}/${projectId}`,{
  //     headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}`
  //   }
  //   }
  //   );
  // }
}

