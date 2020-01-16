<template>
    <div class="p-4 min-h-screen">
        <div class="flex justify-center items-center">
            <a :href="url" target="_blank" rel="nofollow" class="logo">
                <img src="/images/logo_large.png" width="200" alt="Termania.net logo">
            </a>
        </div>
        <div class="flex flex-col justify-center items-center">
            <i class="text-sm text-gray-500">{{ $t("Source") }}: {{ dictionaryName }}</i>
        </div>
        <div v-if="result && 'html' in result" v-html="result.html" />
        <div v-else class="spinner-wrapper flex items-center justify-center flex-col">
            <div v-if="error404" class="p-4 flex flex-col justify-center items-center h-full">
                <img src="/images/404.svg" alt="404" width="250">
                <h2 class="color_orange text-xl">
                    {{ $t('No matches found for query "{query}".', {query}) }}
                </h2>
            </div>
            <div v-else class="flex flex-col justify-center items-center h-full">
                <img src="/images/spinner.svg" alt="spinner" width="250">
                <h1 class="text-xl font-bold text-gray-500 mt-4">
                    {{ $t("Looking for definition ...") }}
                </h1>
            </div>
        </div>
    </div>
</template>

<script>
    import Dictionary from "@/models/Dictionary"

    export default {
        name: "Result",

        data() {
            return {
                result: null,
                error404: false,
                query: null,
                complete: false,
                dictionary: null,
            }
        },

        computed: {
            url() {
                const params = {
                    query: this.result ? this.result.query : this.query,
                    SearchIn: "All",
                }
                if (this.result) {
                    params.dictionaries = this.result.dictionaryId
                }
                const urlSearchParams = new URLSearchParams(params)
                return `https://www.termania.net/iskanje?${urlSearchParams.toString()}`
            },

            dictionaryName() {
                if (this.dictionary) {
                    return this.dictionary.name
                }
                return ""
            },
        },

        created() {
            Dictionary.getActive().then((dictionary) => {
                this.$set(this, "dictionary", dictionary)
            })

            /**
             * In case the result needs to be searched
             */
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if (this.complete) {
                    return
                }

                if (request.msg === "search_complete") {
                    this.$set(this, "result", request.data.result)
                    this.$set(this, "error404", false)
                    this.$set(this, "complete", true)

                    chrome.storage.local.remove("query")
                    chrome.storage.local.remove("result")
                    chrome.storage.local.remove("error404")
                }

                if (request.msg === "error404") {
                    this.$set(this, "query", request.data.query)
                    this.$set(this, "result", null)
                    this.$set(this, "error404", true)
                    this.$set(this, "complete", true)

                    chrome.storage.local.remove("query")
                    chrome.storage.local.remove("error404")
                }
            })

            /**
             * In case the result is from cache
             */
            chrome.storage.local.get("result", ({ result }) => {
                if (this.complete) {
                    return
                }

                if (result) {
                    this.$set(this, "complete", true)
                    this.$set(this, "result", result)

                    chrome.storage.local.remove("query")
                    chrome.storage.local.remove("result")
                    chrome.storage.local.remove("error404")
                }
            })

            /**
             * In case the result is from cache
             */
            chrome.storage.local.get(["error404", "query"], ({ error404, query }) => {
                if (this.complete) {
                    return
                }

                if (error404) {
                    this.$set(this, "result", null)
                    this.$set(this, "query", query)
                    this.$set(this, "error404", true)
                    this.$set(this, "complete", true)

                    chrome.storage.local.remove("query")
                    chrome.storage.local.remove("error404")
                } else {
                    this.$set(this, "query", null)
                    this.$set(this, "error404", false)
                }
            })
        },
    }
</script>
