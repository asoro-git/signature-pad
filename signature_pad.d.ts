import "signature_pad";

declare module "signature_pad" {
  interface Options {
    onBegin?: () => void;
    onEnd?: () => void;
  }
}
