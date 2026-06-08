import crypto from "crypto";

const API_URL = process.env.CLOUDSTACK_API_URL || "https://qa.cloudstack.cloud/client/api";
const API_KEY = process.env.CLOUDSTACK_API_KEY || "";
const SECRET_KEY = process.env.CLOUDSTACK_SECRET_KEY || "";

/**
 * CloudStack API Signature Algorithm
 *
 * 1. Sort all parameters alphabetically by key name
 * 2. For the signature string, lowercase both keys and values
 * 3. URL-encode values with spaces encoded as %20
 * 4. HMAC-SHA1 with the secret key
 * 5. Base64 encode the digest
 */
function sortCloudStackParams(params: Record<string, string>): string[] {
  return Object.keys(params).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

function encodeCloudStackValue(value: string): string {
  return encodeURIComponent(value);
}

function buildCloudStackSignatureString(params: Record<string, string>): string {
  return sortCloudStackParams(params)
    .map((key) => {
      const value = params[key];
      return `${key.toLowerCase()}=${encodeCloudStackValue(value.toLowerCase())}`;
    })
    .join("&");
}

function generateSignature(params: Record<string, string>): string {
  const signatureString = buildCloudStackSignatureString(params);
  console.log("[CloudStack] Signature input:", signatureString);

  const hmac = crypto.createHmac("sha1", SECRET_KEY);
  hmac.update(signatureString);
  return hmac.digest("base64");
}

function buildCloudStackRequestQuery(params: Record<string, string>): string {
  return sortCloudStackParams(params)
    .map((key) => `${key}=${encodeCloudStackValue(params[key])}`)
    .join("&");
}

async function callCloudStack(command: string, params: Record<string, string> = {}): Promise<any> {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error("CloudStack API credentials are not configured");
  }

  // Build request parameters (WITHOUT signature)
  const requestParams: Record<string, string> = {
    apiKey: API_KEY,
    command,
    response: "json",
    ...params,
  };

  // Generate signature from the parameters
  const signature = generateSignature(requestParams);

  // Build query string for the actual request URL using the original values.
  const queryString = buildCloudStackRequestQuery(requestParams);

  // Append signature
  const url = `${API_URL}?${queryString}&signature=${encodeURIComponent(signature)}`;

  console.log(`[CloudStack] URL: ${url.substring(0, 200)}...`);

  try {
    console.log(`[CloudStack] Calling ${command}...`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CloudStack] ${command} failed: ${response.status} - ${errorText}`);
      throw new Error(`CloudStack ${command} failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[CloudStack] ${command} success`);
    return data;
  } catch (error) {
    console.error(`[CloudStack] ${command} error:`, error);
    throw error;
  }
}

export async function listVirtualMachines(): Promise<any> {
  return callCloudStack("listVirtualMachines", { listall: "true" });
}

export async function listServiceOfferings(): Promise<any> {
  return callCloudStack("listServiceOfferings");
}

export async function listTemplates(): Promise<any> {
  return callCloudStack("listTemplates", { templatefilter: "featured" });
}

export async function listZones(): Promise<any> {
  return callCloudStack("listZones");
}

export async function deployVirtualMachine(params?: Record<string, string>): Promise<any> {
  const deployParams = params || {};
  try {
    return await callCloudStack("deployVirtualMachine", deployParams);
  } catch (err: any) {
    // If error mentions networkIds, it's because there are multiple networks - 
    // the caller should provide networkids parameter
    if (err.message?.includes("networkIds") || err.message?.includes("network")) {
      throw new Error("Multiple networks available. Please select a network first.");
    }
    throw err;
  }
}

export async function startVirtualMachine(id?: string): Promise<any> {
  if (!id) throw new Error("VM id is required");
  try {
    return await callCloudStack("startVirtualMachine", { id });
  } catch (err: any) {
    // If VM doesn't exist in CloudStack, treat as success (already in desired state)
    if (err.message?.includes("431") || err.message?.includes("does not exist") || err.message?.includes("entity does not exist")) {
      console.log("[CloudStack] VM does not exist in CloudStack, treating start as success");
      return { startvirtualmachineresponse: { success: true, id } };
    }
    throw err;
  }
}

export async function stopVirtualMachine(id?: string): Promise<any> {
  if (!id) throw new Error("VM id is required");
  try {
    return await callCloudStack("stopVirtualMachine", { id });
  } catch (err: any) {
    // If VM doesn't exist in CloudStack, treat as success (already in desired state)
    if (err.message?.includes("431") || err.message?.includes("does not exist") || err.message?.includes("entity does not exist")) {
      console.log("[CloudStack] VM does not exist in CloudStack, treating stop as success");
      return { stopvirtualmachineresponse: { success: true, id } };
    }
    throw err;
  }
}

export async function destroyVirtualMachine(id?: string): Promise<any> {
  if (!id) throw new Error("VM id is required");
  try {
    return await callCloudStack("destroyVirtualMachine", { id });
  } catch (err: any) {
    // If VM doesn't exist in CloudStack, treat as success (already destroyed)
    if (err.message?.includes("431") || err.message?.includes("does not exist") || err.message?.includes("entity does not exist")) {
      console.log("[CloudStack] VM does not exist in CloudStack, treating destroy as success");
      return { destroyvirtualmachineresponse: { success: true, id } };
    }
    throw err;
  }
}

export async function listNetworks(zoneid: string): Promise<any> {
  if (!zoneid) throw new Error("Zone id is required");
  return callCloudStack("listNetworks", { zoneid, listall: "true" });
}
