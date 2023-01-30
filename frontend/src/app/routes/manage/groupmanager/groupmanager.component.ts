import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-groupmanager',
  templateUrl: './groupmanager.component.html',
  styleUrls: ['./groupmanager.component.css']
})
export class GroupmanagerComponent implements OnInit {
  @Input() users!: any;
  @Input() groups!: any;
  @Input() level!: any;
  newGroupChannelName:string = '';
  newChannels: string[] = [];
  responseMessage: string = '';
  deletedGroupMessage: string = '';
  newGroupName: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  /**
   * Function for adding channels dynamically to a new group
   * @param channelName 
   */
   public addToNewGroupChannels(channelName:string) {
    if(!this.newChannels.includes(channelName) && channelName.length > 0) {
      this.newChannels.push(channelName.replace('_', '-'));
    }
  }

  /**
   * Adds a group to the database
   * @param f 
   */
  public addGroup(f: NgForm) {
    let currentAdmin = localStorage.getItem("username");
    if(f.value.newGroupName) {
      this.http.post<any>('http://127.0.0.1:3000/api/groups', {
        group: f.value.newGroupName.replace('_', '-'),
        channels: this.newChannels
      }).subscribe((data) => {
        if(data.ok === true) {
          this.responseMessage = data.message; 
          if(currentAdmin !== 'Super') {
            this.http.put<any>(`http://127.0.0.1:3000/api/users/${currentAdmin}/groups`, {
              group: f.value.newGroupName,
              role: 'Admin'
            }).subscribe((data)=>{
              if(data.ok === true) {
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              } else {
                this.responseMessage = data.message;
              }
            });
          } else {
            this.responseMessage = data.message;
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            
          }
        } else {
          this.responseMessage = data.message;
        }
      })
    } else {
      this.responseMessage = "Please enter a name for the group";
    }
  }

  /**
   * Deletes a group from database
   * @param deleteGroupForm 
   */
  public deleteGroup(deleteGroupForm: NgForm) {
    if(deleteGroupForm.value.group) {
      this.http.delete<any>(`http://127.0.0.1:3000/api/groups/${deleteGroupForm.value.group}`).subscribe((data) => {
        if(data.ok === true) {
          this.deletedGroupMessage = data.message;
          setTimeout(() => {
            window.location.reload();
          }, 2000)
        } else {
          this.deletedGroupMessage = data.message;
        }
      });
    } else {
      this.deletedGroupMessage = "Please select a group";
    }
  }

}
