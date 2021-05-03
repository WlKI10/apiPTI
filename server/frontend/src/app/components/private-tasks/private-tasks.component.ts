import { Component, OnInit } from '@angular/core';
import { TasksService } from 'src/app/services/tasks.service';
import { AuthService} from '../../services/auth.service';
import {HttpErrorResponse} from '@angular/common/http'
import { Router } from '@angular/router';
@Component({
  selector: 'app-private-tasks',
  templateUrl: './private-tasks.component.html',
  styleUrls: ['./private-tasks.component.css']
})
export class PrivateTasksComponent implements OnInit {
  
  constructor(private taskService:TasksService,private router:Router) { }
  privateTasks = [];
  ngOnInit() {
    this.taskService.getProfile()
      .subscribe(
        res => this.privateTasks = res,
        err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.router.navigate(['/signin']);
            }
          }
        }
      )
  }

}