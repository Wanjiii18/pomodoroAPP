import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

declare global {
  interface Navigator {
    app?: {
      exitApp: () => void;
    };
    device?: {
      exitApp: () => void;
    };
  }
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  timer: number = 0;
  interval: any;
  isPomodoro: boolean = true; // true for work session, false for break
  isRunning: boolean = false;
  currentTime: string = ''; // Holds the current time
  timerLabel: string = 'Stopped'; // Add a label to indicate the timer's state

  constructor(private platform: Platform) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      navigator.app?.exitApp(); // Use optional chaining to safely call exitApp
    });

    this.updateCurrentTime(); // Start updating the current time
  }

  updateCurrentTime() {
    setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString(); // Format the current time
    }, 1000);
  }

  startPomodoro() {
    this.isRunning = true;
    this.timerLabel = this.isPomodoro ? 'Work Session Starting' : 'Break Session Running'; // Update label
    this.timer = this.isPomodoro ? 25 * 60 : 5 * 60; // 25 minutes for work, 5 minutes for break
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.interval); // Ensure the interval is cleared
        this.notify(); // Notify the user
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
    this.isRunning = false;
    this.timerLabel = 'Stopped'; // Update label when the timer is stopped
  }

  resetTimer() {
    this.stopTimer();
    this.timer = 0;
    this.isPomodoro = true;
    this.timerLabel = 'Reset'; // Update label when the timer is reset
  }

  continueTimer() {
    if (!this.isRunning && this.timer > 0) {
      this.isRunning = true;
      this.timerLabel = this.isPomodoro ? 'Work Session Resumed' : 'Break Session Resumed'; // Update label
      this.interval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.interval); // Ensure the interval is cleared
          this.notify(); // Notify the user
        }
      }, 1000);
    }
  }

  notify() {
    console.log('Notification triggered'); // Debugging log
    const message = this.isPomodoro
      ? 'Work session ended! Time for a break.'
      : 'Break ended! Time to work.';
    const nextSession = this.isPomodoro ? '5-minute Break' : '25-minute Work Session';

    // Trigger vibration for 500ms
    if (navigator.vibrate) {
      console.log('Vibration triggered'); // Debugging log
      navigator.vibrate(500);
    } else {
      console.log('Vibration not supported'); // Fallback log
    }

    this.isPomodoro = !this.isPomodoro; // Switch between work and break first
    alert(`${message}\nNext: ${nextSession}`); // Use alert for simpler notification

    // Start the next session immediately
    this.startPomodoro();
  }

  formatTime() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  exitApp() {
    if (navigator.app) {
      navigator.app.exitApp(); // Exit the app on Android devices
    } else if (navigator.device) {
      navigator.device.exitApp(); // Exit the app on other platforms
    } else {
      console.log('Exit app is not supported in this environment.');
    }
  }
}