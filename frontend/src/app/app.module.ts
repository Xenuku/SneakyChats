import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './routes/chat/chat.component';
import { LoginComponent } from './routes/login/login.component';
import { AccountComponent } from './routes/account/account.component';
import { ManageComponent } from './routes/manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UsermanagerComponent } from './routes/manage/usermanager/usermanager.component';
import { GroupmanagerComponent } from './routes/manage/groupmanager/groupmanager.component';
import { ChannelmanagerComponent } from './routes/manage/channelmanager/channelmanager.component';
import { ModeratorpanelComponent } from './routes/manage/moderatorpanel/moderatorpanel.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    LoginComponent,
    AccountComponent,
    ManageComponent,
    UsermanagerComponent,
    GroupmanagerComponent,
    ChannelmanagerComponent,
    ModeratorpanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
