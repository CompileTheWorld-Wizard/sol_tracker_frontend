<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <!-- Main Content -->
    <main class="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Control Panel -->
      <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-2 mb-2">
        <!-- Status Badge -->
        <div class="mb-2">
          <div 
            :class="[
              'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
              isTracking ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            ]"
          >
            {{ isTracking ? '🟢 Running' : '⚫ Stopped' }}
          </div>
        </div>

        <!-- Tracking Addresses Section -->
        <div class="mb-2">
          <h3 class="text-xs font-semibold text-gray-300 mb-1">📍 Tracking Addresses</h3>
          <div class="flex gap-1.5 mb-1.5">
            <input
              v-model="newAddress"
              @keyup.enter="addAddress"
              type="text"
              placeholder="Enter Solana address..."
              class="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="addAddress"
              class="px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded font-semibold text-xs hover:from-blue-500 hover:to-blue-600 transition"
            >
              ➕ Add
            </button>
          </div>
          <!-- Address List -->
          <div class="flex flex-wrap gap-1.5">
            <div
              v-for="(address, index) in addresses"
              :key="index"
              class="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono text-gray-200 flex items-center gap-1.5"
            >
              <span>{{ address.substring(0, 8) }}...{{ address.substring(address.length - 6) }}</span>
              <button
                @click="removeAddress(index)"
                class="text-red-400 hover:text-red-300 text-xs"
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Start/Stop Buttons -->
        <div class="flex gap-1.5">
          <button
            @click="handleStartTracking"
            :disabled="isTracking || addresses.length === 0"
            class="px-2 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded font-semibold text-xs hover:from-green-500 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▶️ Start Tracking
          </button>
          <button
            @click="handleStopTracking"
            :disabled="!isTracking"
            class="px-2 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-semibold text-xs hover:from-red-500 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏹️ Stop Tracking
          </button>
        </div>
      </div>

      <!-- Whitelist Configuration -->
      <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-2 mb-2">
        <div 
          @click="whitelistExpanded = !whitelistExpanded"
          class="flex justify-between items-center cursor-pointer mb-1.5"
        >
          <h3 class="text-xs font-semibold text-gray-300">✅ Whitelist (Track Specific Addresses)</h3>
          <span class="text-gray-400 text-xs">{{ whitelistExpanded ? '▼' : '▶' }}</span>
        </div>
        <div v-show="whitelistExpanded" class="mt-2">
          <p class="text-xs text-gray-500 mb-2">
            Add addresses to track with custom time periods. You can specify when to start tracking and for how long.
          </p>
          <div class="space-y-2 mb-2">
            <!-- Address Input -->
            <input
              v-model="newWhitelistAddress"
              type="text"
              placeholder="Solana address..."
              class="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <!-- Date and Period Selection Row -->
            <div class="flex gap-1.5">
              <div class="flex-1">
                <label class="text-xs text-gray-400 mb-0.5 block">Start Tracking Date</label>
                <input
                  v-model="newWhitelistStartDate"
                  type="datetime-local"
                  class="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div class="w-24">
                <label class="text-xs text-gray-400 mb-0.5 block">Period</label>
                <input
                  v-model.number="newWhitelistPeriodValue"
                  type="number"
                  min="1"
                  placeholder="1"
                  class="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div class="w-24">
                <label class="text-xs text-gray-400 mb-0.5 block">Unit</label>
                <select
                  v-model="newWhitelistPeriodUnit"
                  class="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
              
              <div class="flex items-end">
                <button
                  @click="addWhitelistAddress"
                  class="px-2 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded font-semibold text-xs hover:from-green-500 hover:to-green-600 transition"
                >
                  ➕ Add
                </button>
              </div>
            </div>
          </div>
          
          <!-- Whitelist Address List -->
          <div class="space-y-1.5">
            <div
              v-for="(item, index) in whitelistAddresses"
              :key="index"
              class="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 flex items-center justify-between gap-2"
            >
              <div class="flex-1 font-mono break-all">
                <span class="text-blue-400">{{ item.token_address }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-400 whitespace-nowrap">
                <span class="text-xs">📅 {{ formatDate(item.start_track_datetime) }}</span>
                <span class="text-xs">⏱️ {{ item.period }} {{ item.unit }}</span>
                <span v-if="item.is_active !== undefined" :class="['text-xs', item.is_active ? 'text-green-400' : 'text-gray-500']">
                  {{ item.is_active ? '✓ Active' : '○ Expired' }}
                </span>
                <button
                  @click="removeWhitelistAddress(index)"
                  class="text-red-400 hover:text-red-300 text-xs ml-1"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skip Tokens Configuration -->
      <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-2 mb-2">
        <div 
          @click="skipTokensExpanded = !skipTokensExpanded"
          class="flex justify-between items-center cursor-pointer mb-1.5"
        >
          <h3 class="text-xs font-semibold text-gray-300">🚫 Skip Tokens (For Analysis)</h3>
          <span class="text-gray-400 text-xs">{{ skipTokensExpanded ? '▼' : '▶' }}</span>
        </div>
        <div v-show="skipTokensExpanded" class="mt-2">
          <p class="text-xs text-gray-500 mb-2">
            Tokens in this list will be skipped when analyzing dev buy amounts. Add common tokens like SOL, USDC, USDT, etc.
          </p>
          <div class="flex gap-1.5 mb-1.5">
            <input
              v-model="newSkipTokenMint"
              type="text"
              placeholder="Token mint address..."
              class="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              v-model="newSkipTokenSymbol"
              type="text"
              placeholder="Symbol (optional)"
              class="w-28 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="addSkipToken"
              class="px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded font-semibold text-xs hover:from-blue-500 hover:to-blue-600 transition"
            >
              ➕ Add
            </button>
          </div>
          <!-- Skip Tokens List -->
          <div class="flex flex-wrap gap-1.5">
            <div
              v-for="token in skipTokens"
              :key="token.mint_address"
              class="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 flex items-center gap-1.5"
            >
              <span>{{ token.symbol || token.mint_address.substring(0, 8) }}...</span>
              <button
                @click="removeSkipToken(token.mint_address)"
                class="text-red-400 hover:text-red-300 text-xs"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-2">
        <div class="flex border-b border-gray-800 mb-2">
          <button
            @click="activeTab = 'dashboard'"
            :class="[
              'px-2 py-1 text-xs font-semibold transition',
              activeTab === 'dashboard' 
                ? 'border-b-2 border-blue-500 text-blue-400' 
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            📊 Dashboard
          </button>
          <button
            @click="activeTab = 'transactions'"
            :class="[
              'px-2 py-1 text-xs font-semibold transition',
              activeTab === 'transactions' 
                ? 'border-b-2 border-blue-500 text-blue-400' 
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            📊 Recent Transactions
          </button>
        </div>

        <!-- Dashboard Tab -->
        <div v-show="activeTab === 'dashboard'" class="space-y-2">
          <DashboardTab 
            :wallet-address="selectedWallet"
            @wallet-selected="selectedWallet = $event"
          />
        </div>

        <!-- Transactions Tab -->
        <div v-show="activeTab === 'transactions'" class="space-y-2">
          <TransactionsTab />
        </div>

      </div>
    </main>

    <!-- Password Change Modal -->
    <PasswordChangeModal 
      v-if="showPasswordModal"
      @close="showPasswordModal = false"
    />

    <!-- Sticky Action Buttons (Bottom Right) - Icon-only with hover expansion -->
    <div class="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      <!-- Streaming Period Display -->
      <div class="group relative" v-if="isTracking">
        <div class="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center cursor-default">
          <span class="text-purple-400 font-semibold text-xs">{{ getStreamingPeriod() }}</span>
        </div>
        <span class="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
          <span class="text-purple-400">Streaming:</span> <span class="text-green-400">{{ getStreamingPeriodDetailed() }}</span>
        </span>
      </div>
      
      <!-- SOL Price Display -->
      <div class="group relative">
        <div class="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center cursor-default">
          <span class="text-green-400 font-semibold text-sm">$</span>
        </div>
        <span class="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
          <span class="text-blue-400">SOL</span> <span class="text-green-400">{{ solPrice || '--' }}</span> <span class="text-gray-500">USD</span>
        </span>
      </div>
      
      <!-- Header Stats -->
      <div class="group relative">
        <div class="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center cursor-default">
          <span class="text-gray-200 font-semibold text-sm">{{ totalTransactions || 0 }}</span>
        </div>
        <span class="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
          Transactions: <span class="text-green-400">{{ totalTransactions || 0 }}</span> / Wallets: <span class="text-blue-400">{{ trackedAddresses || 0 }}</span>
        </span>
      </div>
      
      <div class="group relative">
        <button
          @click="showPasswordModal = true"
          class="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 flex items-center justify-center shadow-lg"
          title="Change Password"
        >
          <span class="w-5 h-5 inline-flex items-center justify-center" v-html="processSvg(changePasswordIconSvg)"></span>
        </button>
        <span class="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
          Change Password
        </span>
      </div>
      
      <div class="group relative">
        <button
          @click="handleLogout"
          class="w-12 h-12 bg-red-600/90 hover:bg-red-600 text-white rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center justify-center shadow-lg"
          title="Logout"
        >
          <span class="w-5 h-5 inline-flex items-center justify-center" v-html="processSvg(logoutIconSvg)"></span>
        </button>
        <span class="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-red-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
          Logout
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  fetchTrackingStatus, 
  setAddresses, 
  startTracking, 
  stopTracking,
  fetchSkipTokens,
  addSkipToken as addSkipTokenAPI,
  removeSkipToken as removeSkipTokenAPI,
  fetchSolPrice,
  addToWhitelist as addToWhitelistAPI,
  removeFromWhitelist as removeFromWhitelistAPI
} from '../../services/tradeTracking'
import { logout } from '../../services/auth'
import DashboardTab from './DashboardTab.vue'
import TransactionsTab from './TransactionsTab.vue'
import PasswordChangeModal from './PasswordChangeModal.vue'
// Import SVG files as raw strings
import changePasswordIconSvg from '../../icons/change-password.svg?raw'
import logoutIconSvg from '../../icons/logout.svg?raw'

