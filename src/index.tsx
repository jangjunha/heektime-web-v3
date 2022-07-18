import {
  CaptureConsole as CaptureConsoleIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
  ReportingObserver as ReportingObserverIntegration,
} from '@sentry/integrations';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Routes,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

Sentry.init({
  dsn: 'https://44db6fc9651a4f47a79d9f13d6dc41d4@o160606.ingest.sentry.io/6249083',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    new ExtraErrorDataIntegration(),
    new CaptureConsoleIntegration(),
    new ReportingObserverIntegration(),
  ],
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
