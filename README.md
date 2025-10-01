# WebUSB POS Printer - Next.js 14

A modern Point of Sale (POS) printing application built with Next.js 14 and TypeScript that uses WebUSB to print directly to thermal receipt printers.

## Features

- 🖨️ **Direct USB Printing**: Print to thermal printers via WebUSB API
- 📝 **Receipt Builder**: Customize receipts with items, taxes, and payment methods
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⚡ **Next.js 14**: Built on the latest Next.js with App Router
- 🔒 **Type-Safe**: Full TypeScript support
- 🚀 **Vercel Ready**: Deploy to Vercel with one click

## Browser Requirements

WebUSB requires:
- **Chrome**, **Edge**, or **Opera** browser
- **HTTPS** connection (or localhost for development)

## ESC/POS Support

The app includes a full ESC/POS command builder with support for:
- Text formatting (bold, underline, size)
- Alignment (left, center, right)
- Barcodes (CODE39)
- QR codes
- Paper cutting
- Cash drawer opening

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome/Edge/Opera.

### Build

```bash
npm run build
npm start
```

## Usage

1. Click **"Pair USB Printer"** to connect your thermal printer
2. Customize your receipt in the Receipt Builder:
   - Set store name
   - Add/remove items
   - Set quantities and prices
   - Configure tax and payment method
3. Click **"Print Receipt"** to print
4. Use **"Print Test"** for a simple test print

## Deployment to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/next-print)

Or manually:

```bash
npm install -g vercel
vercel
```

**Important**: After deployment, access your app over HTTPS for WebUSB to work.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── PrinterControl.tsx  # Main printer component
├── lib/
│   ├── escpos.ts          # ESC/POS command builder
│   └── printer.ts         # WebUSB printer utilities
├── types/
│   └── webusb.d.ts        # WebUSB TypeScript definitions
└── vercel.json            # Vercel configuration
```

## Printer Compatibility

Works with most ESC/POS compatible thermal printers:
- Epson TM series
- Star Micronics
- Citizen
- Custom VKP series
- And many others

## Troubleshooting

### Printer not appearing
- Ensure printer is USB-connected and powered on
- Try unplugging and reconnecting the USB cable
- Check printer drivers aren't claiming the device

### Nothing prints
- Verify printer uses ESC/POS commands
- Check USB cable and power
- Try the "Print Test" button first
- Some printers need specific vendor IDs in the filter

### WebUSB not supported
- Use Chrome, Edge, or Opera
- Ensure you're on HTTPS (or localhost)
- Update your browser to the latest version

## License

MIT

## Credits

Built with guidance from:
- [WebUSB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/USB)
- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/)
