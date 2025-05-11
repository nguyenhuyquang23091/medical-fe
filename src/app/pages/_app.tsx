import type { AppProps } from 'next/app'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({subsets:['latin']})
 
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={montserrat.className}>
        <Component {...pageProps} />
    </main>
  )
}