const router = useRouter()

const addresses = ref<string[]>([])
const newAddress = ref('')
const isTracking = ref(false)
const totalTransactions = ref(0)
const trackedAddresses = ref(0)
const solPrice = ref<string | null>(null)
const skipTokens = ref<any[]>([])
const newSkipTokenMint = ref('')
const newSkipTokenSymbol = ref('')
const skipTokensExpanded = ref(false)
const activeTab = ref('dashboard')
const selectedWallet = ref('')
const showPasswordModal = ref(false)
const streamingStartTime = ref<number | null>(null)
const currentTime = ref(Date.now())

// Whitelist state
const whitelistExpanded = ref(false)
const whitelistAddresses = ref<Array<{
  id?: number
  token_address: string
  start_track_datetime: string
  period: number
  unit: string
  end_track_datetime?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}>>([])
const newWhitelistAddress = ref('')
const newWhitelistStartDate = ref('')
const newWhitelistPeriodValue = ref(7)
const newWhitelistPeriodUnit = ref<string>('days')

let statusInterval: NodeJS.Timeout | null = null
let solPriceInterval: NodeJS.Timeout | null = null
let timeUpdateInterval: NodeJS.Timeout | null = null

const loadStatus = async () => {
  const result = await fetchTrackingStatus()
  if (result.success) {
    isTracking.value = result.data.isRunning || false
    addresses.value = result.data.addresses || []
    trackedAddresses.value = addresses.value.length
    totalTransactions.value = result.data.totalTransactions || 0
    
    // Load whitelist from status response
    if (result.data.whitelist && Array.isArray(result.data.whitelist)) {
      whitelistAddresses.value = result.data.whitelist
    }
    
    // Set streaming start time from API response
    if (result.data.startedTime) {
      streamingStartTime.value = new Date(result.data.startedTime).getTime()
    } else {
      streamingStartTime.value = null
    }
  }
}

