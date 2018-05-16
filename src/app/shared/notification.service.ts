import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject'

@Injectable()
export class NotificationService {
    
  private sub = new Subject<any>();
  public emitter = this.sub.asObservable();
  private subj = new Subject<any>();
  public loader = this.subj.asObservable();
    

  constructor() { }
  
  display(type, message){
      this.sub.next({type, message})
  }
  
  displayLoading(load, message) {
      this.subj.next({load, message})
  }


}
