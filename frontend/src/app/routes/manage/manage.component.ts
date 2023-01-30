import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  level: any = localStorage.getItem("level");
  currentView = 'adminHome';
  groupadmin: any;
  users: any;
  user: any = '';
  userLevel = 'user';
  groups: any;
  moderatorGroups:any;
  userCount: string = '';
  groupCount: string = '';
  messageCount:string = '';
  
  
  superadmin: any;
  constructor(private http: HttpClient, library: FaIconLibrary, private router: Router) {
    library.addIconPacks(fas);
  }

  ngOnInit(): void {
    // Get moderator groups/check if moderator
    let checkRoles = JSON.parse(localStorage.getItem("groups") || "");
    let isModerator = checkRoles.some((group: any) => group.role === "Moderator");
    if(this.level === "group_admin" || this.level === "superadmin" || isModerator) { 
      // Assignment 2: Create a logging system for admins to view recent events, add to database
      console.log("Admin Panel accessed by", localStorage.getItem("username"));
    }  else {
      this.router.navigateByUrl('/');
    }
    // Redirect if not logged in
    if(localStorage.getItem("logged_in") === "false" || 
       localStorage.getItem("logged_in") === undefined || 
       localStorage.getItem("logged_in") === null ) { this.router.navigateByUrl("/"); }

    // Redirect user if they're not meant to be here     
     

    // Determine if user is superadmin
    if(this.level === "superadmin") {
      this.superadmin = true;
    }
    // Check the users level if they're a group admin or not to display menu options
    if(this.level === "group_admin" || this.level === "superadmin") {
      this.groupadmin = true;
    }

    // Get all users
    this.http.get<any>('http://127.0.0.1:3000/api/users')
    .subscribe(data => {
      this.users = data.users;
      this.userCount = data.users.length;
      // Now get the groups data for the current admin (only groups they can edit)
      this.http.get<any>('http://127.0.0.1:3000/api/groups')
      .subscribe(data => {
        if(!this.superadmin) {
          let uname = localStorage.getItem("username");
          let currentAdmin;
          this.http.get<any>(`http://127.0.0.1:3000/api/users/${uname}`).subscribe((data) => {
            currentAdmin = data.user;
            // Current Admin's groups they are admin of
            this.groups = currentAdmin.groups.filter((group:any) => group.role === 'Admin');
          })
          // Also assign moderator groups if any
          this.moderatorGroups = checkRoles.filter((group: any) => group.role === "Moderator");
        } else {
          this.groups = data.groups;
        }
        this.groupCount = data.groups.length;
      });
    });
    // Get the counts for stats for admin home panel
    this.http.get<any>('http://127.0.0.1:3000/api/messageCount')
      .subscribe(data =>  {
        this.messageCount = data.count;
    })
  }
  

  /**
   * Change between 'panels'
   * @param view 
   */
  toggleView(view:any) {
    // Change between components
    this.currentView = view;
  }

}