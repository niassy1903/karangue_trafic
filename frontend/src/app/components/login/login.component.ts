import { Component, ElementRef, QueryList, ViewChildren, HostListener } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @ViewChildren('input1, input2, input3, input4') inputs!: QueryList<ElementRef>;

  goToNext(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const inputsArray = this.inputs.toArray().map(input => input.nativeElement);

    if (/^[0-9]$/.test(input.value) && index < 4) {
      input.type = 'text'; // Montre temporairement le chiffre
      setTimeout(() => { input.type = 'password'; }, 500); // Cache après 0.5 sec
      if (index < inputsArray.length - 1) {
        inputsArray[index].focus(); // Passe au suivant
      }
    } else {
      input.value = ''; // Efface si ce n’est pas un chiffre
    }
}


  hideInputAfterDelay(input: HTMLInputElement) {
    setTimeout(() => {
      input.type = 'password'; // Hide the input after 2 seconds
    }, 500);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && target.tagName === 'INPUT' && target.value === '') {
      const previousInput = this.getPreviousInput(target);
      if (previousInput) {
        previousInput.focus();
      }
    }
  }

  getPreviousInput(currentInput: HTMLInputElement): HTMLInputElement | null {
    const inputsArray = this.inputs.toArray().map(input => input.nativeElement);
    const currentIndex = inputsArray.indexOf(currentInput);
    if (currentIndex > 0) {
      return inputsArray[currentIndex - 1];
    }
    return null;
  }

  validateCode() {
    const enteredCode = this.inputs.toArray().map(input => input.nativeElement.value).join('');
    if (enteredCode === '1234') {  // Remplacez avec un appel à votre backend
      alert('Connexion réussie !');
    } else {
      alert('Code incorrect !');
    }
  }
}
