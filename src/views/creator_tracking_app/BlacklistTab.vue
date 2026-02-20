<template>
  <div class="w-full min-w-0 flex flex-col">
    <h3 class="text-xs font-semibold text-red-400 mb-2">Blacklist</h3>
    <div class="mb-2 flex gap-2 items-center flex-wrap">
      <input
        v-model="newAddress"
        type="text"
        placeholder="Wallet address"
        class="flex-1 min-w-[180px] px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
        :disabled="adding"
        @keydown.enter.prevent="addWallet"
      />
      <input
        v-model="newNickname"
        type="text"
        placeholder="Nickname"
        class="w-32 px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        :disabled="adding"
        @keydown.enter.prevent="addWallet"
      />
      <button
        @click="addWallet"
        :disabled="adding || !newAddress.trim()"
        class="px-3 py-1.5 text-xs bg-red-700/80 hover:bg-red-600 text-red-100 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        {{ adding ? 'Adding...' : 'Add' }}
      </button>
    </div>
    <div class="mb-2 flex gap-2">
      <input
        v-model="searchAddress"
        type="text"
        placeholder="Search by wallet address"
        class="flex-1 min-w-0 px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
        @keydown.enter.prevent="searchByAddress"
      />
      <button
        @click="searchByAddress"
        :disabled="searching || !searchAddress.trim()"
        class="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 font-semibold rounded-lg transition disabled:opacity-50 shrink-0"
      >
        {{ searching ? '...' : 'Search' }}
      </button>
      <button
        v-if="searchDone"
        @click="clearSearch"
        class="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition shrink-0"
      >
        Clear
      </button>
    </div>
    <!-- Blacklist analytics table: same as Whitelist Tier 2 (API: /creators/analytics?blacklist=true) -->
    <CreatorWalletsTab
      ref="creatorWalletsTabRef"
      blacklist-only
      :search-wallet-address="searchWalletAddressForAnalytics"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { addBlacklistWallet } from '../../services/blacklist'
import CreatorWalletsTab from './CreatorWalletsTab.vue'

const creatorWalletsTabRef = ref<InstanceType<typeof CreatorWalletsTab> | null>(null)
const adding = ref(false)
const newAddress = ref('')
const newNickname = ref('')
const searchAddress = ref('')
const searchWalletAddressForAnalytics = ref<string | null>(null)
const searchDone = ref(false)
const searching = ref(false)

async function addWallet() {
  const address = newAddress.value.trim()
  if (!address || adding.value) return
  try {
    adding.value = true
    const nickname = newNickname.value.trim() || null
    await addBlacklistWallet(address, nickname)
    newAddress.value = ''
    newNickname.value = ''
    await creatorWalletsTabRef.value?.loadWallets()
  } catch (e: any) {
    alert(e.message || 'Failed to add wallet to blacklist')
  } finally {
    adding.value = false
  }
}

function searchByAddress() {
  const q = searchAddress.value.trim()
  if (!q) return
  searchDone.value = true
  searchWalletAddressForAnalytics.value = q
  searching.value = true
  creatorWalletsTabRef.value?.loadWallets().finally(() => { searching.value = false })
}

function clearSearch() {
  searchAddress.value = ''
  searchWalletAddressForAnalytics.value = null
  searchDone.value = false
}
</script>
