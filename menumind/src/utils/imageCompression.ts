import * as ImageManipulator from 'expo-image-manipulator';

const MAX_DIMENSION = 2048;
const QUALITY = 0.8;

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    {
      compress: QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  return result.uri;
}
