import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-usermanager',
  templateUrl: './usermanager.component.html',
  styleUrls: ['./usermanager.component.css']
})
export class UsermanagerComponent implements OnInit {
  @Input() users!: any;
  @Input() groups!: any;
  @Input() level:any;
  superadmin: boolean = false;
  message: string = '';
  addUserMessage: string = '';
  editUserMessage: string = '';
  deleteMessage: string = '';
  editLevelMessage: string = '';
  userLevel: string = 'user';
  user: any;
  groupsUserIsNotIn: any = [];
  selectedGroup: any;
  selectedEditUser: any;
  inGroup: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if(this.level === "superadmin") {
      this.superadmin = true;
    }
  }
  /**
   * Grabs the selected users data from the list of users previously fetched by database
   * @param user 
   */
   setSelectedUser(user:any) {
    this.user = this.users.find((users: any) => users.username === user);
    this.groupsUserIsNotIn = this.groups.filter((group: any) => !this.user.groups.some((userGroup: any) => group.group === userGroup.group));
    this.selectedGroup = '';
  }

  /**
   * Grabs the selected users data from the list of users previously fetched by database
   * Different to setSelectedUser as setting a selectedUser when just editing the level caused both forms to update (dynamically)
   * @param user 
   */
  setSelectedEditUser(user: any) {
    this.selectedEditUser = this.users.find((users: any) => users.username === user);
    this.selectedGroup = '';
  }

  /**
   * Grabs the selected group's data from the previously fetched group list
   * @param group 
   */
  setSelectedUserGroup(group:any) {
    this.http.get<any>(`http://127.0.0.1:3000/api/groups/${group}`).subscribe((data) => {
      this.selectedGroup = data.group;
      if(this.user) {
        let checkGroup = this.user.groups.filter((userGroups:any ) => userGroups.group === this.selectedGroup.group);
        this.inGroup = checkGroup.length > 0;
        
      }
    });
  }

  /**
   * Add a new user to the database
   * @param f 
   */
   public addUser(f: NgForm) {
    this.message = "";
    if(f.value.username && f.value.password && f.value.email) {
      this.http.post<any>('http://127.0.0.1:3000/api/users', 
                          {
                            username: f.value.username, 
                            password: f.value.password,
                            email: f.value.email,
                            groups: [],
                            profile_picture: "assets/default.jpg",
                            level: this.userLevel
                          })
      .subscribe(data => {
        if(data.ok === true) {
          this.addUserMessage = data.message;
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          this.addUserMessage = data.message;
        }
      });
    } else {
      this.addUserMessage = "Please fill out at least: Username, Password and Email";
    }
  }

  /**
   * Edit the selected user's groups and channel access in those groups
   * @param eUF Edit User Form 
   */
   editUsersGroups(eUF: NgForm) {
    let query;
    // Adding access to group
    if(eUF.value.inGroup) {
      query = {
        canAccess: eUF.value.inGroup,
        username: eUF.value.user,
        group: eUF.value.group,
        roleForGroup: eUF.value.roleInGroup || 'member',
        channels: eUF.value.channels
      }
    } else {
      // Denying or removing access to group
      query = {
        canAccess: eUF.value.inGroup,
        username: eUF.value.user,
        group: eUF.value.group
      }
    }
    this.http.put<any>(`http://127.0.0.1:3000/api/users/${eUF.value.user}/${eUF.value.group}`, {
        query: query
    }).subscribe((data) => {
      if(data.ok === true) {
        this.editUserMessage = data.message;
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        this.editUserMessage = data.message;
      }
    });
  }

  /**
   * Edit a users level
   * @param editUserLevels 
   */
  editUser(editUserLevels: NgForm) {
    this.http.put<any>(`http://127.0.0.1:3000/api/users/${editUserLevels.value.user}/level`, {
      level: editUserLevels.value.editUserLevel
    }).subscribe((data) => {
      this.editLevelMessage = data.message;
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });
  }
  
  /**
   * Delete a user from the database
   * @param deleteUserForm 
   */
  deleteUser(deleteUserForm: NgForm) {
    if(deleteUserForm.value.user) {
      this.http.delete<any>(`http://127.0.0.1:3000/api/users/${deleteUserForm.value.user}`)
        .subscribe(data => {
          if(data.ok === true) {
            this.deleteMessage = "User was deleted, updating...";
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            this.deleteMessage = "Unable to delete user, check server logs for more information";
          }
        });
    } else {
      this.deleteMessage = "Please select a user";
    }
  }
}
