import {sha1} from 'js-sha1';

const SHA1_KEY = 'bae4Cu4dN9xhszr+2plcfud55Q+RhH1+VN5qSwFN';

export function hmac(password: string) {
    return sha1.hmac(SHA1_KEY, password);
}
