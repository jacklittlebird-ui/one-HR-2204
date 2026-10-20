import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Employee } from '@/types/employee';
import { EmployeeFormDownload } from '@/components/documents/EmployeeFormDownload';
import { Form01 } from '@/components/documents/Form01';
import { Form06 } from '@/components/documents/Form06';
import { EmploymentContract } from '@/components/documents/EmploymentContract';
import { ClearanceCertificate } from '@/components/documents/ClearanceCertificate';
import { ExperienceCertificate } from '@/components/documents/ExperienceCertificate';
import { MutualTermination } from '@/components/documents/MutualTermination';
import { FinalSettlement } from '@/components/documents/FinalSettlement';
import { ResignationLetter } from '@/components/documents/ResignationLetter';
import { EmployeeDataForm } from '@/components/documents/EmployeeDataForm';

// Radix Select (used by three forms) needs ResizeObserver, missing in jsdom.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'ar', isRTL: true, t: (k: string) => k }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const employee = {
  id: 'e1',
  employeeId: 'emp0001',
  nameAr: 'أحمد محمد',
  nameEn: 'Ahmed Mohamed',
  department: 'الإدارة',
  jobTitle: 'أمين سلامة',
  jobTitleAr: 'أمين سلامة',
  jobTitleEn: 'Safety Officer',
  phone: '01000000000',
  email: 'ahmed@example.com',
  status: 'active',
  stationName: 'القاهرة',
  nationalId: '29001010101010',
  socialInsuranceNo: '12345678',
  socialInsuranceStartDate: '2020-01-01',
  hireDate: '2020-01-01',
  address: '10 شارع الجزيرة - الزمالك - القاهرة',
  city: 'القاهرة',
  governorate: 'القاهرة',
  educationAr: 'بكالوريوس',
  nationality: 'مصرية',
  contractType: 'محدد المدة',
} as Employee;

const FORMS = [
  ['استمارة 1', Form01],
  ['استمارة 6', Form06],
  ['عقد عمل', EmploymentContract],
  ['إخلاء طرف', ClearanceCertificate],
  ['شهادة خبرة', ExperienceCertificate],
  ['إنهاء علاقة عمل بالتراضي', MutualTermination],
  ['مخالصة نهائية', FinalSettlement],
  ['استقالة', ResignationLetter],
  ['نموذج بيانات موظف', EmployeeDataForm],
] as const;

afterEach(cleanup);

describe('Download PDF button placement', () => {
  it.each(FORMS)('places the download button next to the print button in %s', (_name, Comp) => {
    render(
      <EmployeeFormDownload formName="استقالة" employeeName="أحمد محمد">
        <Comp employee={employee} />
      </EmployeeFormDownload>
    );

    const printButton = screen.getByRole('button', { name: /طباعة \/ PDF/ });
    const downloadButtons = screen.getAllByRole('button', { name: /تحميل PDF/ });

    expect(downloadButtons).toHaveLength(1);
    const downloadButton = downloadButtons[0];
    // Same toolbar row, immediately after the print button.
    expect(downloadButton.parentElement).toBe(printButton.parentElement);
    expect(printButton.nextElementSibling).toBe(downloadButton);
  });
});
