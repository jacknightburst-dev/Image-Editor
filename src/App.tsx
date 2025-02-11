import React, { useState, useRef, useCallback } from 'react';
import { Upload, Sliders, Download, Image as ImageIcon, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = `brightness(${adjustments.brightness}%) 
                    contrast(${adjustments.contrast}%) 
                    saturate(${adjustments.saturation}%)
                    blur(${adjustments.blur}px)`;

      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
      ctx.drawImage(img, -img.width/2, -img.height/2);
      ctx.restore();
    };
  }, [image, adjustments, rotation, flip]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleAdjustment = (name: keyof Adjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            Image Editor
          </h1>

          {!image ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-600">Click to upload an image or drag and drop</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 overflow-auto">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border rounded-lg shadow-sm"
                />
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Adjustments
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(adjustments).map(([name, value]) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {name} ({value}{name === 'blur' ? 'px' : '%'})
                        </label>
                        <input
                          type="range"
                          min={name === 'blur' ? 0 : 0}
                          max={name === 'blur' ? 20 : 200}
                          value={value}
                          onChange={(e) => handleAdjustment(name as keyof Adjustments, Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Transform</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRotation(r => (r + 90) % 360)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
                    >
                      <RotateCw className="w-4 h-4" />
                      Rotate
                    </button>
                    <button
                      onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      Flip H
                    </button>
                    <button
                      onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
                    >
                      <FlipVertical className="w-4 h-4" />
                      Flip V
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
