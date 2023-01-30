import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-moderatorpanel',
  templateUrl: './moderatorpanel.component.html',
  styleUrls: ['./moderatorpanel.component.css']
})
export class ModeratorpanelComponent implements OnInit {
  @Input() users!: any;
  @Input() groups!: any;
  @Input() moderatorGroups!: any;
  selectedGroup: any;
  moderatorUsers: any;
  user: any;
  modSelectedGroup: any;
  modChannelSelectedGroup: any;
  moderatorChannelAccessMessage: string = '';
  moderatorChannelCreateMessage: string = '';
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  /**
   * Grabs the selected users data from the list of users previously fetched by database
   * @param user 
   */
  setSelectedUser(user:any) {
    this.user = this.users.find((users: any) => users.username === user);
    this.selectedGroup = '';
  }
  
  // Set the user for the form to load only relevant data
  public setModSelectedUser(user: any) {
    this.user = this.users.find((users: any) => users.username === user);
  }
  // Sets the selected group that the moderator is a part of, so the form can display
  // users in that group
  public setSelectedModeratorGroup(groupName: any) {
    this.http.get<any>(`http://127.0.0.1:3000/api/users/group/${groupName}`).subscribe((data) => { 
      this.moderatorUsers = data;
    });
    this.http.get<any>(`http://127.0.0.1:3000/api/groups/${groupName}`).subscribe((data) => {
      this.modSelectedGroup = data.group;
    });
  }
  // Sets the selected users channels to the this.modChannelSelectedGroup so they load only
  // relevant channels to the user in the form
  public setSelectedGroupForChannels(groupName: any) {
    this.http.get<any>(`http://127.0.0.1:3000/api/groups/${groupName}`).subscribe((data) => {
      this.modChannelSelectedGroup = data.group;
    });
  }
  // Update the channel access for a user
  public moderatorChannelAccess(modChannels: NgForm) {
    this.http.put<any>(`http://127.0.0.1:3000/api/users/${modChannels.value.user}/${modChannels.value.group}/mod`, {
      channels: modChannels.value.channels
    }).subscribe((data) => {
      if(data.ok) {
        this.moderatorChannelAccessMessage = data.message;
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        this.moderatorChannelAccessMessage = data.message;
      }
    })

  }
  // Create channels for the group the user is a moderator of
  public moderatorChannelCreate(modChannelAdd: NgForm) {
    if(modChannelAdd.value.channel) {
      this.http.put(`http://127.0.0.1:3000/api/channels/${modChannelAdd.value.group}/mod`, {
        channel: modChannelAdd.value.channel
      }).subscribe((data:any ) => {
        if(data.ok) {
          this.moderatorChannelCreateMessage = data.message;
          setTimeout(() => {
            modChannelAdd.reset();
            this.moderatorChannelCreateMessage = '';
          }, 1500);
        } else {
          this.moderatorChannelCreateMessage = data.message;
        }
      });
    } else {
      this.moderatorChannelCreateMessage = "Please enter a channel name"
    }
  }
}
