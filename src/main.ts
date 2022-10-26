import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// @ts-ignore
import { UidPlugin } from '@shimyshack/uid';

import PrimeVue from 'primevue/config';

import './assets/main.css';

import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/arya-blue/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.scss';

import Bill from "@/processing/bill";
Bill.wait_for_init().then();

const app = createApp(App);

app.use(router);
app.use(PrimeVue);
app.use(UidPlugin)

app.mount('#app');

import runTests from "@/test/runner";
// @ts-ignore
window.runTests = runTests;
