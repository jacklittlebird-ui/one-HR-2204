import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { downloadEmployeeFormPdf, employeeFormPdfFilename } from '@/lib/employeeFormPdf';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmployeeFormDownloadProps {
  formName: string;
  employeeName: string;
  children: ReactNode;
}

interface EmployeeFormPdfContextValue {
  download: () => Promise<void>;
  busy: boolean;
  ar: boolean;
}

const EmployeeFormPdfContext = createContext<EmployeeFormPdfContextValue | null>(null);

export function EmployeeFormDownload({ formName, employeeName, children }: EmployeeFormDownloadProps) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const preview = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    const iframe = preview.current?.querySelector<HTMLIFrameElement>('iframe[srcdoc]');
    if (!iframe) {
      toast.error(ar ? 'انتظر حتى يكتمل تحميل النموذج' : 'Please wait for the form to load');
      return;
    }
    setBusy(true);
    try {
      await downloadEmployeeFormPdf(iframe, employeeFormPdfFilename(formName, employeeName));
    } catch {
      toast.error(ar ? 'تعذر تحميل PDF، يرجى المحاولة مرة أخرى' : 'Could not download PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <EmployeeFormPdfContext.Provider value={{ download, busy, ar }}>
      <div ref={preview}>{children}</div>
    </EmployeeFormPdfContext.Provider>
  );
}

/** Renders the "Download PDF" action. Place it next to the form's print button. */
export function EmployeeFormDownloadButton({ className }: { className?: string }) {
  const ctx = useContext(EmployeeFormPdfContext);
  if (!ctx) return null;
  const { download, busy, ar } = ctx;
  return (
    <Button variant="outline" onClick={download} disabled={busy} className={cn('gap-2', className)}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {busy ? (ar ? 'جاري تحميل PDF...' : 'Downloading PDF...') : (ar ? 'تحميل PDF' : 'Download PDF')}
    </Button>
  );
}
