import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
// import { Observable } from "rxjs/Observable"
import "rxjs/add/operator/takeWhile";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  alive: boolean = true;
  isLoggedIn: boolean = false;
  name: string = "User";
  email: string = null;
  uid: string = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnDestroy(){
    this.alive = false;
  }

  ngOnInit() {
    
    // check for logged in user, and, if so, update name
    const userInLocalStorage = localStorage.getItem('user')
    if (userInLocalStorage) {
      this.name = JSON.parse(userInLocalStorage).name
    }
    
    // the way recommended in the course with EventEmitter:
    const $user = this.userService.statusChange
      .subscribe(user=>{
        console.log("statusChange", user);
        if (user) {
          this.name= user.name;
        }
      })
    
    firebase.auth().onAuthStateChanged(userData => {
      if (userData && userData.emailVerified) {
        this.isLoggedIn = true;
        // the way recommended online with Subject
        const $profile = this.userService.getUserProfile()
        .takeWhile(() => this.alive)
        .subscribe((userData)=>{
          this.name= userData.name;
          $profile.unsubscribe()
        })
       
      } else {
        this.isLoggedIn = false;
        this.name = null;
        this.email= null;
        this.uid=null;
        firebase.auth().signOut();
      }
    })
  }
  
  
  onLogout() {
    firebase.auth().signOut()
      .then(()=> {
        this.userService.destroy();
        this.isLoggedIn = false;
        this.router.navigate(['/home'])
      })
  }

}


  // testGup(){
  //   console.log("tgup")
  //   const $profile = this.userService.getUserProfile()
  //   .subscribe((userData)=>{
  //     console.log('userData-olo', userData)
  //     // this.name= userData.name;
  //     $profile.unsubscribe()
      
  //   })
  // }