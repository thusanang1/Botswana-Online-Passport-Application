"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, X, FileImage, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MultiCameraCaptureProps {
  onCapture: (type: "selfie" | "idFront" | "idBack", imageData: string) => void
  initialImages?: {
    selfie: string | null
    idFront: string | null
    idBack: string | null
  }
}

export function MultiCameraCapture({ onCapture, initialImages }: MultiCameraCaptureProps) {
  const [activeTab, setActiveTab] = useState("selfie")
  const [captureMethod, setCaptureMethod] = useState<Record<string, "camera" | "upload" | null>>({
    selfie: null,
    idFront: null,
    idBack: null,
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [images, setImages] = useState({
    selfie: initialImages?.selfie || null,
    idFront: initialImages?.idFront || null,
    idBack: initialImages?.idBack || null,
  })

  const startCamera = async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: activeTab === "selfie" ? "user" : "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      setStream(mediaStream)
      setIsCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please ensure camera permissions are granted or upload an image instead.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraActive(false)

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvas.toDataURL("image/png")

        setImages((prev) => ({
          ...prev,
          [activeTab]: imageData,
        }))

        onCapture(activeTab as "selfie" | "idFront" | "idBack", imageData)
        stopCamera()
        setCaptureMethod((prev) => ({
          ...prev,
          [activeTab]: null,
        }))
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null)

    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setFileError("File size exceeds 2MB limit. Please choose a smaller file.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string

        setImages((prev) => ({
          ...prev,
          [activeTab]: imageData,
        }))

        onCapture(activeTab as "selfie" | "idFront" | "idBack", imageData)
        setCaptureMethod((prev) => ({
          ...prev,
          [activeTab]: null,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const removeImage = (type: "selfie" | "idFront" | "idBack") => {
    setImages((prev) => ({
      ...prev,
      [type]: null,
    }))

    // Pass null or empty string to parent component
    onCapture(type, "")
  }

  const handleTabChange = (value: string) => {
    stopCamera()
    setActiveTab(value)
    setFileError(null)
    setCaptureMethod((prev) => ({
      ...prev,
      [value]: null,
    }))
  }

  const handleCaptureMethodChange = (method: "camera" | "upload") => {
    setCaptureMethod((prev) => ({
      ...prev,
      [activeTab]: method,
    }))

    if (method === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
  }

  const resetCaptureMethod = () => {
    setCaptureMethod((prev) => ({
      ...prev,
      [activeTab]: null,
    }))
    stopCamera()
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const getDocumentTitle = () => {
    switch (activeTab) {
      case "selfie":
        return "Selfie Photo"
      case "idFront":
        return "National ID (Front)"
      case "idBack":
        return "National ID (Back)"
      default:
        return ""
    }
  }

  const getDocumentInstructions = () => {
    switch (activeTab) {
      case "selfie":
        return "Take a clear photo of your face looking directly at the camera"
      case "idFront":
        return "Take a clear photo of the front side of your national ID card"
      case "idBack":
        return "Take a clear photo of the back side of your national ID card"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="selfie">Selfie Photo</TabsTrigger>
          <TabsTrigger value="idFront">ID Front</TabsTrigger>
          <TabsTrigger value="idBack">ID Back</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">{getDocumentTitle()}</h3>
                  <p className="text-sm text-muted-foreground">{getDocumentInstructions()}</p>
                </div>

                {images[activeTab as keyof typeof images] ? (
                  <div className="relative">
                    <img
                      src={images[activeTab as keyof typeof images] || "/placeholder.svg"}
                      alt={getDocumentTitle()}
                      className="mx-auto aspect-auto h-auto max-h-64 w-auto rounded-md object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-0 top-0 h-8 w-8 rounded-full"
                      onClick={() => removeImage(activeTab as "selfie" | "idFront" | "idBack")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : captureMethod[activeTab] === "camera" ? (
                  <div className="overflow-hidden rounded-md border">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="mx-auto aspect-auto h-auto max-h-64 w-auto object-cover"
                    />
                  </div>
                ) : captureMethod[activeTab] === "upload" ? (
                  <div className="flex flex-col items-center justify-center rounded-md border bg-muted/50 p-8">
                    <FileImage className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="mb-4 text-center text-sm text-muted-foreground">
                      Click the button below to select a file
                    </p>
                    <Button onClick={triggerFileUpload}>
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </Button>
                    {fileError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{fileError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border bg-muted/10 p-6">
                    <div className="text-center">
                      <h4 className="mb-4 font-medium">How would you like to provide this document?</h4>
                      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button onClick={() => handleCaptureMethodChange("camera")} className="flex-1 sm:max-w-[200px]">
                          <Camera className="mr-2 h-4 w-4" />
                          Use Camera
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCaptureMethodChange("upload")}
                          className="flex-1 sm:max-w-[200px]"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Note: Uploaded files must be less than 2MB in size
                      </p>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                {captureMethod[activeTab] === "camera" && isCameraActive && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" onClick={captureImage} className="bg-green-600 hover:bg-green-700">
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>
                    <Button type="button" variant="outline" onClick={resetCaptureMethod}>
                      Cancel
                    </Button>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
    </div>
  )
}

