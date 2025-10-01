// Printer management utilities

export interface PrinterEndpoint {
  iface: USBInterface;
  endpointNumber: number;
}

export interface PrinterInfo {
  productName?: string;
  manufacturerName?: string;
  vendorId: number;
  productId: number;
  serialNumber?: string;
}

export class WebUSBPrinter {
  private device: USBDevice | null = null;

  // Get previously authorized devices
  async getDevices(): Promise<USBDevice[]> {
    if (!('usb' in navigator)) {
      throw new Error('WebUSB is not supported in this browser');
    }
    return await navigator.usb.getDevices();
  }

  // Request device from user
  async requestDevice(filters?: { vendorId?: number; productId?: number }[]): Promise<USBDevice> {
    if (!('usb' in navigator)) {
      throw new Error('WebUSB is not supported in this browser');
    }

    const deviceFilters = filters || [{}];
    this.device = await navigator.usb.requestDevice({
      filters: deviceFilters,
    });

    return this.device;
  }

  // Connect to a device
  async connect(device: USBDevice): Promise<void> {
    this.device = device;
  }

  // Find an OUT endpoint for printing
  findOutEndpoint(device: USBDevice): PrinterEndpoint | null {
    const config = device.configurations?.[0];
    if (!config) return null;

    for (const iface of config.interfaces) {
      for (const alt of iface.alternates) {
        const endpoint = alt.endpoints?.find((e) => e.direction === 'out');
        if (endpoint) {
          return {
            iface,
            endpointNumber: endpoint.endpointNumber,
          };
        }
      }
    }
    return null;
  }

  // Open device and claim interface
  async openAndClaim(device: USBDevice, interfaceNumber: number): Promise<void> {
    if (!device.opened) {
      await device.open();
    }

    // Select configuration if needed
    if (device.configuration?.configurationValue !== 1 && device.configurations?.[0]) {
      await device.selectConfiguration(1);
    }

    // Claim interface
    await device.claimInterface(interfaceNumber);
  }

  // Print raw bytes to the device
  async print(data: Uint8Array): Promise<{ success: boolean; bytesWritten?: number; error?: string }> {
    if (!this.device) {
      return { success: false, error: 'No device connected' };
    }

    const endpoint = this.findOutEndpoint(this.device);
    if (!endpoint) {
      return { success: false, error: 'No OUT endpoint found' };
    }

    try {
      await this.openAndClaim(this.device, endpoint.iface.interfaceNumber);

      // Some printers need a control transfer first
      try {
        await this.device.controlTransferOut(
          {
            requestType: 'class',
            recipient: 'interface',
            request: 0x22,
            value: 0x01,
            index: endpoint.iface.interfaceNumber,
          },
          new Uint8Array([])
        );
      } catch {
        // Ignore if not supported
      }

      const result = await this.device.transferOut(endpoint.endpointNumber, data as BufferSource);

      if (result.status === 'ok') {
        return { success: true, bytesWritten: result.bytesWritten };
      } else {
        return { success: false, error: `Transfer status: ${result.status}` };
      }
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, error: error?.message ?? String(err) };
    }
  }

  // Close connection
  async disconnect(): Promise<void> {
    if (this.device?.opened) {
      await this.device.close();
    }
    this.device = null;
  }

  // Get device info
  getDeviceInfo(): PrinterInfo | null {
    if (!this.device) return null;

    return {
      productName: this.device.productName,
      manufacturerName: this.device.manufacturerName,
      vendorId: this.device.vendorId,
      productId: this.device.productId,
      serialNumber: this.device.serialNumber,
    };
  }

  // Get current device
  getDevice(): USBDevice | null {
    return this.device;
  }
}
