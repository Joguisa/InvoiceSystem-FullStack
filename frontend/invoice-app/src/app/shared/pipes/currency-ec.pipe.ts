import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyEc',
  standalone: true
})
export class CurrencyEcPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
