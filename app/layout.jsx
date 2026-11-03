import './globals.css';
import SharedLayout from '@/components/SharedLayout';

export const metadata = {
  title: 'Naria Holidays — Social Media Automation',
  description: 'Automated social media posting engine for Naria Holidays',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <SharedLayout>
          {children}
        </SharedLayout>
      </body>
    </html>
  );
}
