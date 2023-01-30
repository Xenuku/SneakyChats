import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './routes/account/account.component';
import { ChatComponent } from './routes/chat/chat.component';
import { LoginComponent } from './routes/login/login.component';
import { ManageComponent } from './routes/manage/manage.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'chat', component: ChatComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
