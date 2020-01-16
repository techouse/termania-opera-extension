module.exports = {
    theme: {
        extend: {
            fontFamily: {
                body: ["Arial", "sans-serif"],
            },
            spacing: {
                52: "13rem",
                96: "24rem",
                104: "26rem",
                112: "28rem",
                128: "32rem",
            }
        },
        screens: {
            xxs: "320px",
            xs: "360px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
        },
    },
    variants: {
        backgroundColor: ["responsive", "hover", "focus"],
        borderCollapse: ["responsive", "hover", "focus"],
        cursor: ["responsive", "hover", "focus"],
        display: ["responsive", "group-hover"],
        height: ["responsive", "hover", "focus"],
        maxWidth: ["responsive", "hover", "focus"],
        opacity: ["responsive", "hover", "focus", "group-hover"],
        tableLayout: ["responsive", "hover", "focus"],
        textColor: ["responsive", "hover", "focus", "group-hover"],
        visibility: ["responsive", "hover", "focus", "group-hover"],
    },
    plugins: [
        require('@tailwindcss/custom-forms'),
    ]
}
