// src/index.js

import Vue from 'vue'
import options from './options.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false;

new Vue({
    vuetify,
    render: h => h(options)
}).$mount("#app");
