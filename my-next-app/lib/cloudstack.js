/**
 * lib/cloudstack.js
 * -----------------
 * Placeholder wrapper for Apache CloudStack API.
 * Will be filled in later with actual VM lifecycle calls
 * (deploy, stop, list, status, destroy, etc.).
 *
 * For now, all methods return mock data so the rest of
 * the backend can compile and run.
 */

const apiUrl = process.env.CLOUDSTACK_API_URL;
const apiKey = process.env.CLOUDSTACK_API_KEY;
const secretKey = process.env.CLOUDSTACK_SECRET_KEY;

/**
 * Check if CloudStack credentials are configured.
 */
function assertConfigured() {
  if (!apiUrl || !apiKey || !secretKey) {
    throw new Error(
      "CloudStack not configured. Set CLOUDSTACK_API_URL, CLOUDSTACK_API_KEY, and CLOUDSTACK_SECRET_KEY."
    );
  }
}

/**
 * Deploy a new VM. (placeholder)
 * @param {Object} specs - VM specs (name, serviceOfferingId, templateId, zoneId)
 * @returns {Promise<Object>} - Mock VM object
 */
export async function deployVM(specs) {
  assertConfigured();
  // TODO: implement actual CloudStack deployVirtualMachine call
  return {
    vmId: `vm-mock-${Date.now()}`,
    name: specs.name || "unnamed-vm",
    status: "starting",
    specs,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Stop a VM. (placeholder)
 * @param {string} vmId
 * @returns {Promise<Object>}
 */
export async function stopVM(vmId) {
  assertConfigured();
  // TODO: implement actual CloudStack stopVirtualMachine call
  return { vmId, status: "stopped", message: "VM stopped (mock)." };
}

/**
 * Get VM status. (placeholder)
 * @param {string} vmId
 * @returns {Promise<Object>}
 */
export async function getVMStatus(vmId) {
  assertConfigured();
  // TODO: implement actual CloudStack listVirtualMachines call
  return { vmId, status: "running", message: "VM status (mock)." };
}

/**
 * List VMs for a user. (placeholder)
 * @param {string} uid - Firebase user UID
 * @returns {Promise<Array>}
 */
export async function listVMsForUser(uid) {
  assertConfigured();
  // TODO: query CloudStack and filter by user tag/account
  return [];
}
