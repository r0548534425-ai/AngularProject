

export interface addComment {
    taskId: number;
    body: string;
}
export interface CommentsResponse {
    id: number;
    task_id: number;
    user_id: number;
    created_at: string;
    body: string;
}
export interface CommentDetails
   {
        id: number;
        task_id: number;
        user_id: number;
        body: string;
        created_at: string;
        author_name: string;
    }