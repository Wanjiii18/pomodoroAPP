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
    this.timerLabel = 'Stopped'; // Update the label when the timer is stopped
  }

  resetTimer() {
    this.stopTimer();
    this.timer = 0;
    this.isPomodoro = true;
    this.timerLabel = 'Reset'; // Update the label when the timer is reset
  }

  notify() {
    const message = this.isPomodoro
      ? 'Work session ended! Time for a break.'
      : 'Break ended! Time to work.';
    const nextSession = this.isPomodoro ? '5-minute Break' : '25-minute Work Session';

    this.isPomodoro = !this.isPomodoro; // Switch between work and break first
    if (confirm(`${message}\nYou have (${this.timer}) ${nextSession}`)) {
      this.startPomodoro(); // Automatically start the next session
    }
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
