import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from '@ionic/angular';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let platformSpy: jasmine.SpyObj<Platform>;

  beforeEach(async () => {
    platformSpy = jasmine.createSpyObj('Platform', ['backButton']);
    platformSpy.backButton = {
      subscribeWithPriority: jasmine.createSpy('subscribeWithPriority'),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: Platform, useValue: platformSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should subscribe to back button and exit app', () => {
    expect(platformSpy.backButton.subscribeWithPriority).toHaveBeenCalled();
  });
});
