import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('messageHolder') messageHolder: any;
  username = localStorage.getItem("username");
  room = localStorage.getItem("room");
  currentChannel = 'Main';
  selectedImage: any;
  selectedImagePath = '';
  // Initial welcome message
  messages: any = [{
    profile_picture: 'assets/default.jpg', 
    username: "SneakyBOT", text: "You have joined Sneaky Chat!", 
    time: moment().utcOffset('+1000').format('h:mm a')
  }];
  users: any = [];
  rooms: any = [];
  private socket = io('http://localhost:3000');

  constructor(private el: ElementRef, public library: FaIconLibrary, private http: HttpClient, private router: Router) {
    library.addIconPacks(fas) 
  }
  // When the user logins for the first time this is triggered, no history is obtained to keep clutter down
  public joinRoom(room: any) {
    this.socket.emit('join', this.username, room);
  }

  // When the user changes rooms, they will see the history for the room
  // and be taken to the new room, the server will broadcast leaving/joining in old/new rooms
  public changeRoom(newRoom: any, channelName: string) {
    this.currentChannel = channelName;
    let oldRoom = this.room;
    this.room = newRoom;
    this.socket.emit('changeRoom', {newRoom: this.room, oldRoom: oldRoom});
    this.socket.on('roomHistory', (data:any) => {
      this.messages = data.history || [];
    });
    
  }
  // If the user selects an image to send in chat, it will ask them to confirm
  // If it is confirmed, then the image is emitted to the server, which stores it
  // and sends it back to all clients in the room
  chatImageSelected(files: any) {
    if(confirm("Send image?")) {
      let fileReader = new FileReader();
      fileReader.readAsDataURL(files[0]);
      fileReader.onload = (e: Event) => {
        this.selectedImage = fileReader.result;
        this.socket.emit("chat-image", this.username, this.selectedImage as string)
      }
    }
  }
  // Sends the users message to the server, clears the input and sets focus back on it
  public sendMessage(f: NgForm) {
    this.socket.emit("message", this.username, f.value.message);
    // Get message box so it can put the cursor back in the input
    // After submission
    const sendMessageBox = this.el.nativeElement.querySelectorAll('#message');
    f.reset();
    sendMessageBox[0].focus();
  }

  async ngOnInit(): Promise<void> {
    if(localStorage.getItem("logged_in") === "false" || 
       localStorage.getItem("logged_in") === undefined || 
       localStorage.getItem("logged_in") === null ) 
    {
      this.router.navigateByUrl("/");
    }
    this.joinRoom(this.room);
    this.socket.on('usersInRoom', (data: any) => { 
      this.users = [];
      if(this.room == data.room) {
        data.users.map((user:any) => this.users.push(user.username));
      }
    });
    this.socket.on('groupList', (data: any) => {
      let rooms: any = [];
      data.groupList.forEach((group:any) => {
        rooms.push({group: group.group, channels: group.channels});
      });
      localStorage.setItem("rooms", JSON.stringify(rooms));
      this.rooms = rooms;
    });
    this.socket.on('chat-image', (message: any) => {
      this.http.get<any>(`http://127.0.0.1:3000/api/users/${message.username}`).subscribe((data) => {
        if(data.user.profile_picture) {
          this.messages.push({
            "profile_picture": data.user.profile_picture, 
            "username": message.username, 
            "image": message.image, 
            "time": message.time
          });  
        } else if(data.user.profile_picture == "" || message.profile_picture === undefined) {
          this.messages.push({
            "profile_picture": 'assets/default.jpg', 
            "username": message.username, 
            "text": message.text, 
            "time": message.time
          });
        }
      })
      
      setTimeout(() => {
        this.messageHolder.nativeElement.scrollTop = this.messageHolder.nativeElement.scrollHeight;
      }, 150);
    })


    this.socket.on('message', (message: any) => {
      this.http.get<any>(`http://127.0.0.1:3000/api/users/${message.username}`).subscribe((data) => {
        if(data.user.profile_picture) {
          this.messages.push({
            "profile_picture": data.user.profile_picture, 
            "username": message.username, 
            "text": message.text, 
            "time": message.time
          });  
        } else if(data.user.profile_picture == "" || message.profile_picture === undefined) {
          this.messages.push({
            "profile_picture": 'assets/default.jpg', 
            "username": message.username, 
            "text": message.text, 
            "time": message.time
          });
        }
      })
      
      setTimeout(() => {
        this.messageHolder.nativeElement.scrollTop = this.messageHolder.nativeElement.scrollHeight;
      }, 150);
    });
  }
  async ngOnDestroy(): Promise<void> {
    this.socket.disconnect();
  }

}
