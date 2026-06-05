"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export interface StoredVm {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  displayname: string;
  state: string;
  templatename: string;
  serviceofferingname: string;
  cpunumber: number;
  memory: number;
  zonename: string;
  created: string;
  updatedAt: string;
  ipaddress?: string;
  cloudstackVmId?: string;
  cloudstackJobId?: string;
  cloudstackResponse?: Record<string, unknown>;
}

export interface CreateVmInput {
  name: string;
  displayname?: string;
  state?: string;
  templatename?: string;
  serviceofferingname?: string;
  cpunumber?: number;
  memory?: number;
  zonename?: string;
  ipaddress?: string;
  cloudstackVmId?: string;
  cloudstackJobId?: string;
  cloudstackResponse?: Record<string, unknown>;
}

function vmCollection(userId: string) {
  return collection(firestore, "users", userId, "vms");
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as Partial<T>;
}

function fromDoc(
  userId: string,
  userEmail: string,
  id: string,
  data: Record<string, unknown>
): StoredVm {
  return {
    id,
    userId,
    userEmail,
    name: String(data.name ?? ""),
    displayname: String(data.displayname ?? data.name ?? ""),
    state: String(data.state ?? "Stopped"),
    templatename: String(data.templatename ?? ""),
    serviceofferingname: String(data.serviceofferingname ?? ""),
    cpunumber: Number(data.cpunumber ?? 0),
    memory: Number(data.memory ?? 0),
    zonename: String(data.zonename ?? ""),
    created: String(data.created ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    ipaddress: data.ipaddress ? String(data.ipaddress) : undefined,
    cloudstackVmId: data.cloudstackVmId ? String(data.cloudstackVmId) : undefined,
    cloudstackJobId: data.cloudstackJobId ? String(data.cloudstackJobId) : undefined,
    cloudstackResponse: data.cloudstackResponse as Record<string, unknown> | undefined,
  };
}

export async function listUserVms(userId: string, userEmail: string): Promise<StoredVm[]> {
  const snapshot = await getDocs(query(vmCollection(userId), orderBy("created", "desc")));
  return snapshot.docs.map((document) => fromDoc(userId, userEmail, document.id, document.data()));
}

export async function getUserVm(
  userId: string,
  userEmail: string,
  vmId: string
): Promise<StoredVm | null> {
  const snapshot = await getDoc(doc(firestore, "users", userId, "vms", vmId));
  if (!snapshot.exists()) return null;
  return fromDoc(userId, userEmail, snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createUserVm(
  userId: string,
  userEmail: string,
  input: CreateVmInput
): Promise<StoredVm> {
  const now = new Date().toISOString();
  const ref = doc(vmCollection(userId));
  const record = withoutUndefined({
    userId,
    userEmail,
    name: input.name,
    displayname: input.displayname || input.name,
    state: input.state || "Running",
    templatename: input.templatename || "",
    serviceofferingname: input.serviceofferingname || "",
    cpunumber: input.cpunumber || 0,
    memory: input.memory || 0,
    zonename: input.zonename || "",
    created: now,
    updatedAt: now,
    ipaddress: input.ipaddress,
    cloudstackVmId: input.cloudstackVmId,
    cloudstackJobId: input.cloudstackJobId,
    cloudstackResponse: input.cloudstackResponse,
  }) as Omit<StoredVm, "id">;

  await setDoc(ref, record);
  return { id: ref.id, ...record };
}

export async function updateUserVm(
  userId: string,
  userEmail: string,
  vmId: string,
  updates: Partial<CreateVmInput & { state: string }>
): Promise<StoredVm | null> {
  const ref = doc(firestore, "users", userId, "vms", vmId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;

  const next = withoutUndefined({
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  await setDoc(ref, next, { merge: true });
  const refreshed = await getDoc(ref);
  return fromDoc(userId, userEmail, refreshed.id, refreshed.data() as Record<string, unknown>);
}

export async function deleteUserVm(userId: string, vmId: string): Promise<boolean> {
  const ref = doc(firestore, "users", userId, "vms", vmId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return false;
  await deleteDoc(ref);
  return true;
}
