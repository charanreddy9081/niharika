import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Cormorant_Garamond, Cinzel, Great_Vibes } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CartDrawer } from '../components/CartDrawer';
import { Toaster } from 'react-hot-toast';
import KeepAlive from '../components/KeepAlive';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-editorial',
  display: 'swap',
});
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-signature',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'niharikartist | Haute Fine Art Atelier & Handcrafted Keepsakes',
  description: 'Original acrylic & oil paintings, sentimental sibling keepsakes, everlasting botanicals, and wax-sealed calligraphy letters by artist Niharika.',
  icons: { icon: 'https://cuddlingupmybrush.com/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${cormorant.variable} ${cinzel.variable} ${greatVibes.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] antialiased selection:bg-[#e8c872] selection:text-black">
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#0d241a',
                    color: '#fbf8f1',
                    border: '1px solid rgba(232, 200, 114, 0.4)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  },
                }}
              />
              {/* Fixed elements OUTSIDE theme-root so they're unaffected by filter */}
              <CartDrawer />
              <KeepAlive />
              {/* theme-root gets the light mode filter applied via JS */}
              <div id="theme-root">
                {children}
              </div>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
