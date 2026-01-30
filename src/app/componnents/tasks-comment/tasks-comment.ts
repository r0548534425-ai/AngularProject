import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskServer } from '../../services/tasks/task-service';
import { ActivatedRoute } from '@angular/router';
import { addComment, CommentDetails } from '../../models/comments.model';
import { TaskDetails } from '../../models/tasks.model';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommentService } from '../../services/comments/comment-service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-tasks-comment',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './tasks-comment.html',
  styleUrl: './tasks-comment.css',
})
export class TasksComment implements OnInit {
  private commentService = inject(CommentService);
  private taskService = inject(TaskServer);
  private fg = inject(FormBuilder);
  private router = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  comments = signal<CommentDetails[]>([]);
  tasks = signal<TaskDetails[]>([]);
  panelOpenState = signal(false);
  
  // Loading states
  isLoading = signal<boolean>(false);
  isAdding = signal<boolean>(false);
  
  commentForm = this.fg.group({ 
    body: ['', [Validators.required, Validators.minLength(3)]],  
  });

  taskId: number | null = null;
  taskTitle = signal<string>('');
  
  ngOnInit() {
    this.router.paramMap.subscribe(params => {
      const idParam = params.get('taskId');
      this.taskId = idParam ? +idParam : null;
      
      if (this.taskId) {
        this.loadComments(this.taskId);
      }
    });
    
    this.loadTasks();
  }
  
  loadComments(taskId: number) {
    this.isLoading.set(true);
    this.commentService.getComments(taskId).subscribe({
      next: (data: CommentDetails[]) => {
        this.comments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load comments', err);
        this.isLoading.set(false);
      }
    });
  }
  
  loadTasks() {
    this.taskService.getTasks().subscribe((data: TaskDetails[]) => {
      this.tasks.set(data);
    });
  }
  
  addComment() {
    if (!this.taskId || this.commentForm.invalid || this.isAdding()) return;
    
    this.commentForm.disable();
    this.isAdding.set(true);
    
    const commentData: addComment = {
      taskId: this.taskId,  
      body: this.commentForm.value.body!
    };
    
    this.commentService.addComment(commentData).subscribe({  
      next: (res) => {
        console.log('Comment added successfully', res);
        this.commentForm.reset();
        this.commentForm.enable();
        this.panelOpenState.set(false);
        this.loadComments(this.taskId!);
        this.isAdding.set(false);
        
        this.snackBar.open('✅ התגובה נוספה בהצלחה!', 'סגור', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err: any) => {
        console.error('Failed to add comment', err);
        this.commentForm.enable();
        this.isAdding.set(false);
        
        this.snackBar.open('❌ שגיאה בהוספת התגובה', 'סגור', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteComment(commentId: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק את התגובה?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments.set(this.comments().filter(c => c.id !== commentId));
          
          this.snackBar.open('✅ התגובה נמחקה בהצלחה', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          console.error('Error deleting comment:', error);
          
          this.snackBar.open('❌ שגיאה במחיקת התגובה', 'סגור', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getTaskName(taskId: number): string {
    const task = this.tasks().find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  }
}