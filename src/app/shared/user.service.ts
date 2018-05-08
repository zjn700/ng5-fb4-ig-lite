import { Observable } from "rxjs/Observable"
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


// @Injectable()
export class UserService {
  
  user = null;
    
  private userProfile = new Subject<any>();
  private userProfileData = new BehaviorSubject<any>({name:"USER"});
  // private dataSource = new BehaviorSubject<SnapshotSelection>(new Data());
  // profile = this.userProfileData.asObservable();


  constructor() { }
  
  setUserProfile(user: any) {
    this.userProfile.next(user);
    
    // PROBABLY UNNECESSARY   
    this.userProfileData.next(user);
    console.log('this.userProfile-1', this.userProfile)
    localStorage.setItem('user', JSON.stringify(user));
    console.log('data set in local storAGE')
    this.user = user;
    console.log('this.userProfileData', this.userProfileData.getValue())
  }

  getUserProfile(): Observable<any> {
    console.log("this.user-gup", this.user)
    console.log('this.userProfileData-gup', this.userProfileData.getValue())
    return this.userProfile.asObservable();
  }

  getUserProfileData() {
    return this.userProfileData.getValue()
  }
  
  destroy() {
      localStorage.removeItem('user');

  }
}
