import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Haptics } from '@capacitor/haptics';

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
  timer: number = 0; // Timer in seconds
  interval: any; // Holds the interval reference
  isPomodoro: boolean = true; // true for work session, false for break
  isRunning: boolean = false; // Indicates if the timer is running
  currentTime: string = ''; // Holds the current time
  timerLabel: string = 'Stopped'; // Label to indicate the timer's state

  constructor(private platform: Platform) {
    // Handle back button press to exit the app
    this.platform.backButton.subscribeWithPriority(10, () => {
      navigator.app?.exitApp(); // Use optional chaining to safely call exitApp
    });

    // Start updating the current time
    this.updateCurrentTime();
  }

  // Updates the current time every second
  updateCurrentTime() {
    setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString(); // Format the current time
    }, 1000);
  }

  // Starts the Pomodoro timer
  startPomodoro() {
    this.isRunning = true;
    this.timerLabel = this.isPomodoro ? 'Work Session Running' : 'Break Session Running';
    this.timer = this.isPomodoro ? 25 * 60 : 5 * 60; // 25 minutes for work, 5 minutes for break
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.notify(); // Notify the user
      }
    }, 1000);
  }



  // Resets the timer
  resetTimer() {
    this.timer = 0;
    this.isPomodoro = true; // Reset to work session
    this.timerLabel = 'Reset';
  }

  // Continues the timer if paused
 

  // Notifies the user when the timer ends
  notify() {
    console.log('Notification triggered');
    const message = this.isPomodoro
      ? 'Work session ended! Time for a break.'
      : 'Break ended! Time to work.';
    const nextSession = this.isPomodoro ? 'Break Session Running' : 'Work Session Running';

    // Trigger haptic feedback
    Haptics.vibrate().catch((err) => console.log('Haptics not supported:', err));

    // Trigger vibration as a fallback
    if (navigator.vibrate) {
      navigator.vibrate([1000, 500, 1000]); // Vibrate pattern: 1s, pause 0.5s, vibrate 1s
    } else {
      console.log('Vibration not supported');
    }

    // Toggle the session type
    this.isPomodoro = !this.isPomodoro; // Switch between work and break

    // Update the timer label
    this.timerLabel = nextSession;

    // Notify the user with an alert
    alert(`${message}\nNext: ${nextSession}`);

    // Start the next session immediately
    this.startPomodoro();
  }

  // Formats the timer into MM:SS format
  formatTime() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Exits the app
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