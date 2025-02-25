import {
  Component, ElementRef, QueryList, ViewChildren,
  HostListener, OnDestroy, ViewChild
} from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService]
})
export class LoginComponent implements OnDestroy {
  @ViewChildren('input1, input2, input3, input4') inputs!: QueryList<ElementRef>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  // Propriétés existantes
  failedAttempts = 0;
  isLocked = false;
  lockTime = 30;
  errorMessage = '';
  countdownInterval: any;
  progress = 100;

  // Réinitialisation de mot de passe
  showPasswordReset = false;
  showResend = false;
  isResendDisabled = false;
  resendTimeout: any;
  resetEmail: string = '';
  resetMessage: string = '';
  isSending: boolean = false;
  isSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.checkLockStatus();

    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole(); // Récupère le rôle depuis le localStorage

      if (userRole === 'administrateur') {
        this.router.navigate(['/admin-dashboard']);
      } else if (userRole === 'agent de sécurité') {
        this.router.navigate(['/dashboard']);
      } else {
        console.log("Rôle inconnu, redirection par défaut vers /dashboard");
        this.router.navigate(['/dashboard']);
      }
    }
  }

  private checkLockStatus() {
    const storedExpiration = localStorage.getItem('lockExpiration');
    if (storedExpiration) {
      const now = Date.now();
      const expirationTime = parseInt(storedExpiration, 10);
      const remainingTime = expirationTime - now;

      if (remainingTime > 0) {
        this.activateLock(remainingTime);
      } else {
        localStorage.removeItem('lockExpiration');
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isLocked || this.showPasswordReset) return;

    const target = event.target as HTMLInputElement;
    const inputsArray = this.inputs.toArray().map(input => input.nativeElement);
    const currentIndex = inputsArray.indexOf(target);

    if (event.key === 'Backspace' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.resetInputs();
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (target.value !== '') {
        target.value = '';
        if (currentIndex > 0) inputsArray[currentIndex - 1].focus();
      } else if (currentIndex > 0) {
        inputsArray[currentIndex - 1].focus();
        inputsArray[currentIndex - 1].value = '';
      }
      return;
    }

    const forbiddenKeys = ['e', 'E', '+', '-', '.', ',', ' '];
    if (forbiddenKeys.includes(event.key) || isNaN(Number(event.key))) {
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      inputsArray[currentIndex - 1].focus();
    } else if (event.key === 'ArrowRight' && currentIndex < inputsArray.length - 1) {
      inputsArray[currentIndex + 1].focus();
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      target.value = event.key;
      this.goToNext(target, currentIndex + 1);
    }
  }

  goToNext(currentInput: HTMLInputElement, nextIndex: number) {
    currentInput.value = currentInput.value.replace(/[^0-9]/g, '');

    const inputsArray = this.inputs.toArray().map(input => input.nativeElement);

    currentInput.type = 'text';
    setTimeout(() => {
      currentInput.type = 'password';
      if (nextIndex < inputsArray.length) {
        inputsArray[nextIndex].focus();
      } else {
        this.validateCode();
      }
    }, 100);
  }

  validateCode() {
    const enteredCode = this.inputs.toArray().map(input => input.nativeElement.value).join('');

    if (enteredCode.length !== 4) {
      this.errorMessage = 'Veuillez saisir un code complet';
      this.resetInputs();
      return;
    }

    this.authService.authenticate(enteredCode).subscribe({
      next: (user) => {
        // Vérification du rôle avant redirection
        if (user.role === 'administrateur') {
          this.router.navigate(['/admin-dashboard']);
        } else if (user.role === 'agent de sécurité') {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Rôle non reconnu';
        }
      },
      error: (err) => this.handleLoginError(err)
    });
  }

  private handleLoginError(error: any) {
    this.failedAttempts++;
    this.errorMessage = error.message || 'Code secret incorrect';

    if (this.failedAttempts >= 3) {
      this.lockInputs();
    } else {
      this.errorMessage += ` (Tentatives restantes: ${3 - this.failedAttempts})`;
    }

    this.resetInputs();
  }

  private lockInputs() {
    const expirationTime = Date.now() + 30 * 1000;
    localStorage.setItem('lockExpiration', expirationTime.toString());
    this.activateLock(30 * 1000);
  }

  private activateLock(duration: number) {
    this.isLocked = true;
    const startTime = Date.now();

    this.countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = duration - elapsed;

      if (remaining <= 0) {
        this.unlock();
      } else {
        this.progress = (remaining / duration) * 100;
        this.lockTime = Math.ceil(remaining / 1000);
      }
    }, 50);
  }

  private unlock() {
    clearInterval(this.countdownInterval);
    this.isLocked = false;
    this.lockTime = 30;
    this.failedAttempts = 0;
    localStorage.removeItem('lockExpiration');
    this.progress = 100;
  }

  private resetInputs() {
    this.inputs.forEach(input => {
      input.nativeElement.value = '';
      input.nativeElement.type = 'password';
    });
    this.inputs.first.nativeElement.focus();
  }

  // Gestion réinitialisation
  togglePasswordReset(event?: Event) {
    if (event) event.preventDefault();
    this.showPasswordReset = !this.showPasswordReset;
    this.resetMessage = '';
  }

  sendResetCode() {
    if (!this.resetEmail) return;

    this.isSending = true;
    this.authService.resetCodeSecret(this.resetEmail).subscribe({
      next: (response) => {
        this.resetMessage = response.message;
        this.isSuccess = true;
        this.isSending = false;
        this.showResend = true;
        this.isResendDisabled = true;

        // Désactiver le bouton "Renvoyer" pendant 30 secondes
        this.resendTimeout = setTimeout(() => {
          this.isResendDisabled = false;
        }, 30000);
      },
      error: (error) => {
        this.resetMessage = error.message;
        this.isSuccess = false;
        this.isSending = false;
      }
    });
  }

  resendCode() {
    if (this.isResendDisabled) {
      this.resetMessage = 'Veuillez attendre 30 secondes avant de renvoyer le code.';
      return;
    }

    this.sendResetCode();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.resendTimeout) {
      clearTimeout(this.resendTimeout);
    }
  }
}
