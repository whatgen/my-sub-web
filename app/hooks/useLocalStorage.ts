/**
 * Local storage utilities for managing saved subscriptions
 */

const STORAGE_KEY = 'saved-subscriptions';

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    // Test if we can actually use localStorage
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    // localStorage might be disabled or in private mode
    return false;
  }
}

/**
 * Load all subscriptions from localStorage
 * @returns Array of saved subscriptions
 */
export function loadSubscriptions(): SavedSubscription[] {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return [];
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const subscriptions = JSON.parse(stored);
    return Array.isArray(subscriptions) ? subscriptions : [];
  } catch (error) {
    console.error('Failed to load subscriptions:', error);
    return [];
  }
}

/**
 * Save a new subscription to localStorage
 * @param sub - The subscription to save
 */
export function saveSubscription(sub: SavedSubscription): void {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('浏览器存储不可用，请检查浏览器设置或退出隐私模式');
    }
    
    const subscriptions = loadSubscriptions();
    
    // Check if subscription with same ID already exists
    const existingIndex = subscriptions.findIndex(s => s.id === sub.id);
    if (existingIndex !== -1) {
      throw new Error('Subscription with this ID already exists');
    }
    
    subscriptions.push(sub);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Failed to save subscription:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && 
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new Error('存储空间不足，请删除一些旧订阅或清理浏览器数据');
    }
    
    throw error;
  }
}

/**
 * Update an existing subscription
 * @param id - The ID of the subscription to update
 * @param updates - Partial subscription object with fields to update
 */
export function updateSubscription(id: string, updates: Partial<SavedSubscription>): void {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('浏览器存储不可用，请检查浏览器设置或退出隐私模式');
    }
    
    const subscriptions = loadSubscriptions();
    const index = subscriptions.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Subscription not found');
    }
    
    // Merge updates with existing subscription
    subscriptions[index] = {
      ...subscriptions[index],
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: Date.now(), // Always update timestamp
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Failed to update subscription:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && 
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new Error('存储空间不足，请删除一些旧订阅或清理浏览器数据');
    }
    
    throw error;
  }
}

/**
 * Delete a subscription by ID
 * @param id - The ID of the subscription to delete
 */
export function deleteSubscription(id: string): void {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('浏览器存储不可用，请检查浏览器设置或退出隐私模式');
    }
    
    const subscriptions = loadSubscriptions();
    const filtered = subscriptions.filter(s => s.id !== id);
    
    if (filtered.length === subscriptions.length) {
      throw new Error('Subscription not found');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete subscription:', error);
    throw error;
  }
}

/**
 * Get a subscription by ID
 * @param id - The ID of the subscription to retrieve
 * @returns The subscription if found, null otherwise
 */
export function getSubscriptionById(id: string): SavedSubscription | null {
  try {
    const subscriptions = loadSubscriptions();
    return subscriptions.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
}
