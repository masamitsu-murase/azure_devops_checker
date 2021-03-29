// src/index.js

import Vue from 'vue'
import popup from './popup.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false;

new Vue({
    vuetify,
    render: h => h(popup)
}).$mount("#app");
