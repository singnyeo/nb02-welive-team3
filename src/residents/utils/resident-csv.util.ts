import csvParser from 'csv-parser';
import streamifier from 'streamifier';
import { HouseholdType } from '../../entities/resident.entity';
import { CsvResidentDto } from '../dtos/resident-csv.dto';

export const parseCsvBuffer = (buffer: Buffer): Promise<CsvResidentDto[]> => {
  return new Promise((resolve, reject) => {
    const results: CsvResidentDto[] = [];
    const stream = streamifier.createReadStream(buffer);
    const headers = ['동', '호수', '이름', '연락처', '세대주 여부'];

    stream
      .pipe(csvParser({
        headers,
        skipLines: 1,
        mapHeaders: ({ header }) => header.replace(/"/g, '').replace(/\s/g, '').trim()
      }))
      .on('data', (data: Record<string, string>) => {
        console.log('Raw CSV row:', data);
        let contactRaw = data['연락처'] || '';

        contactRaw = contactRaw.replace(/^="?|"?$/g, '').trim();


        const raw: CsvResidentDto = {
          name: data['이름']?.trim() ?? '',
          contact: contactRaw,
          building: data['동']?.trim() ?? '',
          unitNumber: data['호수']?.trim() ?? '',
          isHouseholder:
            (data['세대주 여부'] ?? '')
              .toLowerCase() === 'householder' || (data['세대주 여부'] ?? '').toLowerCase() === '세대주'
              ? HouseholdType.HOUSEHOLDER
              : HouseholdType.MEMBER,
        };
        results.push(raw);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
