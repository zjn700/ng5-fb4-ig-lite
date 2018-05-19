import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from "firebase";
import * as _ from "lodash";
import { MyFireService } from "../shared/my-fire.service";
import { NotificationService } from "../shared/notification.service"
import { Observable } from 'rxjs';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.css']
})
export class AllPostsComponent implements OnInit, OnDestroy {
  allRef: any;
  all: any = [];
  loadMoreRef: any;
  
  // @Output() favoriteCountChanged = new EventEmitter<any>();
  
  displayPostedBy: boolean = true;
  displayFavoritesButton: boolean = true;
  displayFollowButton: boolean = true;  
  
  constructor(private myFireService: MyFireService, private notificationService: NotificationService) { }
  
  ngOnDestroy(){
    this.allRef.off();
    if (this.loadMoreRef) {
      this.loadMoreRef.off();
    }
  }

  ngOnInit() {
    
    this.allRef = firebase.database().ref('allposts').limitToFirst(9);
    this.allRef.on('child_added', data => {
      this.all.push({
        key: data.val().imageKey,
        data: data.val()
      });
    });

    // var query = firebase.database().ref("images");
    // query.on("child_changed", function(snapshot) {
    //   console.log("snapshot.val() ngonit", snapshot.val())
    //   // TODO: update the element with id=key in the update to match snapshot.val();
    // })

  }
  
  onLoadMore() {
    
    if (this.all.length > 0) {

      const lastLoadedPost = _.last(this.all);
      const lastLoadedPostKey = lastLoadedPost.key;
      
      this.loadMoreRef = firebase.database().ref('allposts').startAt(null, lastLoadedPostKey).limitToFirst(9+1)
 
      this.loadMoreRef.on('child_added', data => {
        if (data.key === lastLoadedPostKey) {
          return;
        } else {
          this.all.push({
            key: data.val().imageKey,
            data: data.val()
          });
        }
        
      })
 
    }
    
  }
  
  onRemoveFavoritesClicked(imageData){
    this.myFireService.handleRemoveFavoriteClicked(imageData)
      .then(data => {
        this.notificationService.display("info", "Image removed from favorites")
        this.myFireService.setFavoriteUpdate(imageData.imageKey);
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
    
  }
  
  onFavoritesClicked(imageData){
    this.myFireService.handleFavoriteClicked(imageData)
      .then(data => {
        this.notificationService.display("info", "Image added to favorites")
        this.myFireService.setFavoriteUpdate(imageData.imageKey)
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
  }

}
