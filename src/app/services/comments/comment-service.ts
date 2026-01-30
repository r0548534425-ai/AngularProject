import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { addComment, CommentDetails, CommentsResponse } from '../../models/comments.model';
import { TaskDetails } from '../../models/tasks.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  
private http = inject(HttpClient); 
    private apiUrl = 'https://angulaerserver.onrender.com/api/comments/';


  addComment(comment:addComment) {
    return this.http.post<CommentsResponse>(`${this.apiUrl}`, comment,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  
  }
  getComments(taskId: number|null) {
    return this.http.get<CommentDetails[]>(`${this.apiUrl}?taskId=${taskId}`,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }

  deleteComment(commentId: number) {
    return this.http.delete(`${this.apiUrl}${commentId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }
  
}
