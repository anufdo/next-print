// ESC/POS command builder utilities

export const ESC = 0x1b;
export const GS = 0x1d;
export const LF = 0x0a;

export enum TextAlign {
  LEFT = 0x00,
  CENTER = 0x01,
  RIGHT = 0x02,
}

export enum TextSize {
  NORMAL = 0x00,
  DOUBLE_HEIGHT = 0x10,
  DOUBLE_WIDTH = 0x20,
  DOUBLE_BOTH = 0x30,
}

export enum CutType {
  FULL = 0x00,
  PARTIAL = 0x01,
}

export class ESCPOSBuilder {
  private data: number[] = [];

  constructor() {
    this.initialize();
  }

  // Initialize printer
  initialize(): this {
    this.data.push(ESC, 0x40);
    return this;
  }

  // Set text alignment
  align(alignment: TextAlign): this {
    this.data.push(ESC, 0x61, alignment);
    return this;
  }

  // Set text size and style
  textSize(size: TextSize): this {
    this.data.push(ESC, 0x21, size);
    return this;
  }

  // Bold text
  bold(enabled: boolean = true): this {
    this.data.push(ESC, 0x45, enabled ? 0x01 : 0x00);
    return this;
  }

  // Underline text
  underline(mode: 0 | 1 | 2 = 1): this {
    this.data.push(ESC, 0x2d, mode);
    return this;
  }

  // Add text
  text(text: string): this {
    const encoded = new TextEncoder().encode(text);
    this.data.push(...Array.from(encoded));
    return this;
  }

  // Add line of text (with newline)
  line(text: string = ''): this {
    this.text(text);
    this.data.push(LF);
    return this;
  }

  // Feed lines
  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.data.push(LF);
    }
    return this;
  }

  // Draw horizontal line
  drawLine(char: string = '-', length: number = 32): this {
    this.line(char.repeat(length));
    return this;
  }

  // Print barcode (CODE39)
  barcode(data: string, height: number = 50): this {
    // Set barcode height
    this.data.push(GS, 0x68, height);
    // Set barcode width
    this.data.push(GS, 0x77, 0x02);
    // Print barcode (CODE39)
    this.data.push(GS, 0x6b, 0x04);
    const encoded = new TextEncoder().encode(data);
    this.data.push(...Array.from(encoded));
    this.data.push(0x00); // Null terminator
    return this;
  }

  // Print QR code
  qrCode(data: string, size: number = 6): this {
    const qrData = new TextEncoder().encode(data);
    const len = qrData.length;
    const pL = len % 256;
    const pH = Math.floor(len / 256);

    // Model (QR Code)
    this.data.push(GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    // Size
    this.data.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size);
    // Error correction (L)
    this.data.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30);
    // Store data
    this.data.push(GS, 0x28, 0x6b, pL + 3, pH, 0x31, 0x50, 0x30);
    this.data.push(...Array.from(qrData));
    // Print
    this.data.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
    return this;
  }

  // Open cash drawer
  openDrawer(): this {
    this.data.push(ESC, 0x70, 0x00, 0x32, 0xff);
    return this;
  }

  // Cut paper
  cut(type: CutType = CutType.FULL): this {
    this.data.push(GS, 0x56, type);
    return this;
  }

  // Get built bytes
  build(): Uint8Array {
    return new Uint8Array(this.data);
  }

  // Reset builder
  reset(): this {
    this.data = [];
    this.initialize();
    return this;
  }
}

// Receipt item interface
export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

// Build a sample receipt
export function buildReceipt(
  storeName: string,
  items: ReceiptItem[],
  tax: number = 0,
  payment: string = 'CASH'
): Uint8Array {
  const builder = new ESCPOSBuilder();

  // Header
  builder
    .align(TextAlign.CENTER)
    .textSize(TextSize.DOUBLE_BOTH)
    .bold(true)
    .line(storeName)
    .bold(false)
    .textSize(TextSize.NORMAL)
    .line(new Date().toLocaleString())
    .feed(1)
    .drawLine('=', 32)
    .align(TextAlign.LEFT);

  // Items
  let subtotal = 0;
  items.forEach((item) => {
    const total = item.quantity * item.price;
    subtotal += total;
    const itemLine = `${item.name.padEnd(18)} ${item.quantity}x ${item.price.toFixed(2)}`;
    builder.line(itemLine);
    builder.align(TextAlign.RIGHT).line(`$${total.toFixed(2)}`).align(TextAlign.LEFT);
  });

  // Totals
  builder
    .drawLine('-', 32)
    .align(TextAlign.RIGHT)
    .line(`Subtotal: $${subtotal.toFixed(2)}`);

  if (tax > 0) {
    builder.line(`Tax: $${tax.toFixed(2)}`);
  }

  const grandTotal = subtotal + tax;
  builder
    .textSize(TextSize.DOUBLE_HEIGHT)
    .bold(true)
    .line(`TOTAL: $${grandTotal.toFixed(2)}`)
    .textSize(TextSize.NORMAL)
    .bold(false)
    .line(`Payment: ${payment}`)
    .drawLine('=', 32);

  // Footer
  builder
    .align(TextAlign.CENTER)
    .feed(1)
    .line('Thank you for your business!')
    .line('Visit us again soon')
    .feed(3)
    .cut();

  return builder.build();
}
