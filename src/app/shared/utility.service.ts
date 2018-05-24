import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable()
export class UtilityService {

  // no http or firebase calls
  constructor(private notificationService: NotificationService) { }
  
  checkForPosts(posts, message, type) {
    console.log("in checkForPosts")
      if (posts.length==0) {
        console.log('wtf')
        this.notificationService.display(type, message)
      }        
  }
  
  // promise model
  doAsyncTask() {
      var promise = new Promise((resolve, reject) => {
        const randomNumberBetween0and1 = Math.floor(Math.random() * 2)
        // let error = ;
        setTimeout(() => {
          if (randomNumberBetween0and1 < 1) {  // error
            reject('error'); // pass values
          } else {
            resolve('done'); // pass values
          }
        }, 1000);
      });
      return promise;
    }


  doAsyncTask2(uid, followedUserList) {
      console.log("doAsyncTask2", uid, followedUserList)
    return new Promise((resolve, reject) => {
        let followed=null
        for (let i=0; i < followedUserList.length; i++) {
           if (uid===followedUserList[i].uid) {
             followed = followedUserList[i].name
             //console.log('++++++ before break', followed)
             break;
           }
        }
        // return followed;
        resolve(followed); // pass values
    });
  }
  
  
  
        // PROMISE TEST 1 - SIMPLE PROMISE
        // this.utilityService.doAsyncTask()
        //   .then(
        //     (val) => console.log(val),
        //     (err) => console.error(err)
        //   )

        // PROMISE TEST 2
        // as called from a component with multiple steps
        //   this.utilityService.doAsyncTask2()
        //           .then(
        //               (val) => {
        //                 console.log("val =====", val);
        //                 return "blah"; 
        //               }
        //           )
        //           .then( 
        //               (val) => {
        //                 console.log("val2 ", val);
        //                 throw new Error(JSON.stringify({id: "2", message: "You fucked up."}));
        //               }
        //           )
        //           .catch(
        //               (err) => {
        //                 console.error(err);
        //                 console.log(JSON.parse(err.message).message)
        //               }
        //           )
}