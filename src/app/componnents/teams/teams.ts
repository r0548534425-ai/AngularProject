import { Component, inject, OnInit, signal } from '@angular/core';
import {  TeamDetails } from '../../models/teams.model';
import { TeamService } from '../../services/teams/teamService';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/authService';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-teams',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatListModule,
    MatBadgeModule,
    MatDividerModule
  ],
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
  panelOpenState = signal(false);
  addMemberPanelState = signal<number | null>(null);
  
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  selectedTeamId: number | null = null;
  teamId: number = 0;
  
  addTeamForm = this.fb.group({
    name: ['', [Validators.required]]
  });
  
  addMemberForm = this.fb.group({
    userId: ['', [Validators.required]],
    role: ['', [Validators.required]]
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
        this.panelOpenState.set(false);
        this.loadTeams();
        this.isAdding.set(false);
        
        this.snackBar.open('✅ הצוות נוסף בהצלחה!', 'סגור', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error:(err: any)=>{
        console.error('Adding team failed', err);
        this.addTeamForm.enable();
        this.isAdding.set(false);
        
        this.snackBar.open('❌ שגיאה בהוספת הצוות', 'סגור', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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
        
        // טען מחדש את כל הצוותים מהשרת כדי לקבל את המספר האמיתי
        this.loadTeams();
        
        this.addMemberForm.reset();
        this.addMemberForm.enable();
        this.selectedTeamId = null;
        this.isAddingMember.set(false);
        
        this.snackBar.open('✅ חבר צוות נוסף בהצלחה!', 'סגור', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error:(err: any)=>{
        console.error('Adding member failed', err); 
        this.addMemberForm.enable();
        this.isAddingMember.set(false);
        
        this.snackBar.open('❌ שגיאה בהוספת חבר צוות', 'סגור', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteTeam(teamId: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק את הצוות?')) {
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.teams.set(this.teams().filter(t => t.id !== teamId));
          
          this.snackBar.open('✅ הצוות נמחק בהצלחה', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          console.error('Error deleting team:', error);
          
          this.snackBar.open('❌ שגיאה במחיקת הצוות', 'סגור', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}


 
   
        
       

   



