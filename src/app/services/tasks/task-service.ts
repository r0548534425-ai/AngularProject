import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { addTask , TaskDetails, updateTask } from '../../models/tasks.model';
import { TasksComment } from '../../componnents/tasks-comment/tasks-comment';
import { addComment, CommentDetails, CommentsResponse } from '../../models/comments.model';

@Injectable({
  providedIn: 'root',
})
export class TaskServer {
  private http = inject(HttpClient); 
    private apiUrl = 'http://localhost:3000/api/tasks';
    
  getTasks() {
    return this.http.get<any[]>(this.apiUrl,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
  
    });
  }
  addTask(task: addTask) {
    return this.http.post<TaskDetails>(this.apiUrl, task,{
       headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }
  updateTask(taskId: number|null, task: any) { 
    return this.http.patch<TaskDetails>(`${this.apiUrl}/${taskId}`, task,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }
  deleteTask(taskId: number|null) {  
    return this.http.delete<any>(`${this.apiUrl}/${taskId}`,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }
  getTasksByProject(projectId: number|null) {
    return this.http.get<TaskDetails[]>(`${this.apiUrl}?projectId=${projectId}`,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }
  
}
