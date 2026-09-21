import clipboardy from 'clipboardy';

export interface ClipboardProvider {
  write(text: string): Promise<void>;
}

const provider: ClipboardProvider = clipboardy;

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await provider.write(text);
    return true;
  } catch {
    return false;
  }
}
