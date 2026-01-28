import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appInputMask]',
    standalone: true
})
export class InputMaskDirective {
    @Input() appInputMask: 'numeric' | 'alphanumeric' | 'alpha' = 'numeric';
    @Input() maxLength: number = 0;

    constructor(private el: ElementRef<HTMLInputElement>) { }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = this.el.nativeElement;
        let value = input.value;

        switch (this.appInputMask) {
            case 'numeric':
                value = value.replace(/[^0-9]/g, '');
                break;
            case 'alphanumeric':
                value = value.replace(/[^A-Za-z0-9]/g, '');
                break;
            case 'alpha':
                value = value.replace(/[^A-Za-z\s]/g, '');
                break;
        }

        if (this.maxLength > 0 && value.length > this.maxLength) {
            value = value.substring(0, this.maxLength);
        }

        if (input.value !== value) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    @HostListener('keypress', ['$event'])
    onKeyPress(event: KeyboardEvent): boolean {
        const char = event.key;

        // Allow control keys
        if (event.ctrlKey || event.metaKey || char.length > 1) {
            return true;
        }

        switch (this.appInputMask) {
            case 'numeric':
                return /[0-9]/.test(char);
            case 'alphanumeric':
                return /[A-Za-z0-9]/.test(char);
            case 'alpha':
                return /[A-Za-z\s]/.test(char);
            default:
                return true;
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pastedText = event.clipboardData?.getData('text') || '';
        let cleanText = '';

        switch (this.appInputMask) {
            case 'numeric':
                cleanText = pastedText.replace(/[^0-9]/g, '');
                break;
            case 'alphanumeric':
                cleanText = pastedText.replace(/[^A-Za-z0-9]/g, '');
                break;
            case 'alpha':
                cleanText = pastedText.replace(/[^A-Za-z\s]/g, '');
                break;
        }

        if (this.maxLength > 0) {
            cleanText = cleanText.substring(0, this.maxLength);
        }

        document.execCommand('insertText', false, cleanText);
    }
}
