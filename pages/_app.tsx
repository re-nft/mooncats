import Head from 'next/head';
import Layout from '../components/layout';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import { GraphProvider } from '../contexts/graph/index';
import { MooncatsProvider } from '../contexts/mooncats/index';
import { TransactionStateProvider } from '../contexts/TransactionState';
import { Symfoni } from '../hardhat/SymfoniContext';

import '../styles/reset.scss';
import '../styles/index.scss';
import { HOME_URL } from '../lib/consts';

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Righteous',
      'consolas',
      'Menlo',
      'monospace',
      'sans-serif',
    ].join(','),
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const { cat, catImage } = pageProps;

  const metaDescription = cat?.id
    ? `Cat Id - ${cat.id}`
    : 'reNFTs MoonCat Base';

  const metaImage = catImage || HOME_URL + '/logo512.png';

  const metaURL = `https://b095e22b1bf1.ngrok.io/${
    cat?.id ? `cat/${cat.id}` : ''
  }`;

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:title" content="MoonCat Rescue Shop" />
        <meta property="og:url" content={metaURL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={metaImage} />
        <meta property="og:image_secure_url" content={metaImage} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:title" content="MoonCat Rescue Shop" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@renftlabs" />
        <meta name="twitter:image" content={metaImage} />
      </Head>
      <Symfoni>
        <MooncatsProvider>
          <GraphProvider>
            <TransactionStateProvider>
              <ThemeProvider theme={theme}>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ThemeProvider>
            </TransactionStateProvider>
          </GraphProvider>
        </MooncatsProvider>
      </Symfoni>
    </>
  );
}

export default MyApp;
