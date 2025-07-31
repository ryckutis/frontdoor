import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonLoader } from './skeleton-loader';

describe('SkeletonLoader', () => {
  let component: SkeletonLoader;
  let fixture: ComponentFixture<SkeletonLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkeletonLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
