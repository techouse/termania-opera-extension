import Vue     from "vue"
import i18n    from "@/i18n"
import Options from "@/components/Options"

new Vue({
    el: "#app",
    i18n,
    render: (h) => h(Options),
})
