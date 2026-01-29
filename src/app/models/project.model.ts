export interface addProjectect {
    teamId: number;
    name: string;
    description: string;
    priority?: string;
}
export interface ProjectDetails {
    id: number;
    team_id: number;
    name: string;
    description: string;
    status: string;
    priority?: string;
    created_at: string;
   
}
