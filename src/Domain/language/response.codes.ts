export const RESPONSE_CODES = {
    // - Respuestas de comands:

    // -- Confirm command (confirmación de compra por parte del cliente)
    CONFIRM_COMMAND: {
       CONFIRMATION_OK_REGISTERED: 1001,
       CONFIRMATION_KO_REGISTERED: 1002,
       CONFIRMATION_ALREADY_EXIST: 1003,
    },
    REMOVE_LEAD_COMMAND: {
        REMOVE_OK_REGISTERED: 2001,
        REMOVE_KO_REGISTERED: 2002,
        REMOVE_ALREADY_EXIST: 2003,
     },
     // User related commands (3000)
     CREATE_USER_COMMAND: {
         CREATE_OK: 3001,
         CONFIRMED_OK: 3004
     },
     CHANGE_PASSWORD_COMMAND: {
         CHANGE_OK: 3002,
         EMAIL_OK: 3003
     },
     SEND_CONFIRMATION: {
         CONFIRMATION_SEND_OK: 3005
     },
    CANCEL_PLAN_COMMAND: {
        CANCEL_OK: 3006
    },
    UPDATE_CUSTOMER_COMMAND: {
        UPDATE_OK: 3007
    },
    ADD_LEAD_COMMAND: {
        ADD_OK: 3008
    },
    SEND_LEAD_EMAIL_COMMAND: {
        SEND_OK: 3009
    },
    REACTIVATE_PLAN_COMMAND: {
        REACTIVATE_OK: 3006
    },
    DELETE_USER: {
        DELETE_USER_OK: 3200
     },
} 