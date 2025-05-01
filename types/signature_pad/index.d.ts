import "signature_pad";

declare module "signature_pad" {
  interface Options {
    onBegin?: () => void;
    onEnd?: () => void;
    dotSize?: number;
    minWidth?: number;
    maxWidth?: number;
    penColor?: string;
    backgroundColor?: string;
  }
}
