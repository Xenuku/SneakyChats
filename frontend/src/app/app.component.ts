import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isLoggedIn: any;

  userLevel: any;
  userRoles: any;
  moderator: any;
  canManage: boolean = false;
  constructor(
    private router: Router, 
    private storageService: StorageService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (localStorage.getItem("logged_in") === "true") {
      this.isLoggedIn = true;
    }
    
    if(this.isLoggedIn) {
      this.http.get<any>(`http://127.0.0.1:3000/api/users/${localStorage.getItem("username")}`).subscribe((data) => {
        this.userLevel = data.user.level;
        this.userRoles = data.user.groups;
        this.moderator = this.userRoles?.some((group: any) => group.role === "Moderator");
        if(this.userLevel === "superadmin" || this.userLevel === "group_admin" || this.moderator === true) { 
          this.canManage = true;
        } else {
          this.canManage = false;
        }
      });
     
      
    }
    // Determines whether or not the 'manage' button is shown in navigation
    this.storageService.getObservable().subscribe((data) => {
      this.isLoggedIn = data.loggedIn;
      this.userLevel = data.isAdmin;
      this.moderator = data.moderator;
      if(this.userLevel === "superadmin" || this.userLevel === "group_admin" || this.moderator === true) { 
        this.canManage = true;
      } else {
        this.canManage = false;
      }
    });
  }
  // Delete all local storage, set logged_in false to be sure
  // Take the user back to /login
  public logout() {
    localStorage.clear();
    localStorage.setItem("logged_in", "false");
    this.isLoggedIn = false;
    this.router.navigateByUrl("/login");
  }
}
