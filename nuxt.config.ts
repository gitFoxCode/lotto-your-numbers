import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    css: ['@/assets/scss/reset.scss'],
    app: {
        head: {
            title: 'Lotto Your Lucky Numbers!'
        }
    }
})
