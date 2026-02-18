<template>
  <div class="w-full">
    <!-- Top: Migrate buttons -->
    <div class="mb-4 flex items-center justify-end gap-2">
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
    </div>
    <!-- Two columns: Tier 1 (left) | Tier 2 (right) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      <!-- Column 1: Tier 1 Table -->
      <div class="min-w-0 flex flex-col">
        <div class="mb-2">
          <h3 class="text-xs font-semibold text-purple-400">Tier 1 Whitelist</h3>
        </div>
        <div class="mb-2 flex gap-2">
          <input
            v-model="newAddressTier1"
            type="text"
            placeholder="Enter wallet address"
            class="flex-1 min-w-0 px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent font-mono"
            @keydown.enter="addWallet('tier1')"
          />
          <button
            @click="addWallet('tier1')"
            :disabled="addingTier1 || !newAddressTier1.trim()"
            class="px-3 py-1.5 text-xs bg-purple-700/80 hover:bg-purple-600 text-purple-100 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {{ addingTier1 ? '...' : 'Add' }}
          </button>
        </div>
        <div class="mb-2 flex gap-2">
          <input
            v-model="searchAddressTier1"
            type="text"
            placeholder="Search by wallet address"
            class="flex-1 min-w-0 px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            @keydown.enter="searchByAddress('tier1')"
          />
          <button
            @click="searchByAddress('tier1')"
            :disabled="searchingTier1 || !searchAddressTier1.trim()"
            class="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 font-semibold rounded-lg transition disabled:opacity-50 shrink-0"
          >
            {{ searchingTier1 ? '...' : 'Search' }}
          </button>
          <button
            v-if="searchDoneTier1"
            @click="clearSearch('tier1')"
            class="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition shrink-0"
          >
            Clear
          </button>
        </div>
        <div class="bg-gray-900/80 border border-purple-500/30 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-purple-800/20">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Wallet Address</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Added Date</th>
                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-if="loading && !searchingTier1" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  <div class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Loading Tier 1 whitelist...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="searchingTier1" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  <div class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Searching...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="searchDoneTier1 && !searchResultTier1" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  Address not found in Tier 1 whitelist
                </td>
              </tr>
              <tr v-else-if="tableDataTier1.length === 0" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  No Tier 1 whitelisted wallets yet
                </td>
              </tr>
              <tr
                v-else
                v-for="(wallet, index) in tableDataTier1"
                :key="wallet.address"
                class="hover:bg-gray-800/30 transition"
              >
                <td class="px-3 py-2 text-xs text-gray-300">
                  {{ searchDoneTier1 ? 1 : (currentPageTier1 - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-3 py-2">
                  <div class="flex items-center gap-1.5">
                    <code class="text-xs text-purple-400 font-mono">{{ wallet.address }}</code>
                    <button
                      @click="copyAddress(wallet.address)"
                      class="text-gray-500 hover:text-purple-400 transition"
                      title="Copy address"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                </td>
                <td class="px-3 py-2 text-xs text-gray-400">
                  {{ wallet.addedAt ? formatDate(wallet.addedAt) : 'N/A' }}
                </td>
                <td class="px-3 py-2 text-right">
                  <button
                    @click="confirmRemove(wallet.address, 'tier1')"
                    class="px-2 py-0.5 text-xs bg-red-900/60 hover:bg-red-800/70 text-red-200 font-semibold rounded transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tier 1 Pagination -->
        <div v-if="!searchDoneTier1 && totalPagesTier1 > 1" class="px-3 py-2 bg-gray-800/30 border-t border-gray-800 flex items-center justify-between">
          <div class="text-xs text-gray-400">
            Showing {{ (currentPageTier1 - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPageTier1 * itemsPerPage, filteredWhitelistTier1.length) }} of {{ filteredWhitelistTier1.length }} wallets
          </div>
          <div class="flex items-center gap-1.5">
            <button
              @click="currentPageTier1--"
              :disabled="currentPageTier1 === 1"
              class="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-xs text-gray-400">
              Page {{ currentPageTier1 }} of {{ totalPagesTier1 }}
            </span>
            <button
              @click="currentPageTier1++"
              :disabled="currentPageTier1 === totalPagesTier1"
              class="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </div>

      <!-- Column 2: Tier 2 Table -->
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
            @keydown.enter="addWallet('tier2')"
          />
          <button
            @click="addWallet('tier2')"
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
            @keydown.enter="searchByAddress('tier2')"
          />
          <button
            @click="searchByAddress('tier2')"
            :disabled="searchingTier2 || !searchAddressTier2.trim()"
            class="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 font-semibold rounded-lg transition disabled:opacity-50 shrink-0"
          >
            {{ searchingTier2 ? '...' : 'Search' }}
          </button>
          <button
            v-if="searchDoneTier2"
            @click="clearSearch('tier2')"
            class="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition shrink-0"
          >
            Clear
          </button>
        </div>
      <div class="bg-gray-900/80 border border-blue-500/30 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-blue-800/20">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Wallet Address</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Added Date</th>
                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-if="loading && !searchingTier2" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  <div class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Loading Tier 2 whitelist...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="searchingTier2" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  <div class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Searching...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="searchDoneTier2 && !searchResultTier2" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  Address not found in Tier 2 whitelist
                </td>
              </tr>
              <tr v-else-if="tableDataTier2.length === 0" class="hover:bg-gray-800/30">
                <td colspan="4" class="px-4 py-8 text-center text-xs text-gray-400">
                  No Tier 2 whitelisted wallets yet
                </td>
              </tr>
              <tr
                v-else
                v-for="(wallet, index) in tableDataTier2"
                :key="wallet.address"
                class="hover:bg-gray-800/30 transition"
              >
                <td class="px-3 py-2 text-xs text-gray-300">
                  {{ searchDoneTier2 ? 1 : (currentPageTier2 - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-3 py-2">
                  <div class="flex items-center gap-1.5">
                    <code class="text-xs text-blue-400 font-mono">{{ wallet.address }}</code>
                    <button
                      @click="copyAddress(wallet.address)"
                      class="text-gray-500 hover:text-blue-400 transition"
                      title="Copy address"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                </td>
                <td class="px-3 py-2 text-xs text-gray-400">
                  {{ wallet.addedAt ? formatDate(wallet.addedAt) : 'N/A' }}
                </td>
                <td class="px-3 py-2 text-right">
                  <button
                    @click="confirmRemove(wallet.address, 'tier2')"
                    class="px-2 py-0.5 text-xs bg-red-900/60 hover:bg-red-800/70 text-red-200 font-semibold rounded transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tier 2 Pagination -->
        <div v-if="!searchDoneTier2 && totalPagesTier2 > 1" class="px-3 py-2 bg-gray-800/30 border-t border-gray-800 flex items-center justify-between">
          <div class="text-xs text-gray-400">
            Showing {{ (currentPageTier2 - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPageTier2 * itemsPerPage, filteredWhitelistTier2.length) }} of {{ filteredWhitelistTier2.length }} wallets
          </div>
          <div class="flex items-center gap-1.5">
            <button
              @click="currentPageTier2--"
              :disabled="currentPageTier2 === 1"
              class="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-xs text-gray-400">
              Page {{ currentPageTier2 }} of {{ totalPagesTier2 }}
            </span>
            <button
              @click="currentPageTier2++"
              :disabled="currentPageTier2 === totalPagesTier2"
              class="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  getWhitelistedWalletsTire1, 
  getWhitelistedWalletsTire2,
  getWhitelistWalletByAddressTire1,
  getWhitelistWalletByAddressTire2,
  addWalletToWhitelistTire1,
  addWalletToWhitelistTire2,
  removeFromWhitelistTire1, 
  removeFromWhitelistTire2,
  migrateMainToRedis as migrateMainToRedisApi,
  migrateRedisToMain as migrateRedisToMainApi,
  type WhitelistWallet 
} from '../../services/whitelist'

const whitelistTier1 = ref<WhitelistWallet[]>([])
const whitelistTier2 = ref<WhitelistWallet[]>([])
const loading = ref(false)
const addingTier1 = ref(false)
const addingTier2 = ref(false)
const migratingMainToRedis = ref(false)
const migratingRedisToMain = ref(false)
const newAddressTier1 = ref('')
const newAddressTier2 = ref('')
const searchAddressTier1 = ref('')
const searchAddressTier2 = ref('')
const searchResultTier1 = ref<WhitelistWallet | null>(null)
const searchResultTier2 = ref<WhitelistWallet | null>(null)
const searchDoneTier1 = ref(false)
const searchDoneTier2 = ref(false)
const searchingTier1 = ref(false)
const searchingTier2 = ref(false)
const currentPageTier1 = ref(1)
const currentPageTier2 = ref(1)
const itemsPerPage = ref(20)

// Load all whitelists
const loadAllWhitelists = async () => {
  try {
    loading.value = true
    const [tier1Wallets, tier2Wallets] = await Promise.all([
      getWhitelistedWalletsTire1(),
      getWhitelistedWalletsTire2()
    ])
    whitelistTier1.value = tier1Wallets
    whitelistTier2.value = tier2Wallets
  } catch (error: any) {
    console.error('Error loading whitelists:', error)
    if (!error.message.includes('not yet implemented')) {
      alert(`Failed to load whitelists: ${error.message}`)
    }
  } finally {
    loading.value = false
  }
}

// Add a single wallet to Tier 1 or Tier 2
const addWallet = async (tier: 'tier1' | 'tier2') => {
  const address = tier === 'tier1' ? newAddressTier1.value.trim() : newAddressTier2.value.trim()
  if (!address) return
  const tierName = tier === 'tier1' ? 'Tier 1' : 'Tier 2'
  try {
    if (tier === 'tier1') {
      addingTier1.value = true
      await addWalletToWhitelistTire1(address)
      newAddressTier1.value = ''
      const list = await getWhitelistedWalletsTire1()
      whitelistTier1.value = list
    } else {
      addingTier2.value = true
      await addWalletToWhitelistTire2(address)
      newAddressTier2.value = ''
      const list = await getWhitelistedWalletsTire2()
      whitelistTier2.value = list
    }
    alert(`Wallet added to ${tierName} whitelist.`)
  } catch (error: any) {
    console.error('Error adding wallet:', error)
    alert(error.message || `Failed to add wallet to ${tierName} whitelist.`)
  } finally {
    addingTier1.value = false
    addingTier2.value = false
  }
}

// Search by wallet address (GET tire1/:address or tire2/:address)
const searchByAddress = async (tier: 'tier1' | 'tier2') => {
  const address = tier === 'tier1' ? searchAddressTier1.value.trim() : searchAddressTier2.value.trim()
  if (!address) return
  try {
    if (tier === 'tier1') {
      searchingTier1.value = true
      searchDoneTier1.value = true
      searchResultTier1.value = null
      const result = await getWhitelistWalletByAddressTire1(address)
      searchResultTier1.value = result.found && result.data ? result.data : null
    } else {
      searchingTier2.value = true
      searchDoneTier2.value = true
      searchResultTier2.value = null
      const result = await getWhitelistWalletByAddressTire2(address)
      searchResultTier2.value = result.found && result.data ? result.data : null
    }
  } catch (error: any) {
    console.error('Search whitelist error:', error)
    alert(error.message || `Failed to search ${tier === 'tier1' ? 'Tier 1' : 'Tier 2'} whitelist`)
    if (tier === 'tier1') searchDoneTier1.value = false
    else searchDoneTier2.value = false
  } finally {
    searchingTier1.value = false
    searchingTier2.value = false
  }
}

const clearSearch = (tier: 'tier1' | 'tier2') => {
  if (tier === 'tier1') {
    searchAddressTier1.value = ''
    searchResultTier1.value = null
    searchDoneTier1.value = false
  } else {
    searchAddressTier2.value = ''
    searchResultTier2.value = null
    searchDoneTier2.value = false
  }
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
      await loadAllWhitelists()
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
      await loadAllWhitelists()
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

const filteredWhitelistTier1 = computed(() => whitelistTier1.value)
const filteredWhitelistTier2 = computed(() => whitelistTier2.value)

// Table data: when search is done, show single result or empty; otherwise show paginated list
const tableDataTier1 = computed(() => {
  if (searchDoneTier1.value) return searchResultTier1.value ? [searchResultTier1.value] : []
  return paginatedWhitelistTier1.value
})
const tableDataTier2 = computed(() => {
  if (searchDoneTier2.value) return searchResultTier2.value ? [searchResultTier2.value] : []
  return paginatedWhitelistTier2.value
})

// Paginated Tier 1 whitelist
const paginatedWhitelistTier1 = computed(() => {
  const start = (currentPageTier1.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredWhitelistTier1.value.slice(start, end)
})

// Paginated Tier 2 whitelist
const paginatedWhitelistTier2 = computed(() => {
  const start = (currentPageTier2.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredWhitelistTier2.value.slice(start, end)
})

// Total pages for Tier 1
const totalPagesTier1 = computed(() => {
  return Math.ceil(filteredWhitelistTier1.value.length / itemsPerPage.value)
})

// Total pages for Tier 2
const totalPagesTier2 = computed(() => {
  return Math.ceil(filteredWhitelistTier2.value.length / itemsPerPage.value)
})

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Copy address to clipboard
const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address)
    // Could add a toast notification here
  } catch (error) {
    console.error('Failed to copy address:', error)
  }
}

// Confirm and remove wallet from whitelist
const confirmRemove = async (address: string, tier: 'tier1' | 'tier2') => {
  const tierName = tier === 'tier1' ? 'Tier 1' : 'Tier 2'
  
  if (confirm(`Remove ${address} from ${tierName} whitelist?`)) {
    try {
      if (tier === 'tier1') {
        await removeFromWhitelistTire1(address)
        whitelistTier1.value = whitelistTier1.value.filter(w => w.address !== address)
      } else {
        await removeFromWhitelistTire2(address)
        whitelistTier2.value = whitelistTier2.value.filter(w => w.address !== address)
      }
      alert(`Wallet removed from ${tierName} whitelist successfully!`)
    } catch (error: any) {
      console.error('Error removing wallet:', error)
      alert(`Failed to remove wallet: ${error.message}`)
    }
  }
}

// Load on mount
onMounted(() => {
  loadAllWhitelists()
})
</script>
