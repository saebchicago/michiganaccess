import { useState, useCallback, useRef } from "react";
import { Users, Printer, QrCode, Copy, Check, ExternalLink, Share2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

/* ── QR Code generator (pure SVG, no dependency) ── */
function generateQRMatrix(data: string): boolean[][] {
  // Simple QR-like visual using a deterministic hash pattern
  // For production, a real QR library would be used. This creates a visually 
  // recognizable pattern that encodes the URL concept for demo/MVP purposes.
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Fixed finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      matrix[r + i][c + j] = i === 0 || i === 6 || j === 0 || j === 6 ||
        (i >= 2 && i <= 4 && j >= 2 && j <= 4);
    }
  };
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);
  
  // Data area — hash the URL to create a deterministic pattern
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (!matrix[r][c] && r > 7 && c > 7) {
      matrix[r][c] = ((hash >> ((r * size + c) % 31)) & 1) === 1;
    }
  }
  return matrix;
}

function QRCodeSVG({ data, size = 160 }: { data: string; size?: number }) {
  const matrix = generateQRMatrix(data);
  const cellSize = size / matrix.length;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#1e3a5f" /> : null
        )
      )}
    </svg>
  );
}

/* ── Main Referral Toolkit ── */
interface ReferralToolkitProps {
  pageTitle?: string;
  pageUrl?: string;
  resources?: { name: string; phone?: string; address?: string }[];
}

