import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../shared/notification.service'

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  type: string = null;
  load: string = null
  message: string = null;
  image = "assets/images/Gray_circles_rotate.gif"
  loading = false;
  
  constructor(notificationService: NotificationService) {
    
    notificationService.emitter.subscribe(
      data=>{
        this.type = data.type,
        this.message = data.message
        console.log("notsvc")
        this.reset()
      })
      
    notificationService.loader.subscribe(
      data=>{
        this.load = data.load,
        this.message = data.message;
        console.log("loader")
      })
    
    
  }

  ngOnInit() {
  }

  reset() {
    setTimeout(()=>{
      this.type=null,
      this.message=null
    }, 3000)
  }

}
