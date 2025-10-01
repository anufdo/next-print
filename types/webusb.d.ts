// WebUSB API type declarations
declare global {
  interface Navigator {
    usb: USB;
  }

  interface USB extends EventTarget {
    getDevices(): Promise<USBDevice[]>;
    requestDevice(options?: USBDeviceRequestOptions): Promise<USBDevice>;
    addEventListener(
      type: 'connect' | 'disconnect',
      listener: (this: this, ev: USBConnectionEvent) => void
    ): void;
  }

  interface USBDeviceRequestOptions {
    filters: USBDeviceFilter[];
  }

  interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
    serialNumber?: string;
  }

  interface USBDevice {
    usbVersionMajor: number;
    usbVersionMinor: number;
    usbVersionSubminor: number;
    deviceClass: number;
    deviceSubclass: number;
    deviceProtocol: number;
    vendorId: number;
    productId: number;
    deviceVersionMajor: number;
    deviceVersionMinor: number;
    deviceVersionSubminor: number;
    manufacturerName?: string;
    productName?: string;
    serialNumber?: string;
    configuration?: USBConfiguration;
    configurations: USBConfiguration[];
    opened: boolean;
    open(): Promise<void>;
    close(): Promise<void>;
    selectConfiguration(configurationValue: number): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
    releaseInterface(interfaceNumber: number): Promise<void>;
    selectAlternateInterface(
      interfaceNumber: number,
      alternateSetting: number
    ): Promise<void>;
    controlTransferIn(
      setup: USBControlTransferParameters,
      length: number
    ): Promise<USBInTransferResult>;
    controlTransferOut(
      setup: USBControlTransferParameters,
      data?: BufferSource
    ): Promise<USBOutTransferResult>;
    clearHalt(direction: 'in' | 'out', endpointNumber: number): Promise<void>;
    transferIn(
      endpointNumber: number,
      length: number
    ): Promise<USBInTransferResult>;
    transferOut(
      endpointNumber: number,
      data: BufferSource
    ): Promise<USBOutTransferResult>;
    isochronousTransferIn(
      endpointNumber: number,
      packetLengths: number[]
    ): Promise<USBIsochronousInTransferResult>;
    isochronousTransferOut(
      endpointNumber: number,
      data: BufferSource,
      packetLengths: number[]
    ): Promise<USBIsochronousOutTransferResult>;
    reset(): Promise<void>;
  }

  interface USBControlTransferParameters {
    requestType: 'standard' | 'class' | 'vendor';
    recipient: 'device' | 'interface' | 'endpoint' | 'other';
    request: number;
    value: number;
    index: number;
  }

  interface USBInTransferResult {
    data?: DataView;
    status: 'ok' | 'stall' | 'babble';
  }

  interface USBOutTransferResult {
    bytesWritten: number;
    status: 'ok' | 'stall';
  }

  interface USBIsochronousInTransferResult {
    data?: DataView;
    packets: USBIsochronousInTransferPacket[];
  }

  interface USBIsochronousInTransferPacket {
    data?: DataView;
    status: 'ok' | 'stall' | 'babble';
  }

  interface USBIsochronousOutTransferResult {
    packets: USBIsochronousOutTransferPacket[];
  }

  interface USBIsochronousOutTransferPacket {
    bytesWritten: number;
    status: 'ok' | 'stall';
  }

  interface USBConfiguration {
    configurationValue: number;
    configurationName?: string;
    interfaces: USBInterface[];
  }

  interface USBInterface {
    interfaceNumber: number;
    alternate: USBAlternateInterface;
    alternates: USBAlternateInterface[];
    claimed: boolean;
  }

  interface USBAlternateInterface {
    alternateSetting: number;
    interfaceClass: number;
    interfaceSubclass: number;
    interfaceProtocol: number;
    interfaceName?: string;
    endpoints: USBEndpoint[];
  }

  interface USBEndpoint {
    endpointNumber: number;
    direction: 'in' | 'out';
    type: 'bulk' | 'interrupt' | 'isochronous';
    packetSize: number;
  }

  interface USBConnectionEvent extends Event {
    device: USBDevice;
  }
}

export {};
