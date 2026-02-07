import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_DIMENSION = 2048;
const QUALITY = 0.8;

export async function compressImage(uri: string): Promise<string> {
  try {
    const image = ImageManipulator.manipulate(uri);
    image.resize({ width: MAX_DIMENSION });
    const ref = await image.renderAsync();
    const result = await ref.saveAsync({
      compress: QUALITY,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    // If compression fails, return original URI
    return uri;
  }
}
