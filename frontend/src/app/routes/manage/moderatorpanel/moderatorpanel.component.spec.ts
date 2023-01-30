import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorpanelComponent } from './moderatorpanel.component';

describe('ModeratorpanelComponent', () => {
  let component: ModeratorpanelComponent;
  let fixture: ComponentFixture<ModeratorpanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeratorpanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeratorpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
