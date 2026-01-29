import { TestBed } from '@angular/core/testing';

import { TaskServer } from './task-service';

describe('TaskServer', () => {
  let service: TaskServer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskServer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
