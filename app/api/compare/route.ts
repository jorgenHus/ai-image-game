import { NextResponse } from "next/server";
import sharp from "sharp";

async function fetchImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function compareImages(
  image1Buffer: Buffer,
  image2Buffer: Buffer
): Promise<number> {
  // Resize both images to the same dimensions for comparison
  const size = { width: 224, height: 224 };

  const processImage = async (buffer: Buffer) => {
    const pixels = await sharp(buffer)
      .resize(size.width, size.height, { fit: "cover" })
      .grayscale() // Convert to grayscale for simpler comparison
      .raw()
      .toBuffer();

    return pixels;
  };

  const [pixels1, pixels2] = await Promise.all([
    processImage(image1Buffer),
    processImage(image2Buffer),
  ]);

  // Calculate mean squared error (MSE)
  let totalDiff = 0;
  for (let i = 0; i < pixels1.length; i++) {
    const diff = pixels1[i] - pixels2[i];
    totalDiff += diff * diff;
  }
  const mse = totalDiff / pixels1.length;

  // Convert MSE to a similarity score (0-100)
  // Lower MSE means more similar images
  const maxMSE = 255 * 255; // Maximum possible MSE for 8-bit grayscale images
  const similarity = Math.max(
    0,
    Math.min(100, Math.round((1 - mse / maxMSE) * 100))
  );

  return similarity;
}

export async function POST(req: Request) {
  try {
    const { targetImage, generatedImage } = await req.json();

    if (!targetImage || !generatedImage) {
      throw new Error("Missing image URLs");
    }

    console.log("Fetching images...");
    const [targetBuffer, generatedBuffer] = await Promise.all([
      fetchImage(targetImage),
      fetchImage(generatedImage),
    ]);

    console.log("Comparing images...");
    const score = await compareImages(targetBuffer, generatedBuffer);

    console.log("Comparison score:", score);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error comparing images:", error);
    return NextResponse.json(
      {
        error: "Failed to compare images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