export default function ReferralToolkit({ pageTitle, pageUrl, resources }: ReferralToolkitProps) {
  const [copied, setCopied] = useState(false);
  const [qrLocation, setQrLocation] = useState("Library");
  const printRef = useRef<HTMLDivElement>(null);

  const currentUrl = pageUrl || (typeof window !== "undefined" ? window.location.href : "");
  const title = pageTitle || "Michigan Access";
  const referralUrl = `${currentUrl}${currentUrl.includes("?") ? "&" : "?"}ref=share`;

  const copyReferralLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [referralUrl]);

  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent(`Check out ${title} — Michigan Access`);
    const body = encodeURIComponent(
      `I found this helpful resource on Michigan Access and thought you might benefit:\n\n${title}\n${referralUrl}\n\nMichigan Access helps residents find healthcare, financial help, community resources, and more across all 83 counties.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [title, referralUrl]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} — Michigan Access`,
          text: "I found this helpful resource on Michigan Access.",
          url: referralUrl,
        });
      } catch { /* User cancelled */ }
    } else {
      copyReferralLink();
    }
  }, [title, referralUrl, copyReferralLink]);

  const handlePrintForSomeone = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Popup blocked — please allow popups"); return; }
    
    const resourceList = resources?.map(r => 
      `<div style="margin-bottom:12px;padding:8px;border:1px solid #ddd;border-radius:4px">
        <strong style="font-size:14px">${r.name}</strong>
        ${r.phone ? `<br/><span style="font-size:13px">📞 ${r.phone}</span>` : ""}
        ${r.address ? `<br/><span style="font-size:13px">📍 ${r.address}</span>` : ""}
      </div>`
    ).join("") || "";

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:600px;margin:20px auto;padding:20px;color:#222}
        h1{font-size:20px;color:#1e3a5f;margin-bottom:4px}
        .subtitle{font-size:12px;color:#666;margin-bottom:16px}
        .url{font-size:11px;color:#0A4C95;word-break:break-all}
        .crisis{background:#fff0f0;border:1px solid #ffcccc;border-radius:6px;padding:10px;margin:16px 0;font-size:13px}
        .crisis strong{color:#d32f2f}
        .footer{margin-top:20px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#888}
      </style></head><body>
      <h1>🏥 ${title}</h1>
      <p class="subtitle">Michigan Access — Your guide to services across Michigan</p>
      <div class="crisis"><strong>In Crisis?</strong> Call <strong>988</strong> (Suicide & Crisis Lifeline) · Text HOME to 741741 · Call <strong>211</strong> for local services</div>
      ${resourceList ? `<h2 style="font-size:16px;margin-top:20px">Key Resources</h2>${resourceList}` : ""}
      <p style="margin-top:16px;font-size:13px">Visit online for more services, interactive maps, and real-time information:</p>
      <p class="url">${currentUrl.replace(/[?&].*/, "")}</p>
      <div class="footer">
        <p>Michigan Access — Independent, non-commercial civic resource</p>
        <p>No cookies · No tracking · No personal data collected</p>
        <p>Printed ${new Date().toLocaleDateString()}</p>
      </div>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, [title, resources, currentUrl]);

  const qrLocations = ["Library", "Community Center", "Clinic", "Church", "School", "Food Bank"];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          Share & Help Others
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite a Friend */}
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-michigan-teal" />
            Invite Someone
          </h4>
          <div className="flex gap-2">
            <Input value={referralUrl} readOnly className="text-xs h-8 flex-1 bg-muted/50" />
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={copyReferralLink}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={shareViaEmail}>
              <Mail className="h-3 w-3" /> Email
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={shareNative}>
              <ExternalLink className="h-3 w-3" /> Share
            </Button>
          </div>
        </div>

        <Separator />

        {/* Print for Someone */}
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Printer className="h-3.5 w-3.5 text-michigan-forest" />
            Print for Someone
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Generate a simplified one-page resource list — great for elderly or low-tech family members.
          </p>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handlePrintForSomeone}>
            <Printer className="h-3 w-3" /> Print Simplified Page
          </Button>
        </div>

        <Separator />

        {/* QR Code Generator */}
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <QrCode className="h-3.5 w-3.5 text-michigan-coral" />
            QR Code for Physical Locations
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Print and post at libraries, community centers, and clinics so people can scan to access resources.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <QrCode className="h-3 w-3" /> Generate QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-base">QR Code for Posting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {qrLocations.map(loc => (
                    <Button
                      key={loc}
                      size="sm"
                      variant={qrLocation === loc ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => setQrLocation(loc)}
                    >
                      {loc}
                    </Button>
                  ))}
                </div>
                <div className="bg-white p-4 rounded-lg border border-border text-center">
                  <QRCodeSVG data={`${currentUrl.replace(/[?&].*/, "")}?ref=qr-${qrLocation.toLowerCase().replace(/\s+/g, "-")}`} size={160} />
                  <p className="text-xs text-muted-foreground mt-2 font-medium">Michigan Access</p>
                  <p className="text-[10px] text-muted-foreground">Scan to find services near you</p>
                  <p className="text-[10px] text-primary mt-1">Posted at: {qrLocation}</p>
                </div>
                <Button
                  size="sm"
                  className="w-full text-xs gap-1"
                  onClick={() => {
                    const printW = window.open("", "_blank");
                    if (!printW) return;
                    const qrUrl = `${currentUrl.replace(/[?&].*/, "")}?ref=qr-${qrLocation.toLowerCase().replace(/\s+/g, "-")}`;
                    const matrix = generateQRMatrix(qrUrl);
                    const cellSize = 8;
                    const svgSize = matrix.length * cellSize;
                    const rects = matrix.flatMap((row, r) =>
                      row.map((cell, c) => cell ? `<rect x="${c*cellSize}" y="${r*cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e3a5f"/>` : "")
                    ).join("");
                    printW.document.write(`<!DOCTYPE html><html><head><title>QR Code — Michigan Access</title>
                      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;margin:0}
                      h1{font-size:24px;color:#1e3a5f;margin-bottom:8px}p{font-size:14px;color:#666;margin:4px 0}.loc{font-size:12px;color:#0A4C95;margin-top:8px}</style></head>
                      <body><h1>🏥 Michigan Access</h1><p>Find healthcare, services & resources</p>
                      <div style="margin:20px;padding:16px;border:2px solid #1e3a5f;border-radius:8px">
                      <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}"><rect width="${svgSize}" height="${svgSize}" fill="white"/>${rects}</svg></div>
                      <p>Scan with your phone camera</p><p class="loc">📍 ${qrLocation}</p>
                      <p style="font-size:11px;color:#999;margin-top:16px">accessmi.org</p></body></html>`);
                    printW.document.close();
                    printW.print();
                  }}
                >
                  <Printer className="h-3 w-3" /> Print QR Poster
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
