

export interface addTask {
    project_id: number;
    title: string;
   
}
export interface TaskDetails
    {
        id: number;
        project_id: number;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        assignee_id: number | null;
        due_date: string | null;
        order_index: number;
        created_at: string;
        updated_at: string;
    }
export interface updateTask {

     
    changes: Partial<TaskDetails>;
    
}



