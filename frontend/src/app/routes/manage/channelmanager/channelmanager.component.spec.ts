import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelmanagerComponent } from './channelmanager.component';

describe('ChannelmanagerComponent', () => {
  let component: ChannelmanagerComponent;
  let fixture: ComponentFixture<ChannelmanagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChannelmanagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelmanagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
