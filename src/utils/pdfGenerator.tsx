import ResumePreview from '../components/member/ResumePreview';
import { createRoot } from 'react-dom/client';

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  rating: number;
  experience: number;
  bio: string;
  skills: Array<{ name: string; level: string }>;
  companies: Array<{
    companyName: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    skillsRequired: string[];
  }>;
  achievements: Array<{ title: string }>;
}

export async function generatePDF(data: ResumeData, template: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      
      document.body.appendChild(iframe);
      
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        reject(new Error('Could not create iframe document'));
        return;
      }
      
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Resume - ${data.name}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              body {
                margin: 0;
                padding: 20mm;
                font-family: system-ui, -apple-system, sans-serif;
                background: white;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            <div id="resume-root"></div>
          </body>
        </html>
      `);
      doc.close();
      
      const onLoad = () => {
        const rootElement = doc.getElementById('resume-root');
        if (!rootElement) {
          reject(new Error('Root element not found'));
          return;
        }
        
        const root = createRoot(rootElement);
        root.render(<ResumePreview data={data} template={template as any} isPrintMode={true} />);
        
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            setTimeout(() => {
              if (iframe.parentNode) {
                document.body.removeChild(iframe);
              }
              resolve();
            }, 1000);
          } catch (error) {
            reject(error);
          }
        }, 500);
      };
      
      iframe.addEventListener('load', onLoad);
      iframe.addEventListener('error', () => reject(new Error('Iframe failed to load')));
      
    } catch (error) {
      reject(error);
    }
  });
}
