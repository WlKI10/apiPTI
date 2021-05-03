import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
  
})
export class TasksService {
  private URL = 'http://localhost:3000'
  
  constructor(
    private http: HttpClient

  ) { }
  getProfile(){
    return this.http.get<any>(this.URL+'/profile');
  }
  getTasks(){
    return this.http.get<any>(this.URL+'/tasks');
  }
  getPrivateTasks(){
    return this.http.get<any>(this.URL+'/private-tasks');
  }

}
