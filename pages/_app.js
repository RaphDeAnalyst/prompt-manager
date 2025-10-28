import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "../src/context/ToastContext";
import "../src/styles/App.css";
import "../src/styles/signin.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </SessionProvider>
  );
}
