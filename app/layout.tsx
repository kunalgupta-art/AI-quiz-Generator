import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Quiz Generator',
  description: 'Generate and practice custom multiple choice quizzes (MCQ) on any topic with instant feedback and explanations.',
  openGraph: {
    title: 'AI Quiz Generator',
    description: 'Generate and practice custom multiple choice quizzes (MCQ) on any topic with instant feedback and explanations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Quiz Generator',
    description: 'Generate and practice custom multiple choice quizzes (MCQ) on any topic with instant feedback and explanations.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
