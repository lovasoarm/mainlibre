import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ServicesProvider } from '../shared/hooks/services-context';
import { services } from './container';
import { IntentNavigation } from './IntentNavigation';
import { ThemeBridge } from './ThemeBridge';
import { AppLayout } from './AppLayout';
import { VoiceProvider } from '../features/voice';
import { LabProvider } from '../features/lab';
import { StatusMessage } from '../shared/ui/StatusMessage';
import { fr } from '../shared/i18n/fr';

const HubScreen = lazy(() => import('../features/hub').then((module) => ({ default: module.HubScreen })));
const VoiceScreen = lazy(() => import('../features/voice').then((module) => ({ default: module.VoiceScreen })));
const ScanScreen = lazy(() => import('../features/scan-nav').then((module) => ({ default: module.ScanScreen })));
const KeyboardScreen = lazy(() => import('../features/keyboard').then((module) => ({ default: module.KeyboardScreen })));
const ArMenuScreen = lazy(() => import('../features/ar-menu').then((module) => ({ default: module.ArMenuScreen })));
const LabScreen = lazy(() => import('../features/lab').then((module) => ({ default: module.LabScreen })));
const ProfileScreen = lazy(() => import('../features/profile').then((module) => ({ default: module.ProfileScreen })));

export function App() {
  return (
    <ServicesProvider services={services}>
      <LabProvider>
        <ThemeBridge />
        <VoiceProvider>
          <BrowserRouter>
            <IntentNavigation />
            <Suspense fallback={<main className="loading"><StatusMessage>{fr.common.loading}</StatusMessage></main>}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route index element={<HubScreen />} />
                  <Route path="voice" element={<VoiceScreen />} />
                  <Route path="scan" element={<ScanScreen />} />
                  <Route path="keyboard" element={<KeyboardScreen />} />
                  <Route path="ar" element={<ArMenuScreen />} />
                  <Route path="lab" element={<LabScreen />} />
                  <Route path="profile" element={<ProfileScreen />} />
                  <Route path="*" element={<HubScreen />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </VoiceProvider>
      </LabProvider>
    </ServicesProvider>
  );
}
