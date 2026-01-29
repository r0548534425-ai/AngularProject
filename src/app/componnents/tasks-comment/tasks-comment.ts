import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskServer } from '../../services/tasks/task-service';
import { ActivatedRoute } from '@angular/router';
import { addComment, CommentDetails } from '../../models/comments.model';
import { TaskDetails } from '../../models/tasks.model';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommentService } from '../../services/comments/comment-service';

@Component({
  selector: 'app-tasks-comment',
  imports: [ReactiveFormsModule],  // ← תקן!
  templateUrl: './tasks-comment.html',
  styleUrl: './tasks-comment.css',
})
export class TasksComment implements OnInit {
  commentService = inject(CommentService);
  taskService = inject(TaskServer);
  fg = inject(FormBuilder);
  comments = signal<CommentDetails[]>([]);
  tasks = signal<TaskDetails[]>([]);
  router = inject(ActivatedRoute);
  showAddCommentForm: boolean = false;
  
  // Loading states
  isLoading = signal<boolean>(false);
  isAdding = signal<boolean>(false);
  
  commentForm = this.fg.group({ 
    body: ['', [Validators.required, Validators.minLength(3)]],  
  });

  taskId: number | null = null;
  
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
        this.showAddCommentForm = false;
        this.loadComments(this.taskId!);
        this.isAdding.set(false);
      },
      error: (err) => {
        console.error('Failed to add comment', err);
        this.commentForm.enable();
        this.isAdding.set(false);
      }
    });
  }
  
  toggleAddComment() {
    this.showAddCommentForm = !this.showAddCommentForm;
  }

  getTaskName(taskId: number): string {
    const task = this.tasks().find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  }
}