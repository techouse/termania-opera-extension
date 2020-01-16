<template>
    <div id="dict-select" class="p-4">
        <div class="flex flex-col justify-center items-center">
            <img src="/images/logo_large.png" alt="Termania.net logo" class="w-56">
            <i class="text-sm text-gray-500">{{ $t("Settings") }}</i>
        </div>
        <div class="flex flex-col justify-center items-center mt-4">
            <label class="block w-full">
                <span class="text-gray-700">{{ $t("Active Dictionary") }}</span>
                <vue-single-select v-model="dictionary"
                                   :options="dictionaries"
                                   :required="true"
                                   :option-key="optionKey"
                                   :option-label="optionLabel"
                                   :get-option-description="getOptionDescription"
                                   :placeholder="$t('Type to search a dictionary ...')"
                                   max-height="300px"
                                   @input="valueChanged"
                />
            </label>
            <div class="block w-full mt-4">
                <span class="text-gray-700">{{ $t("Miscellaneous") }}</span>
                <div class="mt-2">
                    <div>
                        <label class="inline-flex items-center">
                            <input v-model="autoClose" type="checkbox" class="form-checkbox" @change="autoCloseHandler">
                            <span class="ml-2">
                                {{ $t("Automatically close old result popup window on new query") }}
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import VueSingleSelect                from "vue-single-select"
    import { getDictionaries }            from "@/services"
    import { DEFAULT_DICTIONARY_ID }      from "@/services/constants"
    import Dictionary                     from "@/models/Dictionary"
    import { getAutoClose, setAutoClose } from "@/services/misc"

    export default {
        name: "Options",

        components: {
            VueSingleSelect,
        },

        data() {
            return {
                dictionary: null,
                dictionaries: [],
                autoClose: false,
                optionKey: "id",
                optionLabel: "name",
            }
        },

        created() {
            getDictionaries()
                    .then((dictionaries) => {
                        this.$set(this, "dictionaries", dictionaries)

                        Dictionary.getActive()
                                  .then((dictionary) => {
                                      this.$set(this, "dictionary", dictionary)
                                  })
                                  .catch(() => {
                                      this.$set(this, "dictionary", this.dictionaries.find((dict) => dict.id === DEFAULT_DICTIONARY_ID))
                                  })
                    })

            getAutoClose().then((autoClose) => {
                this.$set(this, "autoClose", autoClose)
            })
        },

        methods: {
            getOptionDescription(option) {
                return option[this.optionLabel]
            },

            valueChanged(dictionary) {
                if (dictionary) {
                    Dictionary.setActive(dictionary)
                }
            },

            autoCloseHandler() {
                setAutoClose(this.autoClose)
            },
        },
    }
</script>
