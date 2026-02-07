import { supabase } from './supabase';
import type { Scan, ScanItem, ScanSummary, DietaryProfile } from '../types';
import type { AnalysisResponse } from '../types/analysis';

export async function createScan(imageUrl: string): Promise<Scan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      image_url: imageUrl,
      status: 'uploading',
    })
    .select()
    .single();

  if (error) throw error;
  return mapScan(data);
}

export async function analyzeMenu(
  scanId: string,
  imageUrl: string,
  dietaryProfile: DietaryProfile
): Promise<AnalysisResponse> {
  const { data, error } = await supabase.functions.invoke('analyze-menu', {
    body: {
      scanId,
      imageUrl,
      dietaryProfile: {
        allergies: dietaryProfile.allergies,
        dietTypes: dietaryProfile.dietTypes,
        severityLevels: dietaryProfile.severityLevels,
        customRestrictions: dietaryProfile.customRestrictions,
      },
    },
  });

  if (error) {
    // Extract actual error from Edge Function response body
    let message = error.message;
    try {
      const context = (error as any).context;
      if (context && typeof context.json === 'function') {
        const body = await context.json();
        message = body?.error || message;
      } else if (context && typeof context === 'object') {
        message = context.error || JSON.stringify(context);
      }
    } catch {}
    throw new Error(`Analysis error: ${message}`);
  }
  return data as AnalysisResponse;
}

export async function fetchScanHistory(): Promise<ScanSummary[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('scans')
    .select('id, image_url, restaurant_name, item_count, created_at')
    .eq('user_id', user.id)
    .eq('status', 'complete')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Fetch classification counts for each scan
  const summaries: ScanSummary[] = [];
  for (const scan of data) {
    const { data: items } = await supabase
      .from('scan_items')
      .select('classification')
      .eq('scan_id', scan.id);

    const counts = { safe: 0, caution: 0, avoid: 0 };
    items?.forEach((item: { classification: string }) => {
      if (item.classification in counts) {
        counts[item.classification as keyof typeof counts]++;
      }
    });

    summaries.push({
      id: scan.id,
      imageUrl: scan.image_url,
      restaurantName: scan.restaurant_name,
      itemCount: scan.item_count || 0,
      safeCount: counts.safe,
      cautionCount: counts.caution,
      avoidCount: counts.avoid,
      createdAt: scan.created_at,
    });
  }

  return summaries;
}

export async function fetchScanDetail(scanId: string): Promise<{ scan: Scan; items: ScanItem[] }> {
  const { data: scanData, error: scanError } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single();

  if (scanError) throw scanError;

  const { data: itemsData, error: itemsError } = await supabase
    .from('scan_items')
    .select('*')
    .eq('scan_id', scanId)
    .order('sort_order', { ascending: true });

  if (itemsError) throw itemsError;

  return {
    scan: mapScan(scanData),
    items: (itemsData || []).map(mapScanItem),
  };
}

export async function uploadMenuPhoto(uri: string, scanId: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/${scanId}.jpg`;

  // Read the file as blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('menu-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  // Update scan with image URL
  await supabase
    .from('scans')
    .update({ image_url: path, status: 'analyzing' })
    .eq('id', scanId);

  return path;
}

export async function deleteAllUserData(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Delete storage objects
  const { data: files } = await supabase.storage
    .from('menu-photos')
    .list(`${user.id}`);

  if (files?.length) {
    const paths = files.map(f => `${user.id}/${f.name}`);
    await supabase.storage.from('menu-photos').remove(paths);
  }

  // Delete profile (cascades to scans -> scan_items via foreign keys)
  await supabase.from('profiles').delete().eq('user_id', user.id);
  await supabase.from('scans').delete().eq('user_id', user.id);

  // Delete auth user
  await supabase.auth.signOut();
}

function mapScan(row: Record<string, unknown>): Scan {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    imageUrl: row.image_url as string | null,
    status: row.status as Scan['status'],
    restaurantName: row.restaurant_name as string | null,
    languageDetected: row.language_detected as string | null,
    rawApiResponse: row.raw_api_response as Record<string, unknown> | null,
    errorCode: row.error_code as string | null,
    errorMessage: row.error_message as string | null,
    itemCount: row.item_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapScanItem(row: Record<string, unknown>): ScanItem {
  return {
    id: row.id as string,
    scanId: row.scan_id as string,
    dishName: row.dish_name as string,
    originalName: row.original_name as string | null,
    classification: row.classification as ScanItem['classification'],
    confidence: row.confidence as ScanItem['confidence'],
    likelyIngredients: (row.likely_ingredients as string[]) || [],
    allergensDetected: (row.allergens_detected as string[]) || [],
    modificationSuggestions: (row.modification_suggestions as string[]) || [],
    serverPrompts: (row.server_prompts as string[]) || [],
    reasoning: row.reasoning as string | null,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
  };
}
