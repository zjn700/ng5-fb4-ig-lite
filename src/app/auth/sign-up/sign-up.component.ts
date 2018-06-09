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
    
    //console.log(fullname, email, password)
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userData => {
        userData.sendEmailVerification();
        //console.log("userData create user", userData)
        const message = `A verification email was sent to ${email}`;
        
        this.notificationService.display('success', message )
        
        // firebase.auth().signInWithEmailAndPassword(email, password)
        //   .then(userData => {        
        
           return firebase.database().ref('usersHoldingArea/' + userData.uid).set({
              email: email,
              uid: userData.uid,
              name: fullname,
              registrationDate: new Date().toString()
            })
            .then(()=>{
              //console.log("then after holding area sign up")
              firebase.auth().signOut();
            })        
        
        
            // //console.log("userData sign-in", userData)
            // return firebase.database().ref('users/' + userData.uid).set({
            //   email: email,
            //   uid: userData.uid,
            //   name: fullname,
            //   registrationDate: new Date().toString()
            // })
            // .then(()=>{
            //   //console.log("then after sign up")
            //   firebase.auth().signOut();
            // })
          // })
          
        
      })
      // sign-up error
      .catch(err => {
        this.notificationService.display('error', err.message)
        //console.log(err)
      })
  }

}
