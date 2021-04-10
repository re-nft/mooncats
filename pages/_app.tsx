import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import Layout from '../components/layout';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import { GraphProvider } from '../contexts/graph/index';
import { MooncatsProvider } from '../contexts/mooncats/index';
import { TransactionStateProvider } from '../contexts/TransactionState';
import { Symfoni } from '../hardhat/SymfoniContext';

import '../styles/reset.scss';
import '../styles/index.scss';
import 'nprogress/nprogress.css';
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

NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const { cat, catImageURL } = pageProps;
  const metaDescription = cat?.id ? `Cat Id - ${cat.id}` : 'reNFT MoonCat Base';

  const metaImage = catImageURL || HOME_URL + '/logo512.png';

  const metaURL = `${typeof window !== undefined ? HOME_URL : ''}/${
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
