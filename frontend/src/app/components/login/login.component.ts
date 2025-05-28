import {
  Component, ElementRef, QueryList, ViewChildren,
  HostListener, OnDestroy, ViewChild, AfterViewInit
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/websocket.service'; // Importe le service WebSocket

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService, HttpClientModule,HttpClient]
})
export class LoginComponent implements OnDestroy, AfterViewInit {
  @ViewChildren('input1, input2, input3, input4') inputs!: QueryList<ElementRef>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  // Propriétés existantes
  failedAttempts = 0;
  isLocked = false;
  lockTime = 10;
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
    private http: HttpClient,
    private webSocketService: WebSocketService // Injecte le service WebSocket
    


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
  ngOnInit(): void {
    // Écouter les messages du serveur WebSocket
    this.webSocketService.onMessage().subscribe((message) => {
      const data = JSON.parse(message);

      if (data.uid) {
        this.handleRFIDLogin(data.uid); // Gérer la connexion via RFID
      }
    });
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

  // Gérer la connexion via RFID
  private handleRFIDLogin(uid: string) {
    this.authService.authenticateByRFID(uid).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate([response.user.role === 'administrateur' ? '/admin-dashboard' : '/dashboard']);
        } else {
          this.handleLoginError(response);
        }
      },
      error: (error) => this.handleLoginError(error),
    });
  }

  ngAfterViewInit() {
    // Focus initial sur le premier input
    setTimeout(() => {
      this.focusFirstInput();
    });
    
    // Ajout d'un écouteur d'événement global pour la perte de focus
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }
  
  focusFirstInput() {
    // Ne focus que si nous sommes sur la page de login (pas de reset) et que l'input n'est pas verrouillé
    if (!this.isLocked && !this.showPasswordReset && this.inputs?.first) {
      this.inputs.first.nativeElement.focus();
    }
  }

  handleFocusOut(event: FocusEvent) {
    // Vérifie si l'élément qui vient de perdre le focus est dans notre composant
    const relatedTarget = event.relatedTarget as HTMLElement;
    const target = event.target as HTMLElement;
    
    // Si on est sur la page de login (pas de reset) et que l'élément cible n'est pas un autre input de code
    if (!this.showPasswordReset && !this.isLocked) {
      const inputsArray = this.inputs?.toArray().map(input => input.nativeElement);
      
      // Si on clique ailleurs que sur un input de notre code
      if (inputsArray && !inputsArray.includes(relatedTarget) && inputsArray.includes(target)) {
        // Petite temporisation pour permettre à d'autres événements de se terminer
        setTimeout(() => {
          // Trouve le premier input vide ou revient au premier si tous sont remplis
          const emptyInput = inputsArray.find(input => !input.value) || inputsArray[0];
          emptyInput.focus();
        }, 10);
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
    const expirationTime = Date.now() + 10 * 1000;
    localStorage.setItem('lockExpiration', expirationTime.toString());
    this.activateLock(10 * 1000);
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
    setTimeout(() => this.inputs.first.nativeElement.focus(), 0);
  }

  // Gestion réinitialisation
  togglePasswordReset(event?: Event) {
    if (event) event.preventDefault();
    this.showPasswordReset = !this.showPasswordReset;
    this.resetMessage = '';
    
    // Si on retourne à la page de login, on met le focus sur le premier input
    setTimeout(() => {
      if (!this.showPasswordReset) {
        this.focusFirstInput();
      } else if (this.emailInput) {
        // Si on est sur la page de reset, on met le focus sur l'input email
        this.emailInput.nativeElement.focus();
      }
    });
  }

  validateEmail() {
    if (!this.resetEmail) {
      this.resetMessage = "L'email est obligatoire.";
      this.isSuccess = false;
      return false;
    }
  
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.resetEmail)) {
      this.resetMessage = "L'email doit être valide.";
      this.isSuccess = false;
      return false;
    }
  
    this.resetMessage = ""; // Efface le message si tout est correct
    return true;
  }
  
  sendResetCode() {
    if (!this.validateEmail()) return;

    this.isSending = true;
    this.authService.resetCodeSecret(this.resetEmail).subscribe({
      next: (response: any) => {
        this.resetMessage = response.message;
        this.isSuccess = true;
        this.isSending = false;

        // Activer le bouton "Renvoyer le Code" après un envoi réussi
        this.showResend = true;
        this.isResendDisabled = true; // Désactiver le bouton pendant 30 secondes

        // Démarrer un délai de 30 secondes avant de permettre un nouvel envoi
        setTimeout(() => {
          this.isResendDisabled = false;
          this.resetMessage = 'Vous pouvez renvoyer le code maintenant.';
        }, 30000); // 30 secondes
      },
      error: (error) => {
        if (error.status === 404) {
          this.resetMessage = "Email invalide ou inexistant.";
        } else if (error.status === 403) {
          this.resetMessage = "Votre compte est bloqué. Vous ne pouvez pas réinitialiser votre code secret.";
        } else {
          this.resetMessage = "Une erreur est survenue. Veuillez réessayer.";
        }
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
    // Nettoyage des écouteurs d'événement
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.resendTimeout) {
      clearTimeout(this.resendTimeout);
    }
    
    // Suppression de l'écouteur de perte de focus
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));
  }
}

