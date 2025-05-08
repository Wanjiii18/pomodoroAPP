import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics } from '@capacitor/haptics';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage {
  currentTime: string = '';
  timerDisplay: string = '00:00';
  currentState: string = 'Working'; // Add property to track the current state
  private timer: any;
  private isPomodoro: boolean = true;
  private pomodoroDuration: number = 25 * 60; 
  private breakDuration: number = 5 * 60; 
  private hapticInterval: any; // Reference to the haptic vibration interval

  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {
    this.initializeClock();
    this.handleBackButton();
  }

  private initializeClock(): void {
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);
  }

  private updateCurrentTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  async startPomodoro(): Promise<void> {
    this.currentState = this.isPomodoro ? 'Working' : 'Break'; // Update state
    const duration = this.isPomodoro ? this.pomodoroDuration : this.breakDuration;
    this.startCountdown(duration);
  }

  resetPomodoro(): void {
    clearInterval(this.timer); 
    this.timerDisplay = '00:00'; 
    console.log('Pomodoro cycle reset.');
  }

  private startCountdown(duration: number): void {
    clearInterval(this.timer);
    let timeLeft = duration;

    this.timer = setInterval(() => {
      this.updateTimerDisplay(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(this.timer);
        this.handleTimerEnd();
      }

      timeLeft--;
    }, 1000);
  }

  private updateTimerDisplay(timeLeft: number): void {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    this.timerDisplay = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private async handleTimerEnd(): Promise<void> {
    await this.notifyEnd();
    this.isPomodoro = !this.isPomodoro;
    this.currentState = this.isPomodoro ? 'Working' : 'Break'; // Update state

    // Add a 3-second allowance before starting the next cycle
    setTimeout(() => {
      this.stopHaptic(); // Stop haptic vibration when the next cycle starts
      this.startPomodoro();
    }, 3000);
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  async notifyEnd(): Promise<void> {
    try {
      const message = this.isPomodoro
        ? 'Working hour done! Time for a break.'
        : 'Break time done! Time to work.';

      // Start continuous haptic vibration
      this.hapticInterval = setInterval(() => {
        Haptics.vibrate({ duration: 500 });
      }, 500);

      // Show an alert with the message
      const alert = await this.alertController.create({
        header: 'Timer Ended',
        message: message,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.stopHaptic(); // Stop haptic vibration when "OK" is clicked
            },
          },
        ],
      });
      await alert.present();

      // Schedule a notification with an alarm sound
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Pomodoro Timer',
            body: message,
            id: new Date().getTime(),
            schedule: { at: new Date(new Date().getTime() + 1000) },
            sound: 'alarm.mp3', // Use an alarm sound
          },
        ],
      });

      console.log('End notification scheduled:', message);
    } catch (error) {
      console.error('Error scheduling end notification:', error);
    }
  }

  private stopHaptic(): void {
    if (this.hapticInterval) {
      clearInterval(this.hapticInterval); // Clear the haptic vibration interval
      this.hapticInterval = null;
    }
  }

  async setPreferences(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Set Timer Preferences',
      message: `Set your preferred durations for Work and Break (MM:SS):`,
      inputs: [
        {
          name: 'workMinutes',
          type: 'number',
          placeholder: 'Work Minutes',
          value: Math.floor(this.pomodoroDuration / 60),
          label: 'Work (Minutes)',
        },
        {
          name: 'workSeconds',
          type: 'number',
          placeholder: 'Work Seconds',
          value: this.pomodoroDuration % 60,
          label: 'Work (Seconds)',
        },
        {
          name: 'breakMinutes',
          type: 'number',
          placeholder: 'Break Minutes',
          value: Math.floor(this.breakDuration / 60),
          label: 'Break (Minutes)',
        },
        {
          name: 'breakSeconds',
          type: 'number',
          placeholder: 'Break Seconds',
          value: this.breakDuration % 60,
          label: 'Break (Seconds)',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: (data) => {
            const workMinutes = parseInt(data.workMinutes, 10) || 0;
            const workSeconds = parseInt(data.workSeconds, 10) || 0;
            const breakMinutes = parseInt(data.breakMinutes, 10) || 0;
            const breakSeconds = parseInt(data.breakSeconds, 10) || 0;

            const workTotal = workMinutes * 60 + workSeconds;
            const breakTotal = breakMinutes * 60 + breakSeconds;

            if (workTotal > 0) {
              this.pomodoroDuration = workTotal;
            } else {
              console.error('Invalid Work duration entered.');
              return false; // Prevent closing the alert
            }

            if (breakTotal > 0) {
              this.breakDuration = breakTotal;
            } else {
              console.error('Invalid Break duration entered.');
              return false; // Prevent closing the alert
            }

            console.log('Preferences updated:', this.pomodoroDuration, this.breakDuration);
            return true; // Close the alert
          },
        },
      ],
    });
    await alert.present();
  }

  private handleBackButton(): void {
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Back button pressed. Exiting app...');
      App.exitApp();
    });
  }
}