import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConditionMonitorComponent } from './condition-monitor.component';
import { appConfig } from 'app/app.config';

describe('ConditionMonitorComponent', () => {
  let component: ConditionMonitorComponent;
  let fixture: ComponentFixture<ConditionMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionMonitorComponent],
      providers: appConfig.providers
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
