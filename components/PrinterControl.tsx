'use client';

import { useState, useEffect } from 'react';
import { WebUSBPrinter, PrinterInfo } from '@/lib/printer';
import { buildReceipt, ReceiptItem, ESCPOSBuilder, TextAlign, TextSize } from '@/lib/escpos';

export default function PrinterControl() {
  const [printer] = useState(() => new WebUSBPrinter());
  const [device, setDevice] = useState<USBDevice | null>(null);
  const [printerInfo, setPrinterInfo] = useState<PrinterInfo | null>(null);
  const [status, setStatus] = useState<string>('Ready');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Receipt state
  const [storeName, setStoreName] = useState<string>('My Store');
  const [items, setItems] = useState<ReceiptItem[]>([
    { name: 'Item 1', quantity: 2, price: 10.99 },
    { name: 'Item 2', quantity: 1, price: 25.50 },
  ]);
  const [tax, setTax] = useState<number>(2.50);
  const [payment, setPayment] = useState<string>('CASH');

  // Check WebUSB support
  useEffect(() => {
    if (!('usb' in navigator)) {
      setIsSupported(false);
      setStatus('WebUSB not supported in this browser');
    } else {
      // Try to reconnect to previously paired devices
      (async () => {
        try {
          const devices = await printer.getDevices();
          if (devices?.[0]) {
            await printer.connect(devices[0]);
            setDevice(devices[0]);
            setPrinterInfo(printer.getDeviceInfo());
            setStatus('Connected to saved device');
          }
        } catch {
          // Ignore errors
        }
      })();
    }
  }, [printer]);

  // Request device pairing
  async function handlePairDevice() {
    try {
      setStatus('Requesting device...');
      const selected = await printer.requestDevice();
      await printer.connect(selected);
      setDevice(selected);
      setPrinterInfo(printer.getDeviceInfo());
      setStatus(`Paired: ${selected.productName ?? 'USB Printer'}`);
    } catch (err: unknown) {
      const error = err as Error;
      setStatus(`Error: ${error?.message ?? 'User cancelled or no device'}`);
    }
  }

  // Print test receipt
  async function handlePrintReceipt() {
    if (!device) {
      setStatus('No device connected');
      return;
    }

    try {
      setStatus('Printing receipt...');
      const receiptData = buildReceipt(storeName, items, tax, payment);
      const result = await printer.print(receiptData);

      if (result.success) {
        setStatus(`✓ Printed ${result.bytesWritten} bytes`);
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus(`Error: ${error?.message ?? String(err)}`);
    }
  }

  // Print simple text
  async function handlePrintText() {
    if (!device) {
      setStatus('No device connected');
      return;
    }

    try {
      setStatus('Printing text...');
      const builder = new ESCPOSBuilder();
      builder
        .align(TextAlign.CENTER)
        .textSize(TextSize.DOUBLE_BOTH)
        .line('Hello, World!')
        .textSize(TextSize.NORMAL)
        .feed(2)
        .line('WebUSB Printing Test')
        .line(new Date().toLocaleString())
        .feed(3)
        .cut();

      const result = await printer.print(builder.build());

      if (result.success) {
        setStatus(`✓ Printed ${result.bytesWritten} bytes`);
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus(`Error: ${error?.message ?? String(err)}`);
    }
  }

  // Add item
  function handleAddItem() {
    setItems([...items, { name: `Item ${items.length + 1}`, quantity: 1, price: 0 }]);
  }

  // Remove item
  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  // Update item
  function handleUpdateItem(index: number, field: keyof ReceiptItem, value: string | number) {
    const newItems = [...items];
    if (field === 'name') {
      newItems[index][field] = value as string;
    } else {
      newItems[index][field] = Number(value);
    }
    setItems(newItems);
  }

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">WebUSB Not Supported</h2>
          <p className="text-red-700">
            Your browser doesn't support WebUSB. Please use Chrome, Edge, or Opera over HTTPS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-2">WebUSB POS Printer</h1>
        <p className="text-gray-600 mb-4">
          Print receipts directly to thermal printers using WebUSB
        </p>

        {/* Printer Controls */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handlePairDevice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Pair USB Printer
          </button>
          <button
            onClick={handlePrintText}
            disabled={!device}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Print Test
          </button>
          <button
            onClick={handlePrintReceipt}
            disabled={!device}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Print Receipt
          </button>
        </div>

        {/* Status */}
        <div className="bg-gray-100 rounded-lg p-3 mb-4">
          <span className="text-sm font-medium">Status: </span>
          <span className="text-sm">{status}</span>
        </div>

        {/* Printer Info */}
        {printerInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Printer Info</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(printerInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Receipt Builder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Receipt Builder</h2>

        {/* Store Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Items</label>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                  placeholder="Item name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                  placeholder="Qty"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleUpdateItem(index, 'price', e.target.value)}
                  placeholder="Price"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tax & Payment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tax</label>
            <input
              type="number"
              step="0.01"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CASH">Cash</option>
              <option value="CREDIT CARD">Credit Card</option>
              <option value="DEBIT CARD">Debit Card</option>
              <option value="MOBILE">Mobile Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Usage Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Click "Pair USB Printer" to connect your thermal printer</li>
          <li>Use Chrome, Edge, or Opera browser over HTTPS or localhost</li>
          <li>Customize your receipt and click "Print Receipt" to print</li>
          <li>Click "Print Test" for a simple test print</li>
        </ul>
      </div>
    </div>
  );
}
