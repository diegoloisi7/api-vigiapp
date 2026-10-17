import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class IdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!/^[1-9]\d*$/.test(value)) {
      throw new BadRequestException('El ID debe ser un entero positivo');
    }
    return value;
  }
}
