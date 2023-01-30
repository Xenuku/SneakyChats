import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-channelmanager',
  templateUrl: './channelmanager.component.html',
  styleUrls: ['./channelmanager.component.css']
})
export class ChannelmanagerComponent implements OnInit {
  @Input() users!: any;
  @Input() groups!: any;
  @Input() level!: any;
  selectedGroup: any;
  newChannelName: string = '';
  message: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }
  /**
   * Grabs the selected group's data from the API
   * @param group 
   */
  setSelectedGroup(group:any) {
    this.http.get<any>(`http://127.0.0.1:3000/api/groups/${group}`).subscribe((data) => {
      this.selectedGroup = data.group;
    });
  }

  /**
   * Adds channels to group
   * @param f Angular form
   */
  public addChannel(f: NgForm) {
    let oldChannels = this.selectedGroup.channels;
    if(this.newChannelName && !oldChannels.includes(this.newChannelName)) {
      oldChannels.push(this.newChannelName);
      this.http.put<any>(`http://127.0.0.1:3000/api/channels/${this.selectedGroup.group}`, {
         channels: oldChannels
      }).subscribe((data) => {
        if(data.ok === true) {
          oldChannels = [];
          this.message = data.message;
          f.reset();
        } else {
          this.message = data.message;
        }
      });
    } else {
      this.message = "Channel already exists in this group or channel input is empty";
    }
    setTimeout(() => {
      this.message = '';
    }, 1000);
  }

  /**
   * Deletes a channel from the current group
   * @param channel 
   */
  public deleteChannel(channel: string) {
    let currentChannels = this.selectedGroup.channels;
    currentChannels.splice(currentChannels.indexOf(channel), 1);
    this.http.put<any>(`http://127.0.0.1:3000/api/channels/${this.selectedGroup.group}`, {
         channels: currentChannels
      }).subscribe((data) => {
        if(data.ok === true) {
          this.message = data.message;
        }
      });
      setTimeout(() => {
        this.message = '';
      }, 1000);
  } 
}
