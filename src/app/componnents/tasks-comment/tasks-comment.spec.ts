import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksComment } from './tasks-comment';

describe('TasksComment', () => {
  let component: TasksComment;
  let fixture: ComponentFixture<TasksComment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksComment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasksComment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
