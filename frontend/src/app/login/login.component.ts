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
  styleUrls: ['./login.component.css']
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
  resetEmail = '';
  resetMessage = '';
  isSuccess = false;
  isSending = false;
  showResend = false;
  showSuccessModal = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.checkLockStatus();
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
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
      next: () => this.router.navigate(['/admin-dashboard']),
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showPasswordReset = !this.showPasswordReset;
    
    if (this.showPasswordReset) {
      setTimeout(() => {
        this.emailInput.nativeElement.focus();
      }, 0);
    }
    
    this.resetMessage = '';
    this.resetEmail = '';
  }

  async sendResetCode(isResend: boolean = false) {
    this.isSending = true;
    this.resetMessage = '';

    try {
      const response = await this.http.post<any>('/api/utilisateurs/reset-code', {
        email: this.resetEmail
      }).toPromise();

      this.isSuccess = true;
      this.resetMessage = response.message;
      this.showSuccessModal = true;
      this.showResend = true;

      if (!isResend) {
        setTimeout(() => {
          this.showSuccessModal = false;
          this.togglePasswordReset();
        }, 3000);
      }
    } catch (error: any) {
      this.isSuccess = false;
      this.handleResetError(error);
    } finally {
      this.isSending = false;
    }
  }

  private handleResetError(error: any) {
    const defaultMessage = 'Une erreur est survenue. Veuillez réessayer.';
    
    if (error.status === 404) {
      this.resetMessage = 'Email invalide ou inexistant.';
    } else if (error.status === 403) {
      this.resetMessage = 'Compte bloqué. Réinitialisation impossible.';
    } else {
      this.resetMessage = error.error?.message || defaultMessage;
    }
    
    this.showResend = true;
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}