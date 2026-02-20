<template>
  <div class="w-full min-w-0 flex flex-col">
    <h3 class="text-xs font-semibold text-red-400 mb-2">Blacklist</h3>
    <div class="mb-3 flex gap-2 items-center flex-wrap">
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
    <div class="border border-gray-700 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="bg-gray-800/80 text-gray-400">
              <th class="text-left px-3 py-2 font-semibold">Address</th>
              <th class="text-left px-3 py-2 font-semibold">Nickname</th>
              <th class="text-right px-3 py-2 font-semibold w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="border-t border-gray-700">
              <td colspan="3" class="px-3 py-4 text-center text-gray-500">Loading...</td>
            </tr>
            <tr v-else-if="!wallets.length" class="border-t border-gray-700">
              <td colspan="3" class="px-3 py-6 text-center text-gray-500">No blacklisted wallets.</td>
            </tr>
            <tr
              v-for="w in wallets"
              :key="w.address"
              class="border-t border-gray-700 hover:bg-gray-800/50"
            >
              <td class="px-3 py-2 font-mono text-gray-300 break-all">{{ w.address }}</td>
              <td class="px-3 py-2 text-gray-400">{{ w.nickname || '—' }}</td>
              <td class="px-3 py-2 text-right">
                <button
                  type="button"
                  @click="removeWallet(w.address)"
                  :disabled="removingAddress === w.address"
                  class="px-2 py-0.5 text-xs bg-red-900/60 hover:bg-red-800/70 text-red-200 font-semibold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ removingAddress === w.address ? '...' : 'Remove' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getBlacklistWallets,
  addBlacklistWallet,
  removeBlacklistWallet,
  type BlacklistWallet
} from '../../services/blacklist'

const wallets = ref<BlacklistWallet[]>([])
const loading = ref(true)
const adding = ref(false)
const newAddress = ref('')
const newNickname = ref('')
const removingAddress = ref<string | null>(null)

async function loadWallets() {
  loading.value = true
  try {
    wallets.value = await getBlacklistWallets()
  } catch (e: any) {
    console.error('Error loading blacklist:', e)
    wallets.value = []
    alert(e.message || 'Failed to load blacklist')
  } finally {
    loading.value = false
  }
}

async function addWallet() {
  const address = newAddress.value.trim()
  if (!address || adding.value) return
  try {
    adding.value = true
    const nickname = newNickname.value.trim() || null
    await addBlacklistWallet(address, nickname)
    newAddress.value = ''
    newNickname.value = ''
    await loadWallets()
  } catch (e: any) {
    alert(e.message || 'Failed to add wallet to blacklist')
  } finally {
    adding.value = false
  }
}

async function removeWallet(address: string) {
  if (removingAddress.value) return
  if (!confirm(`Remove ${address} from blacklist?`)) return
  try {
    removingAddress.value = address
    await removeBlacklistWallet(address)
    await loadWallets()
  } catch (e: any) {
    alert(e.message || 'Failed to remove wallet from blacklist')
  } finally {
    removingAddress.value = null
  }
}

onMounted(() => loadWallets())
</script>
