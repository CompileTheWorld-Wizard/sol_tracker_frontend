<template>
  <div class="w-full">
    <!-- Top: Migrate buttons (hidden, uncomment to show) -->
    <!-- <div class="mb-4 flex items-center justify-end gap-2">
      <button
        @click="migrateMainToRedis"
        :disabled="migratingMainToRedis || migratingRedisToMain"
        class="px-3 py-1.5 text-xs bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ migratingMainToRedis ? 'Migrating...' : 'Check and Migrate from Postgres to Redis' }}
      </button>
      <button
        @click="migrateRedisToMain"
        :disabled="migratingMainToRedis || migratingRedisToMain"
        class="px-3 py-1.5 text-xs bg-purple-700/80 hover:bg-purple-600 text-purple-100 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ migratingRedisToMain ? 'Migrating...' : 'Check and Migrate from Redis to Postgres' }}
      </button>
    </div> -->
    <!-- Tier 2 Whitelist -->
    <div class="min-w-0 flex flex-col">
        <div class="mb-2">
          <h3 class="text-xs font-semibold text-blue-400">Tier 2 Whitelist</h3>
        </div>
        <div class="mb-2 flex gap-2">
          <input
            v-model="newAddressTier2"
            type="text"
            placeholder="Enter wallet address"
            class="flex-1 min-w-0 px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono"
            @keydown.enter="addWallet()"
          />
          <button
            @click="addWallet()"
            :disabled="addingTier2 || !newAddressTier2.trim()"
            class="px-3 py-1.5 text-xs bg-blue-700/80 hover:bg-blue-600 text-blue-100 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {{ addingTier2 ? '...' : 'Add' }}
          </button>
        </div>
        <div class="mb-2 flex gap-2">
          <input
            v-model="searchAddressTier2"
            type="text"
            placeholder="Search by wallet address"
            class="flex-1 min-w-0 px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            @keydown.enter="searchByAddress()"
          />
          <button
            @click="searchByAddress()"
            :disabled="searchingTier2 || !searchAddressTier2.trim()"
            class="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 font-semibold rounded-lg transition disabled:opacity-50 shrink-0"
          >
            {{ searchingTier2 ? '...' : 'Search' }}
          </button>
          <button
            v-if="searchDoneTier2"
            @click="clearSearch()"
            class="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition shrink-0"
          >
            Clear
          </button>
        </div>
      <!-- Tier 2 creator analytics: same columns as Creator Wallets tab (API: /creators/analytics?tire2=true) -->
      <CreatorWalletsTab ref="creatorWalletsTabRef" tier2-only />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  getWhitelistWalletByAddressTire2,
  addWalletToWhitelistTire2,
  migrateMainToRedis as migrateMainToRedisApi,
  migrateRedisToMain as migrateRedisToMainApi,
  type WhitelistWallet
} from '../../services/whitelist'
import CreatorWalletsTab from './CreatorWalletsTab.vue'

const creatorWalletsTabRef = ref<InstanceType<typeof CreatorWalletsTab> | null>(null)
const migratingMainToRedis = ref(false)
const migratingRedisToMain = ref(false)
const addingTier2 = ref(false)
const newAddressTier2 = ref('')
const searchAddressTier2 = ref('')
const searchResultTier2 = ref<WhitelistWallet | null>(null)
const searchDoneTier2 = ref(false)
const searchingTier2 = ref(false)

// Add a single wallet to Tier 2 and refresh the analytics table
const addWallet = async () => {
  const address = newAddressTier2.value.trim()
  if (!address) return
  try {
    addingTier2.value = true
    await addWalletToWhitelistTire2(address)
    newAddressTier2.value = ''
    alert('Wallet added to Tier 2 whitelist.')
    await creatorWalletsTabRef.value?.loadWallets()
  } catch (error: any) {
    console.error('Error adding wallet:', error)
    alert(error.message || 'Failed to add wallet to Tier 2 whitelist.')
  } finally {
    addingTier2.value = false
  }
}

// Search by wallet address
const searchByAddress = async () => {
  const address = searchAddressTier2.value.trim()
  if (!address) return
  try {
    searchingTier2.value = true
    searchDoneTier2.value = true
    searchResultTier2.value = null
    const result = await getWhitelistWalletByAddressTire2(address)
    searchResultTier2.value = result.found && result.data ? result.data : null
  } catch (error: any) {
    console.error('Search whitelist error:', error)
    alert(error.message || 'Failed to search Tier 2 whitelist')
    searchDoneTier2.value = false
  } finally {
    searchingTier2.value = false
  }
}

const clearSearch = () => {
  searchAddressTier2.value = ''
  searchResultTier2.value = null
  searchDoneTier2.value = false
}

// Migrate Main to Redis
const migrateMainToRedis = async () => {
  if (!confirm('Migrate Main to Redis?\n\nThis will sync whitelist data from Main (Postgres) to Redis.')) return
  try {
    migratingMainToRedis.value = true
    const result = await migrateMainToRedisApi()
    if (result.success) {
      const parts: string[] = []
      if (result.message) parts.push(result.message)
      if (result.checked !== undefined) parts.push(`\n✓ Checked: ${result.checked} wallet${result.checked !== 1 ? 's' : ''}`)
      if (result.migrated !== undefined) parts.push(`✓ Migrated: ${result.migrated} wallet${result.migrated !== 1 ? 's' : ''}`)
      if (result.skipped !== undefined && result.skipped > 0) parts.push(`• Skipped: ${result.skipped} wallet${result.skipped !== 1 ? 's' : ''}`)
      alert(parts.join('\n') || 'Migrate Main to Redis completed successfully!')
      await creatorWalletsTabRef.value?.loadWallets()
    } else {
      alert(result.message || 'Migrate Main to Redis failed')
    }
  } catch (error: any) {
    console.error('Error migrating Main to Redis:', error)
    alert(`Failed to migrate Main to Redis: ${error.message}`)
  } finally {
    migratingMainToRedis.value = false
  }
}

// Migrate Redis to Main
const migrateRedisToMain = async () => {
  if (!confirm('Migrate Redis to Main?\n\nThis will sync whitelist data from Redis to Main (Postgres).')) return
  try {
    migratingRedisToMain.value = true
    const result = await migrateRedisToMainApi()
    if (result.success) {
      alert('Migrate Redis to Main completed successfully!')
      await creatorWalletsTabRef.value?.loadWallets()
    } else {
      alert(result.message || 'Migrate Redis to Main failed')
    }
  } catch (error: any) {
    console.error('Error migrating Redis to Main:', error)
    alert(`Failed to migrate Redis to Main: ${error.message}`)
  } finally {
    migratingRedisToMain.value = false
  }
}
</script>
