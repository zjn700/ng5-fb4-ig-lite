import { EventEmitter } from '@angular/core';
import { Observable } from "rxjs/Observable"
import { Subject } from 'rxjs/Subject';


// @Injectable()
export class UserService {
  
  public statusChange: any = new EventEmitter<any>()
  private userProfile = new Subject<any>();
  public currentUser: any;
  
  constructor() { }
  
  setUserProfile(user: any) {
    // two different solutions to the same problem
    this.userProfile.next(user);
    this.statusChange.emit(user)
    this.currentUser = user

    localStorage.setItem('user', JSON.stringify(user));
    //console.log("setUserProfile in UserService", user)
  }
  
  
  getUserProfile(): Observable<any> {
    return this.userProfile.asObservable();
  }
  
  getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
  
  getCurrentUser() {
    return this.currentUser
  }
  
  
  destroy() {
      localStorage.removeItem('user');
      this.statusChange.emit(null)

  }
}

// import { BehaviorSubject } from 'rxjs/BehaviorSubject';


  // private userProfileData = new BehaviorSubject<any>({name:"USER"});
    
    // // UNNECESSARY  
    // this.userProfileData.next(user); // BehaviorSubject
    // //console.log('this.userProfileData', this.userProfileData.getValue())

  // getUserProfileData() {
  //   return this.userProfileData.getValue()
  // }