const loadSkipTokens = async () => {
  const result = await fetchSkipTokens()
  if (result.success) {
    skipTokens.value = result.data || []
  }
}

const updateSolPrice = async () => {
  const result = await fetchSolPrice()
  if (result.success && result.price !== null) {
    solPrice.value = parseFloat(result.price.toString()).toFixed(2)
  }
}

// Format streaming period - compact version
const getStreamingPeriod = (): string => {
  if (!streamingStartTime.value) return '--'
  
  const elapsed = Math.floor((currentTime.value - streamingStartTime.value) / 1000)
  
  if (elapsed < 60) {
    return `${elapsed}s`
  } else if (elapsed < 3600) {
    const minutes = Math.floor(elapsed / 60)
    return `${minutes}m`
  } else if (elapsed < 86400) {
    const hours = Math.floor(elapsed / 3600)
    return `${hours}h`
  } else {
    const days = Math.floor(elapsed / 86400)
    return `${days}d`
  }
}

// Format streaming period - detailed version for hover
const getStreamingPeriodDetailed = (): string => {
  if (!streamingStartTime.value) return 'Not streaming'
  
  const elapsed = Math.floor((currentTime.value - streamingStartTime.value) / 1000)
  
  const days = Math.floor(elapsed / 86400)
  const hours = Math.floor((elapsed % 86400) / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60
  
  const parts: string[] = []
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)
  
  return parts.join(' ')
}

