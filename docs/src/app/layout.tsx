import "nextra-theme-docs/style.css";

import { Banner, Head } from "nextra/components";
/* eslint-env node */
import { Footer, Layout, Navbar } from "nextra-theme-docs";

import { GlobalStylings } from "./GlobalStylings";
import { getPageMap } from "nextra/page-map";

export const metadata = {
  metadataBase: new URL("https://mobxmotion.com"),
  title: {
    template: "%s - mobxmotion",
  },
  description: "mobxmotion: joyful styling for React and Styled Components",
  applicationName: "mobxmotion",
  generator: "Next.js",
  appleWebApp: {
    title: "mobxmotion",
  },
  // other: {
  //   "msapplication-TileImage": "/ms-icon-144x144.png",
  //   "msapplication-TileColor": "#fff",
  // },
  twitter: {
    site: "https://mobxmotion.com",
    card: "summary_large_image",
  },
  openGraph: {
    type: "website",
    url: "https://mobxmotion.com",
    title: "mobxmotion",
    description: "mobxmotion: joyful styling for React and Styled Components",
    images: [
      {
        url: "https://mobxmotion.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "mobxmotion",
      },
    ],
  },
};

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>mobxmotion</b>
        </div>
      }
      projectLink="https://github.com/pie6k/mobxmotion"
    />
  );
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          // banner={<Banner storageKey="Nextra 2">Nextra 2 Alpha</Banner>}
          navbar={navbar}
          footer={<Footer>MIT {new Date().getFullYear()} © mobxmotion.</Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/pie6k/mobxmotion/blob/main/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          <GlobalStylings />
          {children}
        </Layout>
      </body>
    </html>
  );
}
