import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRef } from 'react';
import { useScanStore } from '../../../src/stores/scanStore';
import { Button } from '../../../src/components/ui';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const setImage = useScanStore((s) => s.setImage);

  async function handleCapture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
    if (photo) {
      setImage(photo.uri);
      router.push('/(tabs)/scan/preview');
    }
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      router.push('/(tabs)/scan/preview');
    }
  }

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-5xl mb-6">📷</Text>
        <Text className="text-xl font-bold text-gray-900 text-center mb-2">
          Camera Access Needed
        </Text>
        <Text className="text-base text-gray-500 text-center mb-6">
          MenuMind needs camera access to photograph restaurant menus for analysis.
        </Text>
        <Button title="Grant Camera Access" onPress={requestPermission} />
        <View className="mt-3 w-full">
          <Button title="Use Photo Library Instead" variant="outline" onPress={handlePickImage} />
        </View>
        <View className="mt-3 w-full">
          <Button title="Go Back" variant="text" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing="back">
        {/* Guide overlay */}
        <View className="flex-1">
          {/* Top bar */}
          <View className="flex-row items-center justify-between px-4 pt-14 pb-4">
            <TouchableOpacity
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-white text-lg font-bold">✕</Text>
            </TouchableOpacity>
            <Text className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              Hold steady. Ensure good lighting.
            </Text>
            <View className="w-10" />
          </View>

          {/* Center guide frame */}
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-full aspect-[3/4] border-2 border-white/40 rounded-2xl items-center justify-end pb-6">
              <Text className="text-white/80 text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
                Center the menu in the frame
              </Text>
            </View>
          </View>

          {/* Bottom controls */}
          <View className="flex-row items-center justify-around px-8 pb-12 pt-4">
            <TouchableOpacity
              className="w-14 h-14 bg-black/50 rounded-full items-center justify-center"
              onPress={handlePickImage}
            >
              <Text className="text-2xl">🖼️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
              onPress={handleCapture}
              activeOpacity={0.7}
            >
              <View className="w-16 h-16 rounded-full bg-white" />
            </TouchableOpacity>

            <View className="w-14" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}
