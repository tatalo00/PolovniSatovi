"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 10,
  folder = "listings",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + value.length > maxImages) {
      toast.error(`Maksimum ${maxImages} slika je dozvoljeno`);
      return;
    }

    setUploading(true);

    // Upload each file to Supabase Storage
    const uploadPromises = files.map(async (file) => {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`${file.name}: Slika je prevelika. Maksimalna veličina je 5MB`);
      }

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      return new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: percentComplete,
            }));
          }
        });

        xhr.addEventListener("load", () => {
          setUploadProgress((prev) => {
            const newState = { ...prev };
            delete newState[file.name];
            return newState;
          });

          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.url) {
                resolve(response.url);
              } else {
                console.error("No url in response:", response);
                reject(new Error("Upload failed: Neispravan odgovor od servera"));
              }
            } catch (error) {
              console.error("Error parsing upload response:", error);
              reject(new Error("Upload failed: Neispravan odgovor od servera"));
            }
          } else {
            let errorMessage = "Upload failed";
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.error || errorMessage;
            } catch (e) {
              // Ignore parsing errors
            }
            console.error("Upload failed:", xhr.status, errorMessage);
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener("error", () => {
          console.error("Network error during upload");
          reject(new Error("Upload failed: Greška pri povezivanju"));
        });

        xhr.open("POST", "/api/upload/supabase");
        xhr.send(formData);
      });
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.message || "Greška pri uploadu slika. Pokušajte ponovo.";
      toast.error(errorMessage);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative group">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs text-center py-1">
                Glavna slika
              </div>
            )}
          </div>
        ))}
      </div>

      {value.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Dodaj slike ({value.length}/{maxImages})
              </>
            )}
          </Button>
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">{filename}</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

