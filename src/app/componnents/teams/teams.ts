import { Component, inject, OnInit, signal } from '@angular/core';
import {  TeamDetails } from '../../models/teams.model';
import { TeamService } from '../../services/teams/teamService';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/authService';

@Component({
  selector: 'app-teams',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
})
export class Teams implements  OnInit {
  
  teams = signal<TeamDetails[]>([]);
  users = signal<any[]>([]);
  
  // Loading states
  isLoading = signal<boolean>(false);
  isAdding = signal<boolean>(false);
  isAddingMember = signal<boolean>(false);
  
  private teamService=inject(TeamService);
  private authService=inject(AuthService);
    private fb = inject(FormBuilder);
    showAddTeamForm : boolean = false
    selectedTeamId: number | null = null;
    teamId: number = 0;
    addTeamForm = this.fb.group({
      name: ['',[Validators.required]]
    });
    addMemberForm = this.fb.group({
      userId: ['',[Validators.required]],
      role: ['',[Validators.required]]
    });

  ngOnInit() {

    this.isLoading.set(true);
    this.loadTeams();
    this.loadUsers();
    
  }
    loadUsers()
    {
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }
  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (data) => {
        // ודא שלכל צוות יש members_count
        const teamsWithCount = data.map(team => ({
          ...team,
          members_count: team.members_count || 0
        }));
        this.teams.set(teamsWithCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        this.isLoading.set(false);
      }
    });
  }


  
  toggleForm() {
    this.showAddTeamForm = !this.showAddTeamForm;
  }
  toggleMember(teamId: number) {
    this.selectedTeamId = this.selectedTeamId === teamId ? null : teamId;
    this.teamId = teamId;

  }
  addTeam() {
    if (this.addTeamForm.invalid || this.isAdding()) return;
    
    this.addTeamForm.disable();
    this.isAdding.set(true);
    
    const data=this.addTeamForm.value as {
      name: string;
    }
    this.teamService.addTeam(data).subscribe({
      next:(res)=>{
        console.log('Team added successfully', res);
        // הוסף members_count אם לא קיים
        const teamWithCount = { ...res, members_count: res.members_count || 0 };
        this.addTeamForm.reset();
        this.addTeamForm.enable();
        this.showAddTeamForm = false
        this.loadTeams();
        this.isAdding.set(false);
      },
      error:(err)=>{
        console.error('Adding team failed', err);
        this.addTeamForm.enable();
        this.isAdding.set(false);
      }
    }
      );
  }

  addMemberToTeam(){
    if (this.selectedTeamId === null || this.addMemberForm.invalid || this.isAddingMember()) return;
    
    this.addMemberForm.disable();
    this.isAddingMember.set(true);
    
    const data=this.addMemberForm.value as {
      userId: string;
      role: string;
    }
    this.teamService.addUserToTeam(data, this.selectedTeamId).subscribe({
      next:(res)=>{
        console.log('Member added successfully:', res);
        
        // עדכן את הצוות עם המספר החדש מהשרת
        this.teams.update(teams => 
          teams.map(team => 
            team.id === this.selectedTeamId 
              ? { ...team, members_count: res.members_count || (team.members_count || 0) + 1 }  
              : team
          )
        );
        this.addMemberForm.reset();
        this.addMemberForm.enable();
        this.selectedTeamId = null;
        this.isAddingMember.set(false);
      },
      error:(err)=>{
        console.error('Adding member failed', err); 
        this.addMemberForm.enable();
        this.isAddingMember.set(false);
      }
    }
      );
  }
}


 
   
        
       

   



