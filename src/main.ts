import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';

import './assets/main.css';

import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/tailwind-light/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.scss';

const app = createApp(App);

app.use(router);
app.use(PrimeVue);

app.mount('#app');

import runTests from "@/test/runner";
// @ts-ignore
window.runTests = runTests;
