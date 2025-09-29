import csvParser from 'csv-parser';
import streamifier from 'streamifier';
import { HouseholdType } from '../entities/resident.entity';
import { csvResidentSchema, CsvResidentDto } from './dtos/resident-csv.dto';

export const parseCsvBuffer = (buffer: Buffer): Promise<CsvResidentDto[]> => {
  return new Promise((resolve, reject) => {
    const results: CsvResidentDto[] = [];
    const stream = streamifier.createReadStream(buffer);

    stream
      .pipe(csvParser({ headers: true }))
      .on('data', (data: Record<string, string>) => {
        const raw = {
          name: data['이름'],
          contact: data['연락처'],
          building: data['동'],
          unitNumber: data['호수'],
          isHouseholder:
            data['세대주여부'] === 'HOUSEHOLDER'
              ? HouseholdType.HOUSEHOLDER
              : HouseholdType.MEMBER,
        };

        const parsed = csvResidentSchema.safeParse(raw);

        if (parsed.success) {
          results.push(parsed.data);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
