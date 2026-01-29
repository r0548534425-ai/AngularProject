
export interface TeamDetails {
    id: number;
    name: string;
    created_at: string;
    members_count: number;
}
export interface addTeam {
    name: string;
}
export interface addMember {
    userId: string;
    role: string;
}


