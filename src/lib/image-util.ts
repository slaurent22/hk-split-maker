async function fetchAsArrayBuffer(imageUrl: string): Promise<ArrayBuffer> {
    const headers = new Headers({
        "Content-Type": "text/xml",
    });
    const response = await fetch(imageUrl, { headers, });
    if (!response.ok) {
        throw new Error(`ERROR ${response.status}: ${response.statusText}`);
    }
    return response.arrayBuffer();
}

// eslint-disable-next-line max-len
const LIVESPLIT_FORMAT_HEADER = "AAEAAAD/////AQAAAAAAAAAMAgAAAFFTeXN0ZW0uRHJhd2luZywgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWIwM2Y1ZjdmMTFkNTBhM2EFAQAAABVTeXN0ZW0uRHJhd2luZy5CaXRtYXABAAAABERhdGEHAgIAAAAJAwAAAA8DAAAAOw8A";

function prependByteSeparator(bytes: Uint8Array): Uint8Array {
    const byteArray = Array.from(bytes);
    byteArray.unshift(2);
    byteArray.unshift(0);
    return new Uint8Array(byteArray);
}

function toBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
}

export async function createLiveSplitIconData(imageUrl: string): Promise<string> {
    const imageBuffer = await fetchAsArrayBuffer(imageUrl);
    const imageBytes = prependByteSeparator(new Uint8Array(imageBuffer));
    const imageBase64 = toBase64(imageBytes);
    return `${LIVESPLIT_FORMAT_HEADER}${imageBase64}`;
}
