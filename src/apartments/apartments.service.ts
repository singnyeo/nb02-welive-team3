import z from 'zod';
import { ApartmentsRequestParamsSchema, GetApartmentsRequestQuerySchema } from './apartments.dto';
import { AppDataSource } from '../config/data-source';
import { Apartment } from '../entities/apartment.entity';
import { ILike } from 'typeorm';

const apartmentRepository = AppDataSource.getRepository(Apartment);

export const getApartments = async (query?: z.infer<typeof GetApartmentsRequestQuerySchema>) => {
  const { name, address } = query || {};

  const apartments = await apartmentRepository.find({
    where: [name ? { name: ILike(`%${name}%`) } : {}, address ? { address: ILike(`%${address}%`) } : {}],
    relations: ['users'],
  });

  const formattedApartments = apartments.map((apartment) => {
    const admin = apartment.users.find((u) => u.id === apartment.adminId);

    return {
      id: apartment.id,
      name: apartment.name,
      address: apartment.address,
      officeNumber: apartment.officeNumber,
      description: apartment.description,
      startComplexNumber: apartment.startComplexNumber,
      endComplexNumber: apartment.endComplexNumber,
      startDongNumber: apartment.startDongNumber,
      endDongNumber: apartment.endDongNumber,
      startFloorNumber: apartment.startFloorNumber,
      endFloorNumber: apartment.endFloorNumber,
      startHoNumber: apartment.startHoNumber,
      endHoNumber: apartment.endHoNumber,
      apartmentStatus: apartment.apartmentStatus,
      adminId: admin?.id || null,
      adminName: admin?.name || null,
      adminContact: admin?.contact || null,
      adminEmail: admin?.email || null,
    };
  });

  return formattedApartments;
};

export const getApartment = async (params: z.infer<typeof ApartmentsRequestParamsSchema>) => {
  const { id } = params;

  const apartment = await apartmentRepository.findOne({
    where: { id },
    relations: ['users'],
  });

  if (!apartment) {
    return null;
  }

  const admin = apartment.users.find((u) => u.id === apartment.adminId);

  return {
    id: apartment.id,
    name: apartment.name,
    address: apartment.address,
    officeNumber: apartment.officeNumber,
    description: apartment.description,
    startComplexNumber: apartment.startComplexNumber,
    endComplexNumber: apartment.endComplexNumber,
    startDongNumber: apartment.startDongNumber,
    endDongNumber: apartment.endDongNumber,
    startFloorNumber: apartment.startFloorNumber,
    endFloorNumber: apartment.endFloorNumber,
    startHoNumber: apartment.startHoNumber,
    endHoNumber: apartment.endHoNumber,
    apartmentStatus: apartment.apartmentStatus,
    adminId: admin?.id || null,
    adminName: admin?.name || null,
    adminContact: admin?.contact || null,
    adminEmail: admin?.email || null,
  };
};
