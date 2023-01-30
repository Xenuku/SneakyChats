import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  oldUsername = localStorage.getItem("username");
  username = localStorage.getItem("username");
  level    = localStorage.getItem("level");
  email    = localStorage.getItem("email");
  profilePicture: any = localStorage.getItem("profilePicture");
  message  = "";
  constructor(private http: HttpClient, library: FaIconLibrary, private router: Router) {
    library.addIconPacks(fas);
   }

  ngOnInit(): void {
    if(localStorage.getItem("logged_in") === "false" || 
       localStorage.getItem("logged_in") === undefined || 
       localStorage.getItem("logged_in") === null ) 
    {
      this.router.navigateByUrl("/");
    }
  }
  // Upload the profile picture to the database via the server. Once uploaded, it stores the new image in localStorage
  uploadProfilePicture(files: any) {
    let fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
    fileReader.onload = (e: Event) => {
      this.profilePicture = fileReader.result;
      this.http.put(`http://127.0.0.1:3000/api/users/upload/${this.username}`, {
        profile_picture: fileReader.result as string
      }).subscribe((data:any) => {
          if(data.ok === true) {
            this.message = data.message;
            localStorage.setItem("profilePicture", fileReader.result as string);
            setTimeout(() => {
              this.message = "";
            }, 2000);
          } else {
            this.message = data.message;
          }
      });
    }
  }

  // Update the users information, returns an error if password and confirm password do not match
  // If the password is left blank, then it will only change the username and email
  updateUser(f: NgForm)  {
    let query;
    if(f.value.password === "") {
      query = {
        username: f.value.username,
        email: f.value.email
      }
    } else {
      if(f.value.password !== f.value.confirm_password) {
        this.message = "Passwords do not match"
      } else {
        query = {
          username: f.value.username,
          email: f.value.email,
          password: f.value.password
        }
      }
    }

    if(query !== undefined) {
      this.http.put('http://127.0.0.1:3000/api/user/' + this.oldUsername, query).subscribe((data: any) => {
        if(data.ok === true) {
          localStorage.setItem("username", f.value.username);
          localStorage.setItem("email", f.value.email);
          this.message = data.message;
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          this.message = data.message;
        }
      });
    }
  }

}
