import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import * as firebase from 'firebase';

import { NotificationService } from '../../shared/notification.service'

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
  }
  
  onSubmit(form: NgForm) {
    
    const fullname = form.value.fullname;
    const email = form.value.email;
    const password = form.value.password;
    
    console.log(fullname, email, password)
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userData => {
        userData.sendEmailVerification();
        console.log(userData);
        const message = `A verification email was sent to ${email}`;
        
        this.notificationService.display('success', message )
        
        return firebase.database().ref('users/' + userData.uid).set({
          email: email,
          uid: userData.uid,
          name: fullname,
          registrationDate: new Date().toString()
        })
        .then(()=>{
          firebase.auth().signOut();
        })
        
      })
      .catch(err => {
        this.notificationService.display('error', err.message)
        console.log(err)
      })
  }

}
