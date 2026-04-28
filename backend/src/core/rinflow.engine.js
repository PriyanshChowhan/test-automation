import sendSignReq from "../services/docusign-request/docusign.js";
import sendMail from "../services/resend/email.js";
import { riskAssessment } from "../services/gemini-api/risk.js";
import computeLoanMetrics from "../services/summarize/loanMetrics.js";


export default class RinflowEngine {
  constructor({ resendConfig, docusignConfig, geminiConfig }) {
    this.resendConfig = resendConfig;
    this.docusignConfig = docusignConfig;
    this.geminiConfig = geminiConfig;
  }

  // 1️⃣ Summarize application data
  summarizeData({ applicationData }) {
    return computeLoanMetrics({ applicationData });
  }

  // 2️⃣ Analyze risk using Gemini API & your ML model
  async analyzeRisk({ applicationData }) {
    const additionalData = this.summarizeData({
      applicationData,
    });

    const response = await riskAssessment({
      applicationData,
      additionalData,
      geminiConfig: this.geminiConfig,
    });

    return response;
  }

  // 3️⃣ Send contract via DocuSign
  async sendContract({ loanId, recipientEmail, recipientName }) {
    await sendSignReq({
      loanId,
      recipientEmail,
      recipientName,
      docusignConfig: this.docusignConfig,
    });
  }

  // 4️⃣ Send rejection email via Resend
  async sendRejectionEmail({ loanId, email, username }) {
    await sendMail({
      loanId,
      email,
      username,
      resendConfig: this.resendConfig,
    });
  }
}
