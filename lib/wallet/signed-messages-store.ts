// Shared storage for signed messages
export interface SignMessageHistoryItem {
  message: string;
  signer: string;
  domainUrl: string;
  signature: string;
  sessionId: string | null;
  createdAt: string;
}

// In-memory storage for signed messages until we implement proper persistent storage
export const signedMessagesStore: Record<string, SignMessageHistoryItem[]> = {};

// Helper functions for managing signed messages
export function addSignedMessage(address: string, message: SignMessageHistoryItem): void {
  const normalizedAddress = address.toLowerCase();
  if (!signedMessagesStore[normalizedAddress]) {
    signedMessagesStore[normalizedAddress] = [];
  }
  signedMessagesStore[normalizedAddress].push(message);
}

export function getSignedMessages(address: string): SignMessageHistoryItem[] {
  const normalizedAddress = address.toLowerCase();
  return signedMessagesStore[normalizedAddress] || [];
}

export function getSignedMessagesSorted(address: string): SignMessageHistoryItem[] {
  return getSignedMessages(address).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function clearSignedMessages(address: string): void {
  const normalizedAddress = address.toLowerCase();
  signedMessagesStore[normalizedAddress] = [];
} 