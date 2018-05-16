import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from "firebase";
import * as _ from "lodash";

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.css']
})
export class AllPostsComponent implements OnInit, OnDestroy {
  allRef: any;
  all: any = [];
  loadMoreRef: any;
  
  displayPostedBy: boolean = true;
  displayFavoritesButton: boolean = true;
  displayFollowButton: boolean = true;  
  
  constructor() { }
  
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
        key: data.key,
        data: data.val()
      });
    });
    
  }
  
  onLoadMore() {
    
    if (this.all.length > 0) {
      console.log("this.all", (this.all))
      console.log("this.all", _.last(this.all))
      const lastLoadedPost = _.last(this.all);
      const lastLoadedPostKey = lastLoadedPost.key;
      
      this.loadMoreRef = firebase.database().ref('allposts').startAt(null, lastLoadedPostKey).limitToFirst(9+1)
 
      this.loadMoreRef.on('child_added', data => {
        
        if (data.key === lastLoadedPostKey) {
          return;
        } else {
          this.all.push({
            key: data.key,
            data: data.val()
          });
        }
        
      })
 
    }
    
  }

}
