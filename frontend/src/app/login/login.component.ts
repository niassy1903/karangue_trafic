import { Component, ElementRef, QueryList, ViewChildren, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers : [AuthService]
})
export class LoginComponent implements OnDestroy {
  @ViewChildren('input1, input2, input3, input4') inputs!: QueryList<ElementRef>;
  failedAttempts = 0;
  isLocked = false;
  lockTime = 30;
  errorMessage = '';
  countdownInterval: any;
  showForgotPassword = false;
  email = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

 
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isLocked) return;

    const target = event.target as HTMLInputElement;
    const inputsArray = this.inputs.toArray().map(input => input.nativeElement);
    const currentIndex = inputsArray.indexOf(target);

    // Suppression globale avec Ctrl+Backspace
    if (event.key === 'Backspace' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.resetInputs();
      return;
    }

    // Gestion normale de la suppression
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

    // Bloque les caractères non numériques
    const forbiddenKeys = ['e', 'E', '+', '-', '.', ',', ' '];
    if (forbiddenKeys.includes(event.key) || isNaN(Number(event.key))) {
      event.preventDefault();
      return;
    }

    // Navigation avec les flèches
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      inputsArray[currentIndex - 1].focus();
    } else if (event.key === 'ArrowRight' && currentIndex < inputsArray.length - 1) {
      inputsArray[currentIndex + 1].focus();
    }

    // Saisie des chiffres
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      target.value = event.key;
      this.goToNext(target, currentIndex + 1);
    }
  }
  

  goToNext(currentInput: HTMLInputElement, nextIndex: number) {
    // Nettoyage des valeurs non numériques
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
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.handleLoginError(err)
    });
  }

  private handleLoginError(error: any) {
    this.failedAttempts++;
    this.errorMessage = error.message || 'Code secret incorrect';

    if (this.failedAttempts >= 3) {
      this.lockInputs();
    }

    this.resetInputs();
  }

  private lockInputs() {
    this.isLocked = true;
    this.countdownInterval = setInterval(() => {
      this.lockTime--;
      if (this.lockTime <= 0) {
        clearInterval(this.countdownInterval);
        this.isLocked = false;
        this.lockTime = 30;
        this.failedAttempts = 0;
      }
    }, 1000);
  }

  private resetInputs() {
    this.inputs.forEach(input => {
      input.nativeElement.value = '';
      input.nativeElement.type = 'password';
    });
    this.inputs.first.nativeElement.focus();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  
}