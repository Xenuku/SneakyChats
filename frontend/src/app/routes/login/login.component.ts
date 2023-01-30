import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  error = false;
  constructor(
    private router: Router, 
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    if(localStorage.getItem("logged_in") === "true") {
      this.router.navigateByUrl("/account");
    }
  }
  // On submit, send a post request to server, if it responds that the information is correct, store it in localStorage
  public onSubmit(f: NgForm) {
    this.error = false;
    this.http.post<any>('http://127.0.0.1:3000/api/login', {username: f.value.username, password: f.value.password}).subscribe(data => {
      if(data.ok === true) {
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("groups", JSON.stringify(data.user.groups));
        localStorage.setItem("level", data.user.level);
        localStorage.setItem("room", "Global_Main");
        localStorage.setItem("logged_in", "true");
        localStorage.setItem("profilePicture", data.user.profile_picture || 'assets/default.jpg');
        let isModerator = data.user.groups.some((group: any) => group.role === "Moderator");
        this.storageService.onUserLogin({loggedIn: true, isAdmin: data.user.level, moderator: isModerator});
        this.router.navigateByUrl("/chat");
      } else {
        this.error = true;
      }
    });
  }
}