const addAddress = async () => {
  const address = newAddress.value.trim()
  if (!address) return
  
  if (address.length < 32 || address.length > 44) {
    alert('Invalid Solana address format')
    return
  }
  
  if (addresses.value.includes(address)) {
    alert('Address already added')
    return
  }
  
  if (addresses.value.length >= 5) {
    alert('Maximum 5 addresses allowed')
    return
  }
  
  addresses.value.push(address)
  newAddress.value = ''

  const setResult = await setAddresses(addresses.value)
  if (!setResult.success) {
    alert('Failed to set addresses: ' + setResult.error)
    return
  }
}

const removeAddress = async (index: number) => {
  addresses.value.splice(index, 1)
  const setResult = await setAddresses(addresses.value)
  if (!setResult.success) {
    alert('Failed to set addresses: ' + setResult.error)
    return
  }
}

const handleStartTracking = async () => {
  if (addresses.value.length === 0) {
    alert('Please add at least one address')
    return
  }
  
  // Set addresses first
  const setResult = await setAddresses(addresses.value)
  if (!setResult.success) {
    alert('Failed to set addresses: ' + setResult.error)
    return
  }
  
  // Start tracking
  const startResult = await startTracking()
  if (startResult.success) {
    isTracking.value = true
    await loadStatus()
  } else {
    alert('Failed to start tracking: ' + startResult.error)
  }
}
// Stop tracking
const handleStopTracking = async () => {
  const result = await stopTracking()
  if (result.success) {
    isTracking.value = false
    await loadStatus()
  } else {
    alert('Failed to stop tracking: ' + result.error)
  }
}

const addSkipToken = async () => {
  const mint = newSkipTokenMint.value.trim()
  if (!mint) return
  
  const result = await addSkipTokenAPI(mint, newSkipTokenSymbol.value.trim() || undefined)
  if (result.success) {
    await loadSkipTokens()
    newSkipTokenMint.value = ''
    newSkipTokenSymbol.value = ''
  } else {
    alert('Failed to add skip token: ' + result.error)
  }
}

const removeSkipToken = async (mintAddress: string) => {
  const result = await removeSkipTokenAPI(mintAddress)
  if (result.success) {
    await loadSkipTokens()
  } else {
    alert('Failed to remove skip token: ' + result.error)
  }
}

// Whitelist management functions
const addWhitelistAddress = async () => {
  const address = newWhitelistAddress.value.trim()
  if (!address) {
    alert('Please enter an address')
    return
  }
  
  if (address.length < 32 || address.length > 44) {
    alert('Invalid Solana address format')
    return
  }
  
  if (whitelistAddresses.value.some(item => item.token_address === address)) {
    alert('Address already in whitelist')
    return
  }
  
  if (!newWhitelistStartDate.value) {
    alert('Please select a start date')
    return
  }
  
  if (!newWhitelistPeriodValue.value || newWhitelistPeriodValue.value < 1) {
    alert('Please enter a valid period value')
    return
  }
  
  // Convert datetime-local to ISO 8601 format
  const startDatetime = new Date(newWhitelistStartDate.value).toISOString()
  
  const result = await addToWhitelistAPI(
    address,
    startDatetime,
    newWhitelistPeriodValue.value,
    newWhitelistPeriodUnit.value
  )
  
  if (result.success) {
    // Reload status to get updated whitelist
    await loadStatus()
    
    // Reset form
    newWhitelistAddress.value = ''
    newWhitelistStartDate.value = ''
    newWhitelistPeriodValue.value = 7
    newWhitelistPeriodUnit.value = 'days'
  } else {
    alert('Failed to add to whitelist: ' + result.error)
  }
}

const removeWhitelistAddress = async (index: number) => {
  const item = whitelistAddresses.value[index]
  const result = await removeFromWhitelistAPI(item.token_address)
  
  if (result.success) {
    // Reload status to get updated whitelist
    await loadStatus()
  } else {
    alert('Failed to remove from whitelist: ' + result.error)
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([loadStatus(), loadSkipTokens(), updateSolPrice()])
  
  // Update status every 10 seconds (this will also refresh whitelist)
  statusInterval = setInterval(loadStatus, 10000)
  
  // Update SOL price every 7 seconds
  solPriceInterval = setInterval(updateSolPrice, 7000)
  
  // Update current time every second for streaming period
  timeUpdateInterval = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (statusInterval) clearInterval(statusInterval)
  if (solPriceInterval) clearInterval(solPriceInterval)
  if (timeUpdateInterval) clearInterval(timeUpdateInterval)
})

const processSvg = (svg: string, sizeClass: string = 'w-4 h-4') => {
  return svg.replace(
    '<svg',
    `<svg class="${sizeClass}" style="display: block;"`
  )
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>
