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
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:description" content="reNFTs MoonCat Base" />
        <meta property="og:title" content="MoonCat Rescue Shop" />
        <meta property="twitter:description" content="reNFTs MoonCat Base" />
        <meta property="twitter:title" content="MoonCat Rescue Shop" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@renftlabs" />
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
