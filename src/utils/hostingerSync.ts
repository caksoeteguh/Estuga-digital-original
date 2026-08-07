export const HOSTINGER_BASE = window.location.hostname === 'localhost' || window.location.hostname.includes('run.app') ? 'https://kelas6.estugadigital.online' : '';

export const syncToHostinger = async (key: string, data: any) => {
  if (!HOSTINGER_BASE) return false;
  try {
    const response = await fetch(`${HOSTINGER_BASE}/api.php?action=save&key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(`Failed to sync ${key} to Hostinger:`, error);
    return false;
  }
};

export const runFullHostingerBackup = async (allStates: Record<string, any>) => {
  let successCount = 0;
  const keys = Object.keys(allStates);
  for (const key of keys) {
    const success = await syncToHostinger(key, allStates[key]);
    if (success) successCount++;
  }
  return successCount === keys.length;
};

