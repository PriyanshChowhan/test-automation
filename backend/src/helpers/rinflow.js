import rinflow from "../core/rinflow.engine.js";


const flow = new rinflow({
  docusignConfig: {
    account_id: process.env.ACCOUNT_ID,
    authServer: process.env.AUTHSERVER,
    basePath: process.env.BASEPATH,
    integratorKey: process.env.INTEGRATOR_KEY,
    userId: process.env.USER_ID,
  },
  geminiConfig: { geminiApi: process.env.GEMINI_API },
  resendConfig: { resendApi: process.env.RESEND_API },
});


export default flow