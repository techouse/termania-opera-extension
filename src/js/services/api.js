import axios          from "axios"
import { licenceKey } from "@/services/constants"

const api = axios.create({
    baseURL: "https://api.termania.net/1.0/",
    headers: {
        common: {
            Accept: "application/json",
        },
    },
})

api.defaults.params = {}
api.defaults.params.licenceKey = licenceKey

api.CancelToken = axios.CancelToken
api.isCancel = axios.isCancel

export default api
