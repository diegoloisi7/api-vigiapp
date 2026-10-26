import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ContactSubmission } from './contact-submission.entity';

interface ContactInput { nombre?: string; email?: string; asunto?: string; mensaje?: string }

@Injectable()
export class ContactService {
  constructor(@InjectRepository(ContactSubmission) private readonly contacts: Repository<ContactSubmission>) {}

  private view(contact: ContactSubmission) {
    return { id: Number(contact.id), nombre: contact.name, email: contact.email,
      asunto: contact.subject ?? '', mensaje: contact.message,
      fecha: contact.createdAt.toISOString(), leido: Boolean(contact.readAt) };
  }

  async create(input: ContactInput) {
    const name = input.nombre?.trim();
    const email = input.email?.trim().toLowerCase();
    const message = input.mensaje?.trim();
    if (!name || name.length > 150 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 191 ||
      !message || message.length > 5000 || (input.asunto?.length ?? 0) > 150) {
      throw new BadRequestException('Datos de contacto inválidos');
    }
    const recent = await this.contacts.countBy({ email, createdAt: MoreThan(new Date(Date.now() - 60_000)) });
    if (recent >= 2) throw new HttpException('Esperá antes de enviar otro mensaje', HttpStatus.TOO_MANY_REQUESTS);
    const contact = await this.contacts.save(this.contacts.create({
      name, email, subject: input.asunto?.trim() || null, message, readAt: null, createdAt: new Date(),
    }));
    return this.view(contact);
  }

  async list() {
    return (await this.contacts.find({ order: { createdAt: 'DESC' } })).map((item) => this.view(item));
  }

  async read(id: string) {
    const contact = await this.contacts.findOneBy({ id });
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    contact.readAt ??= new Date();
    return this.view(await this.contacts.save(contact));
  }
}
