
export interface userDetails{
    id:number;
    name:string;
    email:string;
    role:string; 
} 
export interface login{
    email:string;
    password:string;
}
export interface authResponse {
    token: string;
    user: userDetails;
}
export interface register {
   
    name: string;
    email: string;
    password:string;    
}