// Import statements
import docusign from "docusign-esign";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct way to get privateKeyPath
const privateKeyPath = path.join(__dirname, "private.key");

// const privateKeyPath = path.join(path.resolve(), "private.key");

// Document Information
const documentFileName = "test_document.pdf";
const documentName = "Test Document";
const documentPath = path.join(__dirname, documentFileName);

// Function to obtain JWT access token
async function getAccessToken(docusignConfig) {
  const apiClient = new docusign.ApiClient();
  apiClient.setOAuthBasePath(docusignConfig.authServer);
  const privateKey = fs.readFileSync(privateKeyPath);
  const results = await apiClient.requestJWTUserToken(
    docusignConfig.integratorKey,
    docusignConfig.userId,
    ["signature", "impersonation"],
    privateKey,
    3600
  );
  return results.body.access_token;
}

// Function to send envelope
async function sendEnvelope({ loanId, recipientEmail, recipientName, docusignConfig }) {
  const accessToken = await getAccessToken(docusignConfig);
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(docusignConfig.basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  // Read the document
  const documentBytes = fs.readFileSync(documentPath);
  const documentBase64 = documentBytes.toString("base64");

  // Create the document object
  const document = new docusign.Document();
  document.documentBase64 = documentBase64;
  document.name = documentName;
  document.fileExtension = "pdf";
  document.documentId = "1";

  // Create the signer recipient
  const signer = docusign.Signer.constructFromObject({
    email: recipientEmail,
    name: recipientName,
    recipientId: "1",
    routingOrder: "1",
  });

  // Create a signHere tab (signature field)
  const signHere = docusign.SignHere.constructFromObject({
    documentId: "1",
    pageNumber: "1",
    recipientId: "1",
    tabLabel: "SignHereTab",
    xPosition: "100",
    yPosition: "150",
  });

  // Add the tabs to the signer
  signer.tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere],
  });

  // Create the envelope definition
  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = `Loan Accepted Please sign this document (LoanId: ${loanId})`;
  envelopeDefinition.documents = [document];
  envelopeDefinition.recipients = docusign.Recipients.constructFromObject({
    signers: [signer],
  });
  envelopeDefinition.status = "sent";

  // Send the envelope
  const results = await envelopesApi.createEnvelope(docusignConfig.account_id, {
    envelopeDefinition: envelopeDefinition,
  });

  console.log("Envelope has been sent! Envelope ID: " + results.envelopeId);
  return results.envelopeId;
}

// Main function to send contract
async function sendSignReq({ loanId, recipientEmail, recipientName, docusignConfig }) {
  try {
    const envelopeId = await sendEnvelope({
      loanId,
      recipientEmail,
      recipientName,
      docusignConfig,
    });
    // Placeholder for webhook listener setup
  } catch (error) {
    console.error("Error: ", error);
  }
}

export default sendSignReq;
