import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksComponent } from './components/tasks/tasks.component'
import { PrivateTasksComponent} from './components/private-tasks/private-tasks.component'
import { SigninComponent } from './components/signin/signin.component'
import { SignupComponent } from './components/signup/signup.component'
import { MainComponent } from './components/main/main.component'
import {AuthGuard} from './auth.guard'
const routes: Routes = [
  {
    path : '',
    redirectTo:'/main',
    pathMatch: 'full'
},
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'private',
    component: PrivateTasksComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
