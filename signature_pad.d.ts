import "signature_pad";

declare module "signature_pad" {
  interface SignaturePadOptions {
    onBegin?: () => void;
    onEnd?: () => void;
  }
}
