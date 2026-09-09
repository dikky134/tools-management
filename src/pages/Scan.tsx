import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { StatusBadge, Btn } from '../components/ui';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scan() {
  const { tools, categories } = useApp();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState('');

  const availableForScan = tools.filter(t => {
    if (!q) return true;
    return t.code.toLowerCase().includes(q.toLowerCase()) || t.name.toLowerCase().includes(q.toLowerCase());
  });

  const handleScan = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) { setError('Tool not found.'); return; }
    if (tool.status === 'INACTIVE') { setError('This tool is inactive and cannot be used.'); return; }
    navigate(`/tools/${toolId}`);
  };

  const handleManualCode = () => {
    const scannedValue = q.trim();

    const code = scannedValue.startsWith('TOOLMAN:')
      ? scannedValue
          .substring('TOOLMAN:'.length)
          .trim()
      : scannedValue;

    const tool = tools.find(
      t =>
        t.code.toLowerCase() ===
        code.toLowerCase(),
    );

    if (!tool) {
      setError(
        `No tool found with code "${code}".`,
      );
      return;
    }

    if (tool.status === 'INACTIVE') {
      setError(
        'This tool is inactive and cannot be used.',
      );
      return;
    }

    navigate(`/tools/${tool.id}`);
  };

  const STATUS_ICONS: Record<string, string> = {
    AVAILABLE: '🟢', BORROWED: '🔵', DAMAGED: '🔴', MAINTENANCE: '🟠', INACTIVE: '⚫',
  };
  
  const startScanner = () => {
    setError('');
    setCameraError('');
    setScanning(true);
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();

        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }

        scannerRef.current = null;
      }
    } catch (error) {
      console.error(
        'Failed to stop scanner:',
        error,
      );
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if (!scanning) {
      return;
    }

    let cancelled = false;
    const scanner = new Html5Qrcode('qr-reader');

    scannerRef.current = scanner;

    const startCamera = async () => {
      try {
        await scanner.start(
          {
            facingMode: 'environment',
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async decodedText => {
            if (cancelled) {
              return;
            }

            console.log(
              'QR detected:',
              decodedText,
            );

            try {
              await scanner.stop();
            } catch (error) {
              console.warn(
                'Scanner already stopped:',
                error,
              );
            }

            try {
              scanner.clear();
            } catch (error) {
              console.warn(
                'Scanner clear skipped:',
                error,
              );
            }

            scannerRef.current = null;

            const scannedValue =
              decodedText.trim();

            const scannedCode =
              scannedValue.startsWith('TOOLMAN:')
                ? scannedValue
                    .substring('TOOLMAN:'.length)
                    .trim()
                : scannedValue;

            const tool = tools.find(
              t =>
                t.code.toLowerCase() ===
                scannedCode.toLowerCase(),
            );

            setScanning(false);

            if (!tool) {
              setError(
                `No tool found with code "${scannedCode}".`,
              );
              return;
            }

            if (tool.status === 'INACTIVE') {
              setError(
                'This tool is inactive and cannot be used.',
              );
              return;
            }

            navigate(`/tools/${tool.id}`);
          },
          () => {
            // QR belum terbaca
          },
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          'Failed to start QR scanner:',
          error,
        );

        setCameraError(
          'Unable to access camera. Please allow camera permission.',
        );

        scannerRef.current = null;
        setScanning(false);
      }
    };

    // Tunggu sampai <div id="qr-reader"> benar-benar
    // selesai dirender oleh React.
    const timer = window.setTimeout(() => {
      void startCamera();
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);

      const scanner = scannerRef.current;

      if (!scanner) {
        return;
      }

      scannerRef.current = null;

      void scanner
        .stop()
        .catch(() => {
          // Scanner mungkin sudah berhenti
        })
        .finally(() => {
          try {
            scanner.clear();
          } catch {
            // Ignore clear error
          }
        });
    };
  }, [scanning, tools, navigate]);

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display text-zinc-100">Scan QR Code</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Scan a tool's QR code or select from list below</p>
      </div>

      {/* Real QR Scanner */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
        {!scanning ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">

            <div className="w-24 h-24 border-2 border-amber-500/30 rounded-sm flex items-center justify-center">
              <svg
                className="w-10 h-10 text-zinc-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-sm text-zinc-400 font-medium">
                QR Code Scanner
              </p>

              <p className="text-xs text-zinc-600 mt-1">
                Use your camera to scan a tool QR code
              </p>
            </div>

            <Btn onClick={startScanner}>
              Open Camera
            </Btn>

          </div>
        ) : (
          <div className="p-4">

            <div
              id="qr-reader"
              className="w-full overflow-hidden rounded-sm"
            />

            <p className="text-xs text-zinc-500 text-center mt-3 font-mono">
              Point your camera at the tool QR code
            </p>

            <div className="mt-4">
              <Btn
                variant="secondary"
                className="w-full"
                onClick={() => void stopScanner()}
              >
                Stop Camera
              </Btn>
            </div>

          </div>
        )}
      </div>
      {cameraError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2 text-xs text-red-400 font-mono">
          ⚠ {cameraError}
        </div>
      )}

      {/* Manual code entry */}
      <div className="flex gap-2">
        <input value={q} onChange={e => { setQ(e.target.value); setError(''); }}
          placeholder="Enter tool code (e.g. ALT-001)"
          onKeyDown={e => e.key === 'Enter' && handleManualCode()}
          className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-sm px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors font-mono" />
        <Btn onClick={handleManualCode} variant="secondary">Look Up</Btn>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2 text-xs text-red-400 font-mono">
          ⚠ {error}
        </div>
      )}

      {/* Tool list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <div className="px-4 py-3 border-b border-zinc-800">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Available Tools — Tap to Simulate Scan</p>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {availableForScan.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            return (
              <button key={t.id} onClick={() => handleScan(t.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors text-left">
                <div className="w-8 h-8 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm flex-shrink-0">
                  {STATUS_ICONS[t.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{t.name}</p>
                  <p className="text-[10px] font-mono text-zinc-600">{t.code} · {cat?.name}</p>
                </div>
                <StatusBadge status={t.status} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
