import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appInputMask]',
    standalone: true
})
export class InputMaskDirective {
    @Input() appInputMask: 'numeric' | 'alphanumeric' | 'alpha' | 'decimal' = 'numeric';
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
            case 'decimal':
                value = value.replace(/[^0-9.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }

                if (parts.length === 2 && parts[1].length > 2) {
                    value = parts[0] + '.' + parts[1].substring(0, 2);
                }
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

    @HostListener('blur', ['$event'])
    onBlur(event: Event): void {
        const input = this.el.nativeElement;
        let value = input.value;

        if (this.appInputMask === 'decimal') {
            const num = parseFloat(value);
            const formatted = !isNaN(num) ? num.toFixed(2) : '0.00';

            if (input.value !== formatted) {
                input.value = formatted;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        } else if (this.appInputMask === 'numeric') {
            const num = parseInt(value, 10);
            const formatted = !isNaN(num) ? num.toString() : '0';

            if (input.value !== formatted) {
                input.value = formatted;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    @HostListener('keypress', ['$event'])
    onKeyPress(event: KeyboardEvent): boolean {
        const char = event.key;
        const input = this.el.nativeElement;
        const currentVal = input.value;

        if (event.ctrlKey || event.metaKey || char.length > 1) {
            return true;
        }

        if (this.maxLength > 0 && currentVal.length >= this.maxLength) {
            const selectionStart = input.selectionStart || 0;
            const selectionEnd = input.selectionEnd || 0;
            if (selectionStart === selectionEnd) {
                return false;
            }
        }

        switch (this.appInputMask) {
            case 'numeric':
                return /[0-9]/.test(char);
            case 'decimal':
                if (char === '.') {
                    return !currentVal.includes('.');
                }
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
            case 'decimal':
                cleanText = pastedText.replace(/[^0-9.]/g, '');
                const parts = cleanText.split('.');
                if (parts.length > 2) {
                    cleanText = parts[0] + '.' + parts.slice(1).join('');
                }
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

        const input = this.el.nativeElement;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const currentVal = input.value;
        const newVal = currentVal.substring(0, start) + cleanText + currentVal.substring(end);

        input.value = newVal;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
