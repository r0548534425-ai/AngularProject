import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { userDetails } from '../../models/auth.model';
import { addMember, addTeam } from '../../models/teams.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
    private http = inject(HttpClient); 
    private apiUrl = 'https://angulaerserver.onrender.com/api/teams';
    
  getTeams() {
    return this.http.get<any[]>(`${this.apiUrl}`,{
      headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}`
    } 
    }
    );
  } 
  addTeam(data: addTeam) {
        return this.http.post<any>(`${this.apiUrl}`, data,{
          headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }

        }
      );
    }
    
    addUserToTeam(data: addMember,teamId:number|string) {
      return this.http.post<any>(`${this.apiUrl}/${teamId}/members`, data,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}`
      } 
      }
      );
    }

    deleteTeam(teamId: number) {
      return this.http.delete(`${this.apiUrl}/${teamId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
    }
}
