
"use client";

import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Loader2 } from 'lucide-react';

export function QRPosterDialog({ cafe }: { cafe: any }) {
    const ref = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!ref.current) return;
        setDownloading(true);
        try {
            const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `${cafe.slug}-poster.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
        } finally {
            setDownloading(false);
        }
    };

    // Construct URL based on current origin if possible, or fallback
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const menuUrl = `${origin}/menu/${cafe.slug}`;

    const displayImage = cafe.logoUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2 w-full sm:w-auto">
                    <Download className="w-4 h-4" />
                    Designed Poster
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col items-center gap-6">
                    <h3 className="text-lg font-semibold">Poster Preview</h3>
                    <div className="shadow-2xl overflow-hidden relative bg-[#FFF3E0] w-[350px] h-[520px] flex flex-col items-center text-center select-none" ref={ref}>

                        {/* Background Shapes */}
                        <svg className="absolute top-0 left-0 w-48 h-48 text-[#FFCC80]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.3,-46.7C90.8,-34.3,96.9,-19.6,95.8,-5.2C94.7,9.2,86.3,23.3,76.6,35.6C66.9,48,55.9,58.6,43.3,66.3C30.7,74,16.5,78.8,2.1,75.1C-12.3,71.4,-26.9,59.3,-39.8,49.1C-52.7,39,-63.9,30.8,-70.6,19.6C-77.3,8.4,-79.5,-5.8,-75.4,-18.6C-71.3,-31.4,-60.9,-42.8,-49.2,-50.7C-37.5,-58.6,-24.5,-63,-11.5,-65C1.5,-67,14.5,-66.6,30.5,-76.4Z" transform="translate(100 100) scale(1.1)" />
                        </svg>
                        <svg className="absolute bottom-0 right-0 w-56 h-56 text-[#FFCC80]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path fill="currentColor" d="M41.5,-68.8C54,-64.4,64.7,-55.8,73.1,-45.3C81.5,-34.8,87.6,-22.4,87.8,-9.9C88,2.7,82.3,15.4,74.5,26.4C66.7,37.4,56.8,46.7,46.1,55.1C35.4,63.5,23.9,71,11.5,73.4C-0.9,75.8,-14.2,73.1,-26.1,67.6C-38,62.1,-48.5,53.8,-57.4,43.6C-66.3,33.4,-73.6,21.3,-75.4,8.4C-77.2,-4.5,-73.6,-18.2,-66.1,-29.8C-58.6,-41.4,-47.2,-50.9,-35.5,-55.8C-23.8,-60.7,-11.9,-61,0.7,-62.2C13.3,-63.4,26.6,-65.4,41.5,-68.8Z" transform="translate(100 100)" />
                        </svg>

                        {/* Image */}
                        <div className="relative z-10 w-40 h-40 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white mt-8 mb-4">
                            <img src={displayImage} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        </div>

                        {/* Title */}
                        <div className="relative z-10 space-y-1 mb-6">
                            <h2 className="text-4xl font-extrabold uppercase text-gray-900 tracking-tighter leading-none">DELICIOUS</h2>
                            <h2 className="text-4xl font-extrabold uppercase text-white tracking-widest leading-none border-4 border-black bg-black px-3 py-1 transform -rotate-2 inline-block">FOOD</h2>
                        </div>

                        {/* QR */}
                        <div className="relative z-10 bg-white p-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] mb-4">
                            <QRCodeSVG value={menuUrl} size={140} />
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 mt-auto pb-8 w-full px-6">
                            <p className="font-bold text-xs tracking-[0.2em] text-gray-800 mb-2 uppercase">Scan to view menu</p>
                            <div className="w-full h-[2px] bg-black/10 mx-auto mb-2"></div>
                            <p className="font-serif font-bold text-xl text-black">{cafe.name}</p>
                        </div>
                    </div>

                    <Button onClick={handleDownload} disabled={downloading} className="w-full">
                        {downloading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                        Download Poster
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
