// export robot flow
export const flow = {
    // start of flow
    start: {
    // define a message
    message: "Who am I speaking with?",
    // set path
    path: "second"
    },
    // get user name
    second: {
    message: (params) => `Hi ${params.userInput}! are you in need of a tutor or mentor?`,
    // define options
    "options":["mentor", "tutor"],
    // end path 
    path: "end"
    },
    // end of flow
    end: {
        message: "Thank you.",
        chatDisabled: true
        },
    };
