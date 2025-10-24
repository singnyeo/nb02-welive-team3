import { z } from 'zod';
import { ApprovalStatus } from '../entities/approvalStatus.entity';

// =============================
// : ZOD CUSTOM TYPES
// =============================
const id = z.uuid();
const name = z.string().min(1).max(64);
const address = z.string().min(1).max(512);
const officeNumber = z.string().min(9).max(11);
const description = z.string().min(1).max(256);
const startComplexNumber = z.number().int().min(1).max(999);
const endComplexNumber = z.number().int().min(1).max(999);
const startDongNumber = z.number().int().min(1).max(999);
const endDongNumber = z.number().int().min(1).max(999);
const startFloorNumber = z.number().int().min(1).max(999);
const endFloorNumber = z.number().int().min(1).max(999);
const startHoNumber = z.number().int().min(1).max(999);
const endHoNumber = z.number().int().min(1).max(999);
const apartmentStatus = z.enum(ApprovalStatus);
const adminId = id;
const adminName = name;
const adminContact = z.string().min(9).max(11);
const adminEmail = z.email();

// =============================
// : ZOD SCHEMAS
// =============================
export const ApartmentsRequestParamsSchema = z.object({
  id: id,
});

export const GetApartmentsRequestQuerySchema = z.object({
  name: name.optional(),
  address: address.optional(),
});

export const GetApartmentsRequestSchema = z.object({
  query: GetApartmentsRequestQuerySchema.optional(),
});

export const GetApartmentsResponseSchema = z.array(
  z.object({
    id: id,
    name: name,
    address: address,
    officeNumber: officeNumber,
    description: description,
    startComplexNumber: startComplexNumber,
    endComplexNumber: endComplexNumber,
    startDongNumber: startDongNumber,
    endDongNumber: endDongNumber,
    startFloorNumber: startFloorNumber,
    endFloorNumber: endFloorNumber,
    startHoNumber: startHoNumber,
    endHoNumber: endHoNumber,
    apartmentStatus: apartmentStatus,
    adminId: adminId,
    adminName: adminName,
    adminContact: adminContact,
    adminEmail: adminEmail,
  })
);

export const GetApartmentRequestSchema = z.object({
  params: ApartmentsRequestParamsSchema,
});

export const GetApartmentResponseSchema = z.object({
  id: id,
  name: name,
  address: address,
  officeNumber: officeNumber,
  description: description,
  startComplexNumber: startComplexNumber,
  endComplexNumber: endComplexNumber,
  startDongNumber: startDongNumber,
  endDongNumber: endDongNumber,
  startFloorNumber: startFloorNumber,
  endFloorNumber: endFloorNumber,
  startHoNumber: startHoNumber,
  endHoNumber: endHoNumber,
  apartmentStatus: apartmentStatus,
  adminId: adminId,
  adminName: adminName,
  adminContact: adminContact,
  adminEmail: adminEmail,
});
