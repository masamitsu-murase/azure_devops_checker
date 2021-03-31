
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
// import Vuetify from 'vuetify'
// import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const opts = {
    icons: {
        iconfont: "fa"
    },
    theme: {
        disable: true
    }
}

export default new Vuetify(opts)
