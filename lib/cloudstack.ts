// Mock CloudStack API functions
// In production, replace these with actual API calls

export const mockServiceOfferings = [
  { id: "1", name: "Small Instance", cpunumber: 1, memory: 1024, displaytext: "1 CPU, 1GB RAM" },
  { id: "2", name: "Medium Instance", cpunumber: 2, memory: 2048, displaytext: "2 CPU, 2GB RAM" },
  { id: "3", name: "Large Instance", cpunumber: 4, memory: 4096, displaytext: "4 CPU, 4GB RAM" },
];

export const mockTemplates = [
  { id: "1", name: "Ubuntu 22.04 LTS", displaytext: "Ubuntu Server", ostypename: "Ubuntu" },
  { id: "2", name: "CentOS 9 Stream", displaytext: "CentOS Stream", ostypename: "CentOS" },
  { id: "3", name: "Debian 12", displaytext: "Debian Bookworm", ostypename: "Debian" },
];

export const mockZones = [
  { id: "1", name: "Zone-1", networktype: "Advanced" },
  { id: "2", name: "Zone-2", networktype: "Basic" },
];

export async function listVirtualMachines(): Promise<any> {
  return {
    listvirtualmachinesresponse: {
      count: 3,
      virtualmachine: [
        {
          id: "vm-1",
          name: "web-server-01",
          displayname: "Web Server 01",
          state: "Running",
          templatename: "Ubuntu 22.04 LTS",
          serviceofferingname: "Medium Instance",
          cpunumber: 2,
          memory: 2048,
          zonename: "Zone-1",
          created: "2024-01-15T10:00:00Z",
          ipaddress: "10.0.1.100"
        },
        {
          id: "vm-2",
          name: "db-server-01",
          displayname: "Database Server",
          state: "Stopped",
          templatename: "CentOS 9 Stream",
          serviceofferingname: "Large Instance",
          cpunumber: 4,
          memory: 4096,
          zonename: "Zone-1",
          created: "2024-01-10T08:30:00Z",
          ipaddress: "10.0.1.101"
        },
        {
          id: "vm-3",
          name: "app-server-01",
          displayname: "Application Server",
          state: "Running",
          templatename: "Debian 12",
          serviceofferingname: "Small Instance",
          cpunumber: 1,
          memory: 1024,
          zonename: "Zone-2",
          created: "2024-01-20T14:15:00Z",
          ipaddress: "10.0.2.50"
        }
      ]
    }
  };
}

export async function listServiceOfferings(): Promise<any> {
  return {
    listserviceofferingsresponse: {
      serviceoffering: mockServiceOfferings
    }
  };
}

export async function listTemplates(): Promise<any> {
  return {
    listtemplatesresponse: {
      template: mockTemplates
    }
  };
}

export async function listZones(): Promise<any> {
  return {
    listzonesresponse: {
      zone: mockZones
    }
  };
}

export async function deployVirtualMachine(): Promise<any> {
  return {
    deployvirtualmachineresponse: {
      id: `vm-${Date.now()}`,
      jobid: `job-${Date.now()}`
    }
  };
}

export async function startVirtualMachine(): Promise<any> {
  return { startvirtualmachineresponse: { jobid: `job-${Date.now()}` } };
}

export async function stopVirtualMachine(): Promise<any> {
  return { stopvirtualmachineresponse: { jobid: `job-${Date.now()}` } };
}

export async function destroyVirtualMachine(): Promise<any> {
  return { destroyvirtualmachineresponse: { jobid: `job-${Date.now()}` } };
}
