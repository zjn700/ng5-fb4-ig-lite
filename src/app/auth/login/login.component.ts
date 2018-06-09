import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms'
import { NotificationService } from '../../shared/notification.service'
import { MyFireService } from '../../shared/my-fire.service'
import { UserService } from '../../shared/user.service'
import { Router } from '@angular/router'
import * as firebase from 'firebase'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  constructor(private notificationService: NotificationService, 
              private myFireService: MyFireService,
              private userService: UserService,
              private router: Router) { }

  ngOnInit() {
  }
  
  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(userData => {
        if (userData.emailVerified) {
           return this.myFireService.getUserFromDatabase(userData.uid)
        } else {
          const message = "Your email is not yet verified"
          this.notificationService.display('error', message)
          firebase.auth().signOut();
        }
      })
      .then(userDataFromDb => {
        if (userDataFromDb){
          //console.log("userDataFromDb", userDataFromDb)
          this.userService.setUserProfile(userDataFromDb)
          this.router.navigate(['/allposts'])
          // this.router.navigate(['/myposts'])
          // this.notificationService.display('success', `Welcome ${userDataFromDb.name}`)
            
        }
      })
      .catch(err => {
        this.notificationService.display('error', err.message)
      })
  }

}
