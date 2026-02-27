import storage from '@/utils/storage.ts'
import getDeviceId from '@/utils/fp.ts'

interface IResult {
    access_granted: boolean
    access_requested: boolean
    device_id?: string | null
    available: boolean
    token_saved?: boolean
    type?: string
}

export async function initBiometrics() {
    let result: IResult = {
        access_granted: false,
        access_requested: false,
        device_id: null,
        available: false,
        token_saved: false,
        type: 'unknown'
    };

    if (!window.PublicKeyCredential) return result;

    result.access_requested = storage.get('bm_allowed');
    try {
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        result.available = isAvailable;
        if (isAvailable) {
            result.access_granted = storage.get('bm_allowed');
            result.device_id = await getDeviceId();
            result.type = 'fingerprint';
            result.token_saved = storage.get('bm_token') ? true : false;
            if (navigator.userAgent.toLowerCase().includes('face')) result.type = 'face';
        }
    } catch (e) {}

    return result;
}

export async function authenticate(rs: string = '') {
    try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: rs },
    user: {
        id: userId,
        name: "user@example.com",
        displayName: "Example User"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" as const }],
    authenticatorSelection: {
        authenticatorAttachment: "platform" as AuthenticatorAttachment
    },
    timeout: 60000
  };

   return await navigator.credentials.create({ publicKey });
    } catch(err: any) {
        console.log(err);
        return false;
    }
}