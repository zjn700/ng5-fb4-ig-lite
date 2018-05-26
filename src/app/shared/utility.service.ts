import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import * as $ from 'jquery';

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
  
  scaleImagexxx(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {

    var result = { width: 0, height: 0, fScaleToTargetWidth: true, targetleft: 0, targettop: 0 };

    if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
        return result;
    }
    console.log("src w, h", srcwidth, srcheight)
    // scale to the target width
    var scaleX1 = targetwidth;
    var scaleY1 = (srcheight * targetwidth) / srcwidth;

    // scale to the target height
    var scaleX2 = (srcwidth * targetheight) / srcheight;
    var scaleY2 = targetheight;

    // now figure out which one we should use
    var fScaleOnWidth = (scaleX2 > targetwidth);
    if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
    }
    else {
       fScaleOnWidth = !fLetterBox;
    }
    console.log("fScaleOnWidth, fLetterBox", fScaleOnWidth, fLetterBox)
    if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
    }
    else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        result.fScaleToTargetWidth = false;
    }
    result.targetleft = Math.floor((targetwidth - result.width) / 2);
    result.targettop = Math.floor((targetheight - result.height) / 2);

    return result;
  }
 
  scaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {

    var result = { width: 0, height: 0, fScaleToTargetWidth: true, targetleft: 0, targettop: 0 };

    if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
        return result;
    }
    console.log("src w, h", srcwidth, srcheight)
    // scale to the target width
    var scaleX1 = targetwidth;
    var scaleY1 = (srcheight * targetwidth) / srcwidth;

    // scale to the target height
    var scaleX2 = (srcwidth * targetheight) / srcheight;
    var scaleY2 = targetheight;
    
    // fScaleOnWidth = fLetterBox

    // now figure out which one we should use
    var fScaleOnWidth = (scaleX2 > targetwidth);
    if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
    }
    else {
      fScaleOnWidth = !fLetterBox;
    }
    
    console.log("fScaleOnWidth, fLetterBox", fScaleOnWidth, fLetterBox)
    if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
    }
    else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        // result.fScaleToTargetWidth = true;
        result.fScaleToTargetWidth = false;
    }
    result.targetleft = Math.floor((targetwidth - result.width) / 2);
    result.targettop = Math.floor((targetheight - result.height) / 2);

    return result;
  }
 
 
 
 onImageLoad(evt) {
    console.log("evt", evt)

    var img = evt.currentTarget;

    // what's the size of this image and it's parent
    var w = $(img).width();
    var h = $(img).height();
    var tw = $(img).parent().width();
    var th = $(img).parent().height();

    // compute the new size and offsets
    var result = this.scaleImage(w, h, tw, th, false);

    // adjust the image coordinates and size
    img.width = result.width;
    img.height = result.height;
    console.log("img w h", img.width, img.height)
    $(img).css("left", result.targetleft);
    $(img).css("top", result.targettop);
    
    console.log("img", img)
  }
 
 
 
 